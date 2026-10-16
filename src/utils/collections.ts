import type { Appointment, AppointmentStatus, Claim } from "../types/models";

export function filterClaims(
	claims: Claim[],
	filters: Partial<Pick<Claim, "locationId" | "status" | "payerName" | "serviceType">>,
): Claim[] {
	return claims.filter(
		(claim: Claim): boolean =>
			(filters.locationId === undefined || claim.locationId === filters.locationId) &&
			(filters.status === undefined || claim.status === filters.status) &&
			(filters.payerName === undefined || claim.payerName === filters.payerName) &&
			(filters.serviceType === undefined || claim.serviceType === filters.serviceType),
	);
}

export function filterAppointmentsByStatus(
	appointments: Appointment[],
	status: AppointmentStatus[],
): Appointment[] {
	return appointments.filter(
		(appointment: Appointment): boolean => status.includes(appointment.status),
	);
}

export function sortClaimsById(claims: Claim[], direction: "asc" | "desc"): Claim[] {
	const directionMultiplier = direction === "asc" ? 1 : -1;

	return [...claims].sort(
		(firstClaim: Claim, secondClaim: Claim): number =>
			firstClaim.claimId.localeCompare(secondClaim.claimId) * directionMultiplier,
	);
}

export function sortAppointmentsByDate(
	appointments: Appointment[],
	direction: "asc" | "desc",
): Appointment[] {
	const directionMultiplier = direction === "asc" ? 1 : -1;

	return [...appointments].sort(
		(firstAppointment: Appointment, secondAppointment: Appointment): number =>
			firstAppointment.scheduledDate.localeCompare(secondAppointment.scheduledDate) *
			directionMultiplier,
	);
}
