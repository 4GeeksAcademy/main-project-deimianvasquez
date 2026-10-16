"use client";

import { useState, type FormEvent } from "react";
import type { ApiRecord, CandidateFormPayload } from "@/types/api";

type CandidateValues = {
  name: string;
  email: string;
  phone: string;
  position: string;
  linkedin: string;
  resume: string;
  years_experience: string;
  status: string;
  stage: string;
  applied_at: string;
};

type Props = {
  mode: "create" | "edit";
  initialRecord?: ApiRecord;
  onSuccess?: (record: ApiRecord) => void;
  onCancel?: () => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

function readField(record: ApiRecord | undefined, keys: string[]): string {
  for (const key of keys) {
    const value = record?.[key];
    if (typeof value === "string" || typeof value === "number") return String(value);
  }
  return "";
}

function initialValues(record?: ApiRecord): CandidateValues {
  return {
    name: readField(record, ["full_name", "name", "fullName", "candidate_name"]),
    email: readField(record, ["email", "mail"]),
    phone: readField(record, ["phone", "phone_number", "telephone"]),
    position: readField(record, ["position", "job_title", "jobTitle", "role", "vacancy"]),
    linkedin: readField(record, ["linkedin", "linkedin_url", "linkedinUrl", "linkedin_profile"]),
    resume: readField(record, ["resume", "resume_url", "resumeUrl", "cv", "cv_url", "cvUrl"]),
    years_experience: readField(record, ["years_experience", "yearsExperience", "experience_years", "experienceYears"]),
    status: readField(record, ["status", "application_status", "applicationStatus"]) || "En revisión",
    stage: readField(record, ["stage", "current_stage", "currentStage", "pipeline_stage"]),
    applied_at: readField(record, ["applied_at", "appliedAt", "application_date", "created_at", "createdAt", "date"]).slice(0, 10),
  };
}

async function responseMessage(response: Response): Promise<string> {
  const status = response.status;
  let detail = "";
  try {
    const body: unknown = await response.clone().json();
    const formatIssues = (value: unknown): string => {
      const issues = Array.isArray(value) ? value : [value];
      return issues
        .filter((issue): issue is Record<string, unknown> => typeof issue === "object" && issue !== null && !Array.isArray(issue))
        .map((issue) => {
          const location = Array.isArray(issue.loc)
            ? issue.loc.filter((part) => part !== "body").join(" → ")
            : "";
          const message = typeof issue.msg === "string" ? issue.msg : "Error de validación";
          return location ? `${location}: ${message}` : message;
        })
        .filter(Boolean)
        .join(" · ");
    };

    if (Array.isArray(body)) {
      detail = formatIssues(body);
    } else if (typeof body === "object" && body !== null) {
      const payload = body as Record<string, unknown>;
      if (Array.isArray(payload.detail)) detail = formatIssues(payload.detail);
      if (!detail && ("loc" in payload || "msg" in payload)) detail = formatIssues(payload);
      if (!detail && typeof payload.errors === "object" && payload.errors !== null && !Array.isArray(payload.errors)) {
        detail = Object.entries(payload.errors as Record<string, unknown>)
          .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
          .join(" · ");
      }
      if (!detail) {
        for (const key of ["detail", "message", "error", "description"]) {
          const value = payload[key];
          if (typeof value === "string" && value.trim()) {
            detail = value.trim();
            break;
          }
        }
      }
    }
    if (!detail && typeof body === "string") detail = body.trim();
  } catch {
    detail = (await response.clone().text().catch(() => "")).trim();
  }

  if (status === 400 || status === 422) return detail ? `La API rechazó los datos: ${detail}` : "La API rechazó los datos. Revisa los campos e inténtalo de nuevo.";
  if (status === 401 || status === 403) return "No tienes permiso para realizar esta acción.";
  if (status === 404) return "No se encontró la candidatura.";
  return detail ? `La API respondió con un error (${status}): ${detail}` : `La API respondió con un error (${status}).`;
}

function unwrapRecord(payload: unknown, fallback: ApiRecord): ApiRecord {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) return fallback;
  const result = payload as ApiRecord;
  for (const key of ["record", "candidate", "data"]) {
    const nested = result[key];
    if (typeof nested === "object" && nested !== null && !Array.isArray(nested)) return nested as ApiRecord;
  }
  return result;
}

