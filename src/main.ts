import { sampleAppointments, sampleClaims, sampleClinicians, sampleLocations } from "./data/sampleData";
import type { Appointment, Claim, CMEReport, Clinician, Location } from "./types/models";
import {
	filterAppointmentsByStatus,
	filterClaims,
	sortAppointmentsByDate,
	sortClaimsById,
} from "./utils/collections";
import {
	binarySearchClaimById,
	findClaimById,
	findClinicianById,
} from "./utils/search";
import {
	calculateDenialRate,
	calculateNoShowCost,
	denialRateByPayer,
	flagHighDenialPayers,
	flagHighNoShowLocations,
	generateCMEReport,
	noShowRateByLocation,
} from "./utils/transformations";

function getElement<T extends HTMLElement>(id: string): T {
	const element = document.getElementById(id);
	if (element === null) {
		throw new Error(`No se encontró el elemento requerido: ${id}`);
	}
	return element as T;
}

function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (character: string): string => {
		const entities: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#039;",
		};
		return entities[character];
	});
}

function getStatusLabel(status: string): string {
	const labels: Record<string, string> = {
		submitted: "Enviado",
		approved: "Aprobado",
		denied: "Denegado",
		pending: "Pendiente",
		appealed: "Apelado",
	};
	return labels[status] ?? status;
}

function getAppointmentStatusLabel(status: Appointment["status"]): string {
	const labels: Record<Appointment["status"], string> = {
		scheduled: "Programada",
		confirmed: "Confirmada",
		completed: "Completada",
		no_show: "No-show",
		cancelled: "Cancelada",
	};
	return labels[status];
}

function getComplianceStyles(status: CMEReport["complianceStatus"]): string {
	const styles: Record<CMEReport["complianceStatus"], string> = {
		on_track: "bg-emerald-50 text-emerald-700",
		at_risk: "bg-amber-50 text-amber-700",
		overdue: "bg-rose-50 text-rose-700",
		complete: "bg-sky-50 text-sky-700",
	};
	return styles[status];
}

function setStatusMessage(message: string): void {
	getElement<HTMLSpanElement>("status-message").textContent = message;
}

function populateSelectOptions(locations: Location[], claims: Claim[]): void {
	const locationOptions = locations.map(
		(location: Location): string =>
			`<option value="${escapeHtml(location.locationId)}">${escapeHtml(location.name)}</option>`,
	).join("");
	getElement<HTMLSelectElement>("filter-location").insertAdjacentHTML("beforeend", locationOptions);
	getElement<HTMLSelectElement>("noshow-location").innerHTML = locationOptions;

	const payers = [...new Set(claims.map((claim: Claim): string => claim.payerName))].sort();
	getElement<HTMLSelectElement>("filter-payer").insertAdjacentHTML(
		"beforeend",
		payers.map((payer: string): string => `<option value="${escapeHtml(payer)}">${escapeHtml(payer)}</option>`).join(""),
	);
}

function renderClaims(claims: Claim[], direction: "asc" | "desc"): void {
	const orderedClaims = sortClaimsById(claims, direction);
	const body = getElement<HTMLTableSectionElement>("claims-table-body");
	body.innerHTML = orderedClaims.map((claim: Claim): string => {
		const statusColor = claim.status === "denied"
			? "bg-rose-50 text-rose-700"
			: claim.status === "approved"
				? "bg-emerald-50 text-emerald-700"
				: "bg-slate-100 text-slate-700";
		return `<tr class="hover:bg-slate-50"><td class="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-slate-700">${escapeHtml(claim.claimId)}</td><td class="whitespace-nowrap px-4 py-3">${escapeHtml(claim.payerName)}</td><td class="whitespace-nowrap px-4 py-3 font-mono text-xs">${escapeHtml(claim.locationId)}</td><td class="whitespace-nowrap px-4 py-3"><span class="rounded-full px-2 py-1 text-xs font-semibold ${statusColor}">${escapeHtml(getStatusLabel(claim.status))}</span></td><td class="whitespace-nowrap px-4 py-3 text-right tabular-nums">$${claim.claimAmount.toFixed(2)}</td></tr>`;
	}).join("");
	getElement<HTMLParagraphElement>("claims-empty").classList.toggle("hidden", orderedClaims.length > 0);
	getElement<HTMLElement>("claim-count").textContent = String(orderedClaims.length);
}

