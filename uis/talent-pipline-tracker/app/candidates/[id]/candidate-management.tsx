"use client";

import { useCallback, useEffect, useState } from "react";
import CandidateForm from "@/app/components/candidate-form";
import { ApiError, fetchCandidateNotes, getApiUrl } from "@/lib/api";
import type { ApiRecord, ApiNote } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
type JsonRecord = ApiRecord;
type CandidateNote = { id: string; content: string; createdAt: string };

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getText(record: JsonRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function normalizeNote(value: ApiNote, index: number): CandidateNote | null {
  if (!isRecord(value)) return null;
  const id = getText(value, ["id", "_id", "note_id", "noteId"]);
  const content = getText(value, ["content", "text", "body", "note"]);
  if (!id || !content) return null;
  return { id, content, createdAt: getText(value, ["created_at", "createdAt", "date"]) || String(index + 1) };
}

function errorMessage(status: number): string {
  if (status === 404) return "No se encontró el recurso solicitado.";
  if (status === 401 || status === 403) return "No tienes permiso para realizar esta acción.";
  return `La API respondió con un error (${status}).`;
}

function fieldValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return JSON.stringify(value);
}

const fieldDefinitions = [
  { label: "Nombre completo", keys: ["full_name", "name", "fullName", "candidate_name"] },
  { label: "Email", keys: ["email", "mail"] },
  { label: "Teléfono", keys: ["phone", "phone_number", "telephone"] },
  { label: "Puesto", keys: ["position", "job_title", "jobTitle", "role", "vacancy"] },
  { label: "LinkedIn", keys: ["linkedin", "linkedin_url", "linkedinUrl", "linkedin_profile"] },
  { label: "Enlace al CV", keys: ["resume", "resume_url", "resumeUrl", "cv", "cv_url", "cvUrl"] },
  { label: "Años de experiencia", keys: ["years_experience", "yearsExperience", "experience_years", "experienceYears"] },
  { label: "Estado", keys: ["status", "application_status", "applicationStatus"] },
  { label: "Etapa", keys: ["stage", "current_stage", "currentStage", "pipeline_stage"] },
  { label: "Fecha de aplicación", keys: ["applied_at", "appliedAt", "created_at", "createdAt", "application_date", "date"] },
] as const;

