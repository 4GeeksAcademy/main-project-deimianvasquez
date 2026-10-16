import type {
	Appointment,
	CMEReport,
	Claim,
	Clinician,
	Location,
} from "../types/models";

function roundTo(value: number, decimalPlaces: number): number {
	const factor = 10 ** decimalPlaces;
	return Math.round(value * factor) / factor;
}

function calculateDenialPercentage(claims: Claim[]): number {
	if (claims.length === 0) {
		return 0;
	}

	const deniedCount = claims.filter((claim: Claim): boolean => claim.status === "denied").length;
	return roundTo((deniedCount / claims.length) * 100, 2);
}

function groupBy<T>(items: T[], getKey: (item: T) => string): Record<string, T[]> {
	return items.reduce<Record<string, T[]>>(
		(groups: Record<string, T[]>, item: T): Record<string, T[]> => {
			const key = getKey(item);
			(groups[key] ??= []).push(item);
			return groups;
		},
		{},
	);
}

export function calculateDenialRate(claims: Claim[]): number {
	if (claims.length === 0) {
		return 0;
	}

	return calculateDenialPercentage(claims);
}

export function denialRateByPayer(claims: Claim[]): Record<string, number> {
	const claimsByPayer = groupBy(claims, (claim: Claim): string => claim.payerName);

	return Object.fromEntries(
		Object.entries(claimsByPayer).map(
			([payerName, payerClaims]: [string, Claim[]]): [string, number] => [
				payerName,
				calculateDenialPercentage(payerClaims),
			],
		),
	);
}

export function denialRateByLocation(claims: Claim[]): Record<string, number> {
	const claimsByLocation = groupBy(claims, (claim: Claim): string => claim.locationId);

	return Object.fromEntries(
		Object.entries(claimsByLocation).map(
			([locationId, locationClaims]: [string, Claim[]]): [string, number] => [
				locationId,
				calculateDenialPercentage(locationClaims),
			],
		),
	);
}

export function flagHighDenialPayers(claims: Claim[], threshold: number = 8): string[] {
	return Object.entries(denialRateByPayer(claims))
		.filter(([, denialRate]: [string, number]): boolean => denialRate > threshold)
		.map(([payerName]: [string, number]): string => payerName);
}

function parseDateAsUtc(date: string): number {
	return Date.parse(`${date}T00:00:00Z`);
}

function isNoShowInLocationAndWeek(
	appointment: Appointment,
	locationId: string,
	weekStart: number,
	weekEnd: number,
): boolean {
	const scheduledDate = parseDateAsUtc(appointment.scheduledDate);
	return (
		appointment.locationId === locationId &&
		appointment.status === "no_show" &&
		scheduledDate >= weekStart &&
		scheduledDate <= weekEnd
	);
}

function calculateAppointmentsCost(appointments: Appointment[], location: Location): number {
	return appointments.reduce(
		(total: number, appointment: Appointment): number =>
			total + location.averageConsultationFee[appointment.serviceType],
		0,
	);
}

export function calculateNoShowCost(
	appointments: Appointment[],
	location: Location,
	weekEndingDate: string,
): number {
	const weekEnd = parseDateAsUtc(weekEndingDate);
	if (!Number.isFinite(weekEnd)) {
		return 0;
	}
	const weekStart = weekEnd - 6 * 24 * 60 * 60 * 1000;

	const qualifyingAppointments = appointments.filter(
		(appointment: Appointment): boolean =>
			isNoShowInLocationAndWeek(appointment, location.locationId, weekStart, weekEnd),
	);
	const totalCost = calculateAppointmentsCost(qualifyingAppointments, location);

	return roundTo(totalCost, 2);
}

export function noShowRateByLocation(appointments: Appointment[]): Record<string, number> {
	const appointmentsByLocation = groupBy(
		appointments,
		(appointment: Appointment): string => appointment.locationId,
	);

	return Object.fromEntries(
		Object.entries(appointmentsByLocation).map(
			([locationId, locationAppointments]: [string, Appointment[]]): [string, number] => {
				const noShowCount = locationAppointments.filter(
					(appointment: Appointment): boolean => appointment.status === "no_show",
				).length;
				return [locationId, roundTo((noShowCount / locationAppointments.length) * 100, 2)];
			},
		),
	);
}