export default function CandidateForm({ mode, initialRecord, onSuccess, onCancel }: Props) {
  const [values, setValues] = useState<CandidateValues>(() => initialValues(initialRecord));
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function updateValue(field: keyof CandidateValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    const name = values.name.trim();
    const email = values.email.trim();
    const position = values.position.trim();
    const experience = values.years_experience.trim();
    if (!name || !email || !position || !experience) {
      setIsError(true);
      setMessage("Completa los campos obligatorios: nombre, email, puesto y años de experiencia.");
      return;
    }
    const experienceYears = Number(experience);
    if (!Number.isFinite(experienceYears) || experienceYears < 0) {
      setIsError(true);
      setMessage("Introduce un número válido de años de experiencia (0 o más).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setIsError(true);
      setMessage("Introduce una dirección de email válida.");
      return;
    }
    if (!API_URL) {
      setIsError(true);
      setMessage("No se encontró NEXT_PUBLIC_API_URL. Configura la URL de la API.");
      return;
    }
    if (mode === "edit" && !readField(initialRecord, ["id", "_id", "uuid"])) {
      setIsError(true);
      setMessage("No se pudo identificar la candidatura que se quiere editar.");
      return;
    }

    const payload: CandidateFormPayload = {
      ...(mode === "edit" ? { full_name: name } : { name }),
      email,
      phone: values.phone.trim(),
      position,
      status: values.status.trim(),
      stage: values.stage.trim(),
      experience_years: experienceYears,
    };
    // These values are optional. Omit empty strings to avoid triggering
    // backend URL/number validation on fields the user did not provide.
    const linkedin = values.linkedin.trim();
    const resume = values.resume.trim();
    if (linkedin) payload.linkedin = linkedin;
    if (resume) payload.resume = resume;
    if (values.applied_at) payload.applied_at = values.applied_at;

    setSubmitting(true);
    try {
      const id = readField(initialRecord, ["id", "_id", "uuid"]);
      const response = await fetch(mode === "create" ? `${API_URL}/records` : `${API_URL}/records/${encodeURIComponent(id)}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await responseMessage(response));

      let result: ApiRecord = payload;
      try {
        result = unwrapRecord(await response.json(), payload);
      } catch {
        // Se aceptan respuestas 2xx sin cuerpo.
      }
      setMessage(mode === "create" ? "La candidatura se registró correctamente." : "Los datos de la candidatura se actualizaron correctamente.");
      onSuccess?.(result);
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "No se pudo guardar la candidatura.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "mt-1 h-10 w-full rounded-md border border-[#e1e8ea] bg-white px-3 text-xs text-[#304b56] outline-none focus:border-[#72b8b2] focus:ring-2 focus:ring-[#e5f3f1]";
  const labelClass = "text-[11px] font-semibold text-[#304b56]";

  return (
    <form className="grid gap-5" onSubmit={submit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass} htmlFor={`candidate-name-${mode}`}>Nombre completo <span className="text-[#a75454]">*</span><input className={inputClass} id={`candidate-name-${mode}`} name="name" autoComplete="name" required value={values.name} onChange={(event) => updateValue("name", event.target.value)} /></label>
        <label className={labelClass} htmlFor={`candidate-email-${mode}`}>Email <span className="text-[#a75454]">*</span><input className={inputClass} id={`candidate-email-${mode}`} name="email" type="email" autoComplete="email" required value={values.email} onChange={(event) => updateValue("email", event.target.value)} /></label>
        <label className={labelClass} htmlFor={`candidate-phone-${mode}`}>Teléfono<input className={inputClass} id={`candidate-phone-${mode}`} name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={(event) => updateValue("phone", event.target.value)} /></label>
        <label className={labelClass} htmlFor={`candidate-position-${mode}`}>Puesto <span className="text-[#a75454]">*</span><input className={inputClass} id={`candidate-position-${mode}`} name="position" required value={values.position} onChange={(event) => updateValue("position", event.target.value)} /></label>
        <label className={labelClass} htmlFor={`candidate-linkedin-${mode}`}>LinkedIn<input className={inputClass} id={`candidate-linkedin-${mode}`} name="linkedin" type="url" placeholder="https://…" value={values.linkedin} onChange={(event) => updateValue("linkedin", event.target.value)} /></label>
        <label className={labelClass} htmlFor={`candidate-resume-${mode}`}>Enlace al CV<input className={inputClass} id={`candidate-resume-${mode}`} name="resume" type="url" placeholder="https://…" value={values.resume} onChange={(event) => updateValue("resume", event.target.value)} /></label>
        <label className={labelClass} htmlFor={`candidate-experience-${mode}`}>Años de experiencia <span className="text-[#a75454]">*</span><input className={inputClass} id={`candidate-experience-${mode}`} name="experience_years" type="number" min="0" step="0.5" required value={values.years_experience} onChange={(event) => updateValue("years_experience", event.target.value)} /></label>
        <label className={labelClass} htmlFor={`candidate-status-${mode}`}>Estado<select className={inputClass} id={`candidate-status-${mode}`} name="status" value={values.status} onChange={(event) => updateValue("status", event.target.value)}><option value="En revisión">En revisión</option><option value="Entrevista">Entrevista</option><option value="Contratado">Contratado</option><option value="Rechazado">Rechazado</option></select></label>
        <label className={labelClass} htmlFor={`candidate-stage-${mode}`}>Etapa<input className={inputClass} id={`candidate-stage-${mode}`} name="stage" value={values.stage} onChange={(event) => updateValue("stage", event.target.value)} /></label>
        <label className={labelClass} htmlFor={`candidate-date-${mode}`}>Fecha de aplicación<input className={inputClass} id={`candidate-date-${mode}`} name="applied_at" type="date" value={values.applied_at} onChange={(event) => updateValue("applied_at", event.target.value)} /></label>
      </div>
      {message && <p className={`m-0 text-xs ${isError ? "text-[#a75454]" : "text-[#317653]"}`} role={isError ? "alert" : "status"}>{message}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && <button className="min-h-10 rounded-md border border-[#e1e8ea] px-4 text-xs font-semibold text-[#60747b] hover:bg-[#f6fafa]" type="button" onClick={onCancel}>Cancelar</button>}
        <button className="min-h-10 rounded-md bg-[#087e78] px-4 text-xs font-semibold text-white hover:bg-[#06645f] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitting}>{submitting ? "Guardando…" : mode === "create" ? "Registrar candidatura" : "Guardar cambios"}</button>
      </div>
    </form>
  );
}