export default function CandidateManagement({ id, initialRecord }: { id: string; initialRecord: JsonRecord }) {
  const [record, setRecord] = useState(initialRecord);
  const [status, setStatus] = useState(getText(initialRecord, [...fieldDefinitions[7].keys]) || "En revisión");
  const [stage, setStage] = useState(getText(initialRecord, [...fieldDefinitions[8].keys]) || "");
  const [statusMessage, setStatusMessage] = useState("");
  const [stageMessage, setStageMessage] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingStage, setSavingStage] = useState(false);
  const [notes, setNotes] = useState<CandidateNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState("");
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const loadNotes = useCallback(async (signal?: AbortSignal) => {
    if (!API_URL) {
      setNotesError("No se encontró NEXT_PUBLIC_API_URL.");
      setNotesLoading(false);
      return;
    }
    setNotesLoading(true);
    setNotesError("");
    try {
      const payload = await fetchCandidateNotes(id, signal);
      setNotes(payload.map((note, index) => normalizeNote(note, index)).filter((note): note is CandidateNote => note !== null));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setNotesError(error instanceof Error ? error.message : "No se pudieron cargar las notas.");
    } finally {
      if (!signal?.aborted) setNotesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => loadNotes(controller.signal));
    return () => controller.abort();
  }, [loadNotes]);

  async function updateField(field: "status" | "stage", value: string) {
    const setSaving = field === "status" ? setSavingStatus : setSavingStage;
    const setMessage = field === "status" ? setStatusMessage : setStageMessage;
    const payloadKey = field;
    setSaving(true);
    setMessage("");
    try {
      if (!API_URL) throw new Error("No se encontró NEXT_PUBLIC_API_URL.");
      const response = await fetch(`${getApiUrl()}/records/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ [payloadKey]: value }),
      });
      if (!response.ok) throw new ApiError(errorMessage(response.status), response.status);
      let updated: JsonRecord = { [payloadKey]: value };
      try {
        const payload: unknown = await response.json();
        if (isRecord(payload)) {
          const result = isRecord(payload.record) ? payload.record : isRecord(payload.data) ? payload.data : payload;
          updated = { ...updated, ...result };
        }
      } catch {
        // PATCH puede responder correctamente sin cuerpo JSON.
      }
      setRecord((current) => ({ ...current, ...updated }));
      setMessage("Cambios guardados.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el cambio.");
    } finally {
      setSaving(false);
    }
  }

  async function addNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = newNote.trim();
    if (!content) return;
    setAddingNote(true);
    setNoteMessage("");
    try {
      if (!API_URL) throw new Error("No se encontró NEXT_PUBLIC_API_URL.");
      const response = await fetch(`${getApiUrl()}/records/${encodeURIComponent(id)}/notes`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new ApiError(errorMessage(response.status), response.status);
      setNewNote("");
      const returned = await response.json().catch(() => null) as unknown;
      if (isRecord(returned)) {
        const noteValue = isRecord(returned.note) ? returned.note : isRecord(returned.data) ? returned.data : returned;
        const created = normalizeNote(noteValue as ApiNote, 0);
        if (created) {
          setNotes((current) => [created, ...current.filter((note) => note.id !== created.id)]);
          setNoteMessage("Nota añadida.");
          return;
        }
      }
      setNoteMessage("Nota añadida.");
      await loadNotes();
    } catch (error) {
      setNoteMessage(error instanceof Error ? error.message : "No se pudo añadir la nota.");
    } finally {
      setAddingNote(false);
    }
  }

  async function deleteNote(noteId: string) {
    setDeletingNoteId(noteId);
    setNoteMessage("");
    try {
      if (!API_URL) throw new Error("No se encontró NEXT_PUBLIC_API_URL.");
      const response = await fetch(`${getApiUrl()}/records/${encodeURIComponent(id)}/notes/${encodeURIComponent(noteId)}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new ApiError(errorMessage(response.status), response.status);
      setNotes((current) => current.filter((note) => note.id !== noteId));
      setNoteMessage("Nota eliminada.");
    } catch (error) {
      setNoteMessage(error instanceof Error ? error.message : "No se pudo eliminar la nota.");
    } finally {
      setDeletingNoteId(null);
    }
  }

  const visibleFields = fieldDefinitions.map(({ label, keys }) => ({ label, value: keys.map((key) => record[key]).find((value) => value !== undefined && value !== null && value !== "") }));
  const knownKeys = new Set<string>(fieldDefinitions.flatMap(({ keys }) => [...keys]));
  const extraFields = Object.entries(record).filter(([key]) => !knownKeys.has(key));

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[10px] border border-[#e5ebee] bg-white" aria-labelledby="profile-heading" id="datos-completos">
        <div className="border-b border-[#eff2f3] px-5 py-4 sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="m-0 text-[15px] font-semibold text-[#203d49]" id="profile-heading">Perfil de candidatura</h2><p className="mb-0 mt-1 text-[11px] text-[#89969b]">Datos de contacto, experiencia y postulación.</p></div><button className="min-h-9 rounded-md border border-[#e1e8ea] px-3 text-[11px] font-semibold text-[#087e78] hover:bg-[#f6fafa]" type="button" onClick={() => setEditing((current) => !current)}>{editing ? "Cancelar edición" : "Editar candidatura"}</button></div>
        </div>
        {editing ? <div className="p-5 sm:p-7"><CandidateForm mode="edit" initialRecord={record} onCancel={() => setEditing(false)} onSuccess={(updated) => { setRecord((current) => ({ ...current, ...updated })); setEditing(false); }} /></div> : <dl className="grid gap-x-8 divide-y divide-[#eff2f3] px-5 sm:grid-cols-2 sm:px-7">
          {visibleFields.map(({ label, value }) => (
            <div className="grid content-start gap-2 py-4" key={label}>
              <dt className="text-[10px] font-bold uppercase tracking-[.7px] text-[#829097]">{label}</dt>
              <dd className="m-0 break-words text-[13px] leading-6 text-[#304b56]">
                {label === "LinkedIn" || label === "Enlace al CV" ? (
                  typeof value === "string" && /^https?:\/\//i.test(value) ? <a className="text-[#087e78] underline underline-offset-2" href={value} target="_blank" rel="noreferrer">Abrir enlace</a> : fieldValue(value)
                ) : fieldValue(value)}
              </dd>
            </div>
          ))}
          {extraFields.map(([key, value]) => (
            <div className="grid content-start gap-2 py-4" key={key}>
              <dt className="text-[10px] font-bold uppercase tracking-[.7px] text-[#829097]">{key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ")}</dt>
              <dd className="m-0 break-words text-[13px] leading-6 text-[#304b56]">{fieldValue(value)}</dd>
            </div>
          ))}
        </dl>}
      </section>

      <section className="grid gap-4 rounded-[10px] border border-[#e5ebee] bg-white p-5 sm:grid-cols-2 sm:p-7" aria-label="Actualizar estado y etapa">
        <div className="grid content-start gap-2">
          <label className="text-[11px] font-semibold text-[#304b56]" htmlFor="candidate-status">Estado</label>
          <div className="flex gap-2">
            <select className="h-10 min-w-0 flex-1 rounded-md border border-[#e1e8ea] bg-white px-3 text-xs text-[#304b56]" id="candidate-status" value={status} onChange={(event) => setStatus(event.target.value)}>
              {[...new Set([status, "En revisión", "Entrevista", "Contratado", "Rechazado"].filter(Boolean))].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <button className="min-h-10 rounded-md bg-[#087e78] px-3 text-xs font-semibold text-white disabled:opacity-60" type="button" disabled={savingStatus || status === getText(record, [...fieldDefinitions[7].keys])} onClick={() => void updateField("status", status)}>{savingStatus ? "Guardando…" : "Guardar"}</button>
          </div>
          {statusMessage && <p className="m-0 text-[11px] text-[#60747b]" role="status">{statusMessage}</p>}
        </div>
        <div className="grid content-start gap-2">
          <label className="text-[11px] font-semibold text-[#304b56]" htmlFor="candidate-stage">Etapa</label>
          <div className="flex gap-2">
            <input className="h-10 min-w-0 flex-1 rounded-md border border-[#e1e8ea] px-3 text-xs text-[#304b56]" id="candidate-stage" value={stage} onChange={(event) => setStage(event.target.value)} placeholder="Ej. Entrevista técnica" />
            <button className="min-h-10 rounded-md bg-[#087e78] px-3 text-xs font-semibold text-white disabled:opacity-60" type="button" disabled={savingStage || stage === getText(record, [...fieldDefinitions[8].keys])} onClick={() => void updateField("stage", stage)}>{savingStage ? "Guardando…" : "Guardar"}</button>
          </div>
          {stageMessage && <p className="m-0 text-[11px] text-[#60747b]" role="status">{stageMessage}</p>}
        </div>
      </section>

      <section className="overflow-hidden rounded-[10px] border border-[#e5ebee] bg-white" aria-labelledby="notes-heading">
        <div className="border-b border-[#eff2f3] px-5 py-4 sm:px-7">
          <h2 className="m-0 text-[15px] font-semibold text-[#203d49]" id="notes-heading">Notas</h2>
          <p className="mb-0 mt-1 text-[11px] text-[#89969b]">Comentarios internos sobre esta candidatura.</p>
        </div>
        <form className="grid gap-3 border-b border-[#eff2f3] px-5 py-4 sm:px-7" onSubmit={addNote}>
          <label className="text-[11px] font-semibold text-[#304b56]" htmlFor="new-candidate-note">Añadir nota</label>
          <textarea className="min-h-24 resize-y rounded-md border border-[#e1e8ea] p-3 text-xs leading-5 text-[#304b56] placeholder:text-[#a0aaae]" id="new-candidate-note" value={newNote} onChange={(event) => setNewNote(event.target.value)} placeholder="Escribe una nota para el equipo…" required />
          <button className="min-h-10 w-fit rounded-md bg-[#087e78] px-4 text-xs font-semibold text-white disabled:opacity-60" type="submit" disabled={addingNote || !newNote.trim()}>{addingNote ? "Añadiendo…" : "Añadir nota"}</button>
          {noteMessage && <p className="m-0 text-[11px] text-[#60747b]" role="status">{noteMessage}</p>}
        </form>
        <div className="grid divide-y divide-[#eff2f3] px-5 sm:px-7">
          {notesLoading ? <p className="py-5 text-xs text-[#829097]" aria-live="polite">Cargando notas…</p> : notesError ? <div className="flex items-center justify-between gap-3 py-5" role="alert"><p className="m-0 text-xs text-[#9b5b39]">{notesError}</p><button className="text-xs font-semibold text-[#087e78]" type="button" onClick={() => void loadNotes()}>Reintentar</button></div> : notes.length === 0 ? <p className="py-5 text-xs text-[#829097]">Todavía no hay notas.</p> : notes.map((note) => (
            <article className="flex items-start justify-between gap-4 py-4" key={note.id}>
              <div className="min-w-0"><p className="m-0 whitespace-pre-wrap break-words text-[13px] leading-6 text-[#304b56]">{note.content}</p><time className="mt-2 block text-[10px] text-[#89969b]">{note.createdAt}</time></div>
              <button className="min-h-9 shrink-0 rounded-md border border-[#f0d9d9] px-3 text-[11px] font-semibold text-[#a75454] hover:bg-[#fff7f7] disabled:opacity-60" type="button" disabled={deletingNoteId === note.id} onClick={() => void deleteNote(note.id)}>{deletingNoteId === note.id ? "Eliminando…" : "Eliminar"}</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