export function flagHighNoShowLocations(
	appointments: Appointment[],
	threshold: number = 20,
): string[] {
	return Object.entries(noShowRateByLocation(appointments))
		.filter(([, noShowRate]: [string, number]): boolean => noShowRate > threshold)
		.map(([locationId]: [string, number]): string => locationId);
}

function calendarDaysBetween(startDate: string, endDate: string): number {
	const millisecondsPerDay = 24 * 60 * 60 * 1000;
	return Math.ceil((parseDateAsUtc(endDate) - parseDateAsUtc(startDate)) / millisecondsPerDay);
}

function getCMEYearEndDate(cmeYearStartDate: string): string {
	const yearEnd = new Date(parseDateAsUtc(cmeYearStartDate));
	yearEnd.setUTCFullYear(yearEnd.getUTCFullYear() + 1);
	yearEnd.setUTCDate(yearEnd.getUTCDate() - 1);
	return yearEnd.toISOString().slice(0, 10);
}

function getCMEComplianceStatus(
	clinician: Clinician,
	asOfDate: string,
	percentComplete: number,
	daysRemainingInCycle: number,
): CMEReport["complianceStatus"] {
	if (clinician.cmeHoursLogged >= clinician.cmeHoursRequired) {
		return "complete";
	}

	if (daysRemainingInCycle < 0) {
		return "overdue";
	}

	const cycleStart = parseDateAsUtc(clinician.cmeYearStartDate);
	const cycleEnd = parseDateAsUtc(getCMEYearEndDate(clinician.cmeYearStartDate));
	const currentDate = parseDateAsUtc(asOfDate);
	const cycleDuration = cycleEnd - cycleStart;
	const elapsedRatio = cycleDuration <= 0
		? 1
		: Math.min(1, Math.max(0, (currentDate - cycleStart) / cycleDuration));
	const percentOfCycleElapsed = elapsedRatio * 100;

	return percentOfCycleElapsed - percentComplete > 15 ? "at_risk" : "on_track";
}

function calculateCMEPercentComplete(hoursLogged: number, hoursRequired: number): number {
	return hoursRequired === 0 ? 100 : roundTo((hoursLogged / hoursRequired) * 100, 1);
}

function createCMEReportEntry(clinician: Clinician, asOfDate: string): CMEReport {
	const hoursRequired = clinician.cmeHoursRequired;
	const hoursLogged = clinician.cmeHoursLogged;
	const percentComplete = calculateCMEPercentComplete(hoursLogged, hoursRequired);
	const daysRemainingInCycle = calendarDaysBetween(
		asOfDate,
		getCMEYearEndDate(clinician.cmeYearStartDate),
	);

	return {
		clinicianId: clinician.clinicianId,
		fullName: `${clinician.firstName} ${clinician.lastName}`,
		role: clinician.role,
		locationId: clinician.locationId,
		hoursRequired,
		hoursLogged,
		hoursRemaining: Math.max(0, hoursRequired - hoursLogged),
		percentComplete,
		daysRemainingInCycle,
		complianceStatus: getCMEComplianceStatus(
			clinician,
			asOfDate,
			percentComplete,
			daysRemainingInCycle,
		),
		licenceExpiryDate: clinician.licenceExpiryDate,
		licenceDaysRemaining: calendarDaysBetween(asOfDate, clinician.licenceExpiryDate),
	};
}

export function generateCMEReport(clinicians: Clinician[], asOfDate: string): CMEReport[] {
	return clinicians.map(
		(clinician: Clinician): CMEReport => createCMEReportEntry(clinician, asOfDate),
	);
}

export function getCliniciansAtRisk(clinicians: Clinician[], asOfDate: string): Clinician[] {
	const cliniciansAtRiskIds = new Set(
		generateCMEReport(clinicians, asOfDate)
			.filter(
				(report: CMEReport): boolean =>
					report.complianceStatus === "at_risk" || report.complianceStatus === "overdue",
			)
			.map((report: CMEReport): string => report.clinicianId),
	);

	return clinicians.filter(
		(clinician: Clinician): boolean => cliniciansAtRiskIds.has(clinician.clinicianId),
	);
}

export function getCliniciansWithExpiringLicences(
	clinicians: Clinician[],
	asOfDate: string,
	daysThreshold: number,
): Clinician[] {
	return clinicians.filter((clinician: Clinician): boolean => {
		const daysUntilExpiry = calendarDaysBetween(asOfDate, clinician.licenceExpiryDate);
		return daysUntilExpiry >= 0 && daysUntilExpiry <= daysThreshold;
	});
}