function getFilteredAppointments(
	appointments: Appointment[],
	selectedStatuses: Appointment["status"][],
): Appointment[] {
	return selectedStatuses.length === 0
		? [...appointments]
		: filterAppointmentsByStatus(appointments, selectedStatuses);
}

function renderAppointments(appointments: Appointment[], direction: "asc" | "desc"): void {
	const orderedAppointments = sortAppointmentsByDate(appointments, direction);
	getElement<HTMLTableSectionElement>("appointments-table-body").innerHTML = orderedAppointments
		.map((appointment: Appointment): string =>
			`<tr class="hover:bg-slate-50"><td class="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold">${escapeHtml(appointment.appointmentId)}</td><td class="whitespace-nowrap px-4 py-3 tabular-nums">${escapeHtml(appointment.scheduledDate)} · ${escapeHtml(appointment.scheduledTime)}</td><td class="whitespace-nowrap px-4 py-3 font-mono text-xs">${escapeHtml(appointment.locationId)}</td><td class="whitespace-nowrap px-4 py-3">${escapeHtml(appointment.serviceType.replaceAll("_", " "))}</td><td class="whitespace-nowrap px-4 py-3">${escapeHtml(getAppointmentStatusLabel(appointment.status))}</td></tr>`,
		)
		.join("");
	getElement<HTMLParagraphElement>("appointments-empty").classList.toggle("hidden", orderedAppointments.length > 0);
}

interface ClaimFilters {
	locationId: string;
	status: string;
	payerName: string;
	serviceType: string;
}

function getFilteredClaims(claims: Claim[], filters: ClaimFilters): Claim[] {
	return filterClaims(claims, {
		...(filters.locationId === "" ? {} : { locationId: filters.locationId }),
		...(filters.status === "" ? {} : { status: filters.status as Claim["status"] }),
		...(filters.payerName === "" ? {} : { payerName: filters.payerName }),
		...(filters.serviceType === "" ? {} : { serviceType: filters.serviceType as Claim["serviceType"] }),
	});
}

function renderSearchResult(title: string, record: Claim | Clinician | null): void {
	const container = getElement<HTMLDivElement>("search-result");
	container.classList.remove("hidden");
	if (record === null) {
		container.innerHTML = `<p class="font-semibold text-rose-700">${escapeHtml(title)} no encontrado</p>`;
		return;
	}
	container.innerHTML = `<p class="mb-2 font-semibold text-slate-900">${escapeHtml(title)} encontrado</p><pre class="overflow-auto text-xs leading-5 text-slate-600">${escapeHtml(JSON.stringify(record, null, 2))}</pre>`;
}

function buildPayerReport(claims: Claim[]): string {
	const rates = denialRateByPayer(claims);
	const flaggedPayers = new Set(flagHighDenialPayers(claims));
	const output = Object.entries(rates).map(([payer, rate]: [string, number]): string =>
		`${payer}: ${rate.toFixed(2)}%${flaggedPayers.has(payer) ? "  ⚠ supera 8%" : ""}`,
	);
	output.unshift(`Tasa global: ${calculateDenialRate(claims).toFixed(2)}%`, "");
	return output.join("\n");
}

