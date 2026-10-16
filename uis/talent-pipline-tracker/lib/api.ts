import type { ApiRecord, Candidate, PaginatedRecordsResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const ACCEPT_JSON = { Accept: "application/json" };

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export function getApiUrl(): string {
  if (!API_URL) throw new ApiError("No se encontró NEXT_PUBLIC_API_URL. Configura la URL de la API en .env.local.");
  return API_URL;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecordList(payload: unknown): ApiRecord[] {
  if (Array.isArray(payload)) return payload.filter(isRecord) as ApiRecord[];
  if (!isRecord(payload)) return [];
  for (const key of ["records", "data", "results", "candidates"]) {
    const nested = payload[key];
    if (Array.isArray(nested)) return asRecordList(nested);
    if (isRecord(nested)) {
      for (const nestedKey of ["records", "results", "candidates"]) {
        if (Array.isArray(nested[nestedKey])) return asRecordList(nested[nestedKey]);
      }
    }
  }
  return [];
}

function paginationInfo(payload: unknown, fallbackPageSize: number): number | null {
  if (!isRecord(payload)) return null;
  const meta = isRecord(payload.meta) ? payload.meta : {};
  const pagination = isRecord(payload.pagination) ? payload.pagination : isRecord(meta.pagination) ? meta.pagination : meta;
  const value = pagination.totalPages ?? pagination.total_pages ?? pagination.lastPage ?? pagination.last_page ?? payload.totalPages ?? payload.total_pages;
  const totalPages = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (Number.isInteger(totalPages) && totalPages > 0) return totalPages;
  const total = pagination.total ?? pagination.totalCount ?? pagination.total_count ?? payload.total ?? payload.totalCount ?? payload.total_count;
  const pageSize = pagination.perPage ?? pagination.per_page ?? pagination.limit ?? payload.limit;
  const parsedTotal = typeof total === "number" ? total : typeof total === "string" ? Number(total) : NaN;
  const parsedSize = typeof pageSize === "number" ? pageSize : typeof pageSize === "string" ? Number(pageSize) : fallbackPageSize;
  return Number.isFinite(parsedTotal) && parsedTotal >= 0 && parsedSize > 0 ? Math.max(1, Math.ceil(parsedTotal / parsedSize)) : null;
}

function firstText(record: ApiRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function normalizeCandidate(record: ApiRecord, index: number): Candidate {
  const id = firstText(record, ["id", "_id", "uuid"]) || String(index + 1);
  return {
    id,
    name: firstText(record, ["full_name", "name", "fullName", "candidate_name"]) || `Candidato #${id}`,
    email: firstText(record, ["email", "mail"]),
    phone: firstText(record, ["phone", "phone_number", "telephone"]),
    position: firstText(record, ["position", "job_title", "jobTitle", "role", "vacancy"]) || "Vacante no especificada",
    status: firstText(record, ["status", "application_status", "applicationStatus"]) || "En revisión",
    stage: firstText(record, ["stage", "current_stage", "currentStage", "pipeline_stage"]) || "Sin etapa",
    date: firstText(record, ["created_at", "createdAt", "date", "applied_at", "updated_at"]),
    raw: record,
  };
}

export async function fetchCandidates(signal?: AbortSignal): Promise<Candidate[]> {
  const baseUrl = `${getApiUrl()}/records`;
  const pageSize = 100;
  const records: ApiRecord[] = [];
  const seenBatches = new Set<string>();
  let totalPages: number | null = null;
  let observedPageSize: number | null = null;

  for (let page = 1; page <= 10000; page += 1) {
    const url = new URL(baseUrl);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(pageSize));
    const response = await fetch(url, { cache: "no-store", headers: ACCEPT_JSON, signal });
    if (!response.ok) throw new ApiError(`La API respondió con un error (${response.status}) al cargar la página ${page}.`, response.status);
    const payload: PaginatedRecordsResponse | ApiRecord[] = await response.json();
    const batch = asRecordList(payload);
    totalPages = paginationInfo(payload, batch.length) ?? totalPages;
    if (batch.length === 0) break;
    observedPageSize ??= batch.length;
    const signature = JSON.stringify(batch.map((record) => record.id ?? record._id ?? record.uuid ?? record));
    if (seenBatches.has(signature)) break;
    seenBatches.add(signature);
    records.push(...batch);
    if (totalPages !== null ? page >= totalPages : batch.length < observedPageSize) break;
  }

  const uniqueRecords = new Map<string, ApiRecord>();
  records.forEach((record, index) => uniqueRecords.set(firstText(record, ["id", "_id", "uuid"]) || `record-${index}`, record));
  return [...uniqueRecords.values()].map(normalizeCandidate);
}

export async function fetchCandidate(id: string, signal?: AbortSignal): Promise<ApiRecord> {
  const response = await fetch(`${getApiUrl()}/records/${encodeURIComponent(id)}`, { cache: "no-store", headers: ACCEPT_JSON, signal });
  if (!response.ok) throw new ApiError(response.status === 404 ? "No encontramos una candidatura con ese identificador." : `La API respondió con un error (${response.status}).`, response.status);
  const payload: unknown = await response.json();
  if (!isRecord(payload)) throw new ApiError("La API devolvió una respuesta que no pudimos interpretar.");
  for (const key of ["record", "candidate", "data"]) if (isRecord(payload[key])) return payload[key] as ApiRecord;
  return payload as ApiRecord;
}

export async function fetchCandidateNotes(id: string, signal?: AbortSignal): Promise<ApiRecord[]> {
  const response = await fetch(`${getApiUrl()}/records/${encodeURIComponent(id)}/notes`, { headers: ACCEPT_JSON, signal });
  if (!response.ok) throw new ApiError(`La API respondió con un error (${response.status}).`, response.status);
  return asRecordList(await response.json());
}
