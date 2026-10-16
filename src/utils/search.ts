import type { Claim, Clinician } from "../types/models";

export function findClaimById(claims: Claim[], claimId: string): Claim | null {
	return claims.find((claim: Claim): boolean => claim.claimId === claimId) ?? null;
}

export function findClinicianById(
	clinicians: Clinician[],
	clinicianId: string,
): Clinician | null {
	return clinicians.find(
		(clinician: Clinician): boolean => clinician.clinicianId === clinicianId,
	) ?? null;
}

export function binarySearchClaimById(sortedClaims: Claim[], targetId: string): number {
	if (sortedClaims.length === 0 || targetId === "") {
		return -1;
	}

	let left = 0;
	let right = sortedClaims.length - 1;

	while (left <= right) {
		const middle = Math.floor((left + right) / 2);
		const comparison = sortedClaims[middle].claimId.localeCompare(targetId);

		if (comparison === 0) {
			return middle;
		}

		if (comparison < 0) {
			left = middle + 1;
		} else {
			right = middle - 1;
		}
	}

	return -1;
}