function buildNoShowReport(
	appointments: Appointment[],
	locations: Location[],
	locationId: string,
	weekEndingDate: string,
): string {
	const rates = noShowRateByLocation(appointments);
	const flaggedLocations = new Set(flagHighNoShowLocations(appointments));
	const location = locations.find(
		(candidateLocation: Location): boolean => candidateLocation.locationId === locationId,
	);
	const lines = Object.entries(rates).map(([id, rate]: [string, number]): string =>
		`${id}: ${rate.toFixed(2)}%${flaggedLocations.has(id) ? "  ⚠ supera 20%" : ""}`,
	);
	if (location !== undefined && weekEndingDate !== "") {
		const cost = calculateNoShowCost(appointments, location, weekEndingDate);
		lines.push("", `Costo no-show (${location.name}, semana al ${weekEndingDate}): $${cost.toFixed(2)}`);
	}
	return lines.join("\n");
}

function renderCMEReport(clinicians: Clinician[], asOfDate: string): void {
	if (asOfDate === "") {
		setStatusMessage("Selecciona la fecha de corte del reporte CME");
		return;
	}
	const reports = generateCMEReport(clinicians, asOfDate);
	const body = getElement<HTMLTableSectionElement>("cme-table-body");
	body.innerHTML = reports.map((report: CMEReport): string =>
		`<tr class="hover:bg-slate-50"><td class="whitespace-nowrap px-3 py-3"><span class="block font-medium">${escapeHtml(report.fullName)}</span><span class="text-xs text-slate-500">${escapeHtml(report.clinicianId)} · ${escapeHtml(report.role)}</span></td><td class="whitespace-nowrap px-3 py-3 tabular-nums">${report.hoursLogged} / ${report.hoursRequired} h</td><td class="whitespace-nowrap px-3 py-3 tabular-nums">${report.percentComplete.toFixed(1)}%</td><td class="whitespace-nowrap px-3 py-3 tabular-nums">${report.daysRemainingInCycle} días</td><td class="whitespace-nowrap px-3 py-3"><span class="rounded-full px-2 py-1 text-xs font-semibold ${getComplianceStyles(report.complianceStatus)}">${escapeHtml(report.complianceStatus.replaceAll("_", " "))}</span></td><td class="whitespace-nowrap px-3 py-3 tabular-nums">${report.licenceDaysRemaining} días</td></tr>`,
	).join("");
	getElement<HTMLParagraphElement>("cme-empty").classList.toggle("hidden", reports.length > 0);
	setStatusMessage(`Reporte CME generado · ${reports.length} clínicos`);
}

