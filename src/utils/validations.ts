import type { Appointment, Claim, Clinician } from "../types/models";

export interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings?: string[];
}

function isValidDateString(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}

	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidDateTimeString(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(value)) {
		return false;
	}

	return !Number.isNaN(Date.parse(value));
}

function isValidPatientId(patientId: string): boolean {
	return /^HC-[A-Za-z0-9]{6}$/.test(patientId);
}

export function validateClaim(
	claim: Claim,
	knownLocationIds: string[],
	asOfDate: string,
): ValidationResult {
	const errors: string[] = [];

	if (!isValidPatientId(claim.patientId)) {
		errors.push("patientId must match the format HC- followed by 6 alphanumeric characters.");
	}
	if (!knownLocationIds.includes(claim.locationId)) {
		errors.push("locationId must be one of the known clinic IDs.");
	}
	if (!Number.isFinite(claim.claimAmount) || claim.claimAmount <= 0) {
		errors.push("claimAmount must be a number greater than 0.");
	}
	if (!isValidDateString(claim.submissionDate)) {
		errors.push("submissionDate must be a valid ISO 8601 calendar date.");
	} else if (isValidDateString(asOfDate) && claim.submissionDate > asOfDate) {
		errors.push("submissionDate must not be in the future.");
	}
	if (claim.status === "denied" && !claim.denialReason) {
		errors.push('denialReason is required when status is "denied".');
	}

	return { valid: errors.length === 0, errors };
}

export function validateAppointment(
	appointment: Appointment,
	knownLocationIds: string[],
): ValidationResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!knownLocationIds.includes(appointment.locationId)) {
		errors.push("locationId must be one of the known clinic IDs.");
	}
	if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(appointment.scheduledTime)) {
		errors.push('scheduledTime must be a valid 24-hour time in "HH:MM" format.');
	}
	if (!isValidDateString(appointment.scheduledDate)) {
		errors.push("scheduledDate must be a valid ISO 8601 calendar date.");
	}
	if (appointment.status === "no_show" && !appointment.noShowReason?.trim()) {
		warnings.push('noShowReason should be provided when status is "no_show".');
	}
	if (appointment.confirmedAt !== undefined && !isValidDateTimeString(appointment.confirmedAt)) {
		errors.push("confirmedAt must be a valid ISO 8601 date-time string.");
	}

	return { valid: errors.length === 0, errors, warnings };
}

export function validateClinician(
	clinician: Clinician,
	asOfDate: string,
): ValidationResult {
	const errors: string[] = [];
	const validRoles: string[] = ["physician", "nurse_practitioner", "nurse", "medical_assistant"];

	if (!Number.isFinite(clinician.cmeHoursRequired) || clinician.cmeHoursRequired < 0) {
		errors.push("cmeHoursRequired must be a number greater than or equal to 0.");
	}
	if (!Number.isFinite(clinician.cmeHoursLogged) || clinician.cmeHoursLogged < 0) {
		errors.push("cmeHoursLogged must be a number greater than or equal to 0.");
	}
	if (!validRoles.includes(clinician.role)) {
		errors.push("role must be one of the supported clinician roles.");
	}
	if (!isValidDateString(clinician.licenceExpiryDate)) {
		errors.push("licenceExpiryDate must be a valid ISO 8601 calendar date.");
	} else if (isValidDateString(asOfDate) && clinician.licenceExpiryDate < asOfDate) {
		errors.push("licenceExpiryDate is expired.");
	}
	if (!isValidDateString(clinician.cmeYearStartDate)) {
		errors.push("cmeYearStartDate must be a valid ISO 8601 calendar date.");
	}

	return { valid: errors.length === 0, errors };
}

export function isDenialRateAboveThreshold(rate: number, threshold: number = 8): boolean {
	return rate > threshold;
}

export function isNoShowRateAboveThreshold(rate: number, threshold: number = 20): boolean {
	return rate > threshold;
}