function attachEventListeners(
	claims: Claim[],
	appointments: Appointment[],
	clinicians: Clinician[],
	locations: Location[],
): void {
	getElement<HTMLFormElement>("claim-filter-form").addEventListener("submit", (event: SubmitEvent): void => {
		event.preventDefault();
		renderClaims(getFilteredClaims(claims, readClaimFilters()), readClaimSortDirection());
		setStatusMessage("Filtros aplicados");
	});

	getElement<HTMLButtonElement>("clear-filters").addEventListener("click", (): void => {
		getElement<HTMLFormElement>("claim-filter-form").reset();
		renderClaims(claims, readClaimSortDirection());
		setStatusMessage("Filtros limpiados");
	});

	getElement<HTMLSelectElement>("claim-sort").addEventListener("change", (): void => {
		renderClaims(getFilteredClaims(claims, readClaimFilters()), readClaimSortDirection());
	});
	getElement<HTMLSelectElement>("appointment-status-filter").addEventListener("change", (): void => {
		renderAppointments(
			getFilteredAppointments(appointments, readAppointmentStatuses()),
			readAppointmentSortDirection(),
		);
	});
	getElement<HTMLSelectElement>("appointment-sort").addEventListener("change", (): void => {
		renderAppointments(
			getFilteredAppointments(appointments, readAppointmentStatuses()),
			readAppointmentSortDirection(),
		);
	});

	getElement<HTMLButtonElement>("claim-search-button").addEventListener("click", (): void => {
		const claimId = getElement<HTMLInputElement>("claim-search-input").value.trim();
		const claim = findClaimById(claims, claimId);
		const sortedClaims = sortClaimsById(claims, "asc");
		const index = claimId === "" ? -1 : binarySearchClaimById(sortedClaims, claimId);
		renderSearchResult("Claim", claim);
		setStatusMessage(claim === null ? "Claim no encontrado" : `Claim encontrado · posición ordenada ${index}`);
	});

	getElement<HTMLInputElement>("claim-search-input").addEventListener("keydown", (event: KeyboardEvent): void => {
		if (event.key === "Enter") getElement<HTMLButtonElement>("claim-search-button").click();
	});

	getElement<HTMLButtonElement>("clinician-search-button").addEventListener("click", (): void => {
		const clinicianId = getElement<HTMLInputElement>("clinician-search-input").value.trim();
		renderSearchResult("Clínico", findClinicianById(clinicians, clinicianId));
		setStatusMessage("Búsqueda de clínico completada");
	});

	getElement<HTMLInputElement>("clinician-search-input").addEventListener("keydown", (event: KeyboardEvent): void => {
		if (event.key === "Enter") getElement<HTMLButtonElement>("clinician-search-button").click();
	});

	getElement<HTMLButtonElement>("payer-report-button").addEventListener("click", (): void => {
		getElement<HTMLPreElement>("payer-report").textContent = buildPayerReport(claims);
		setStatusMessage("Reporte de denegaciones generado");
	});
	getElement<HTMLButtonElement>("noshow-report-button").addEventListener("click", (): void => {
		const locationId = getElement<HTMLSelectElement>("noshow-location").value;
		const weekEndingDate = getElement<HTMLInputElement>("noshow-week-ending").value;
		getElement<HTMLPreElement>("noshow-report").textContent = buildNoShowReport(
			appointments,
			locations,
			locationId,
			weekEndingDate,
		);
		setStatusMessage("Reporte de no-shows generado");
	});
	getElement<HTMLButtonElement>("cme-report-button").addEventListener("click", (): void => {
		renderCMEReport(clinicians, getElement<HTMLInputElement>("report-date").value);
	});
}

function readClaimFilters(): ClaimFilters {
	return {
		locationId: getElement<HTMLSelectElement>("filter-location").value,
		status: getElement<HTMLSelectElement>("filter-status").value,
		payerName: getElement<HTMLSelectElement>("filter-payer").value,
		serviceType: getElement<HTMLSelectElement>("filter-service").value,
	};
}

function readClaimSortDirection(): "asc" | "desc" {
	return getElement<HTMLSelectElement>("claim-sort").value === "desc" ? "desc" : "asc";
}

function readAppointmentStatuses(): Appointment["status"][] {
	return Array.from(
		getElement<HTMLSelectElement>("appointment-status-filter").selectedOptions,
		(option: HTMLOptionElement): Appointment["status"] => option.value as Appointment["status"],
	);
}

function readAppointmentSortDirection(): "asc" | "desc" {
	return getElement<HTMLSelectElement>("appointment-sort").value === "desc" ? "desc" : "asc";
}

function initialiseDashboard(
	claims: Claim[],
	appointments: Appointment[],
	clinicians: Clinician[],
	locations: Location[],
	currentDate: string,
): void {
	populateSelectOptions(locations, claims);
	getElement<HTMLElement>("appointment-count").textContent = String(appointments.length);
	getElement<HTMLElement>("denial-rate").textContent = `${calculateDenialRate(claims).toFixed(2)}%`;
	getElement<HTMLInputElement>("report-date").value = currentDate;
	getElement<HTMLInputElement>("noshow-week-ending").value = appointments
		.map((appointment: Appointment): string => appointment.scheduledDate)
		.sort()
		.at(-1) ?? currentDate;
	renderClaims(claims, readClaimSortDirection());
	renderAppointments(appointments, readAppointmentSortDirection());
	attachEventListeners(claims, appointments, clinicians, locations);
}

initialiseDashboard(
	sampleClaims,
	sampleAppointments,
	sampleClinicians,
	sampleLocations,
	new Date().toISOString().slice(0, 10),
);
