"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CandidateForm from "@/app/components/candidate-form";
import { fetchCandidates } from "@/lib/api";
import type { Candidate } from "@/types/api";

type Props = { candidates: Candidate[]; error: string | null };

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
}

function formatDate(value: string): string {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
}

function statusColor(status: string): string {
  if (/hired|contrat|offer|seleccionad/i.test(status)) return "bg-[#eaf5ee] text-[#3d8059]";
  if (/reject|rechaz|declin/i.test(status)) return "bg-[#faeded] text-[#a75454]";
  if (/interview|entrevista/i.test(status)) return "bg-[#edf2fc] text-[#5372af]";
  return "bg-[#fff4e4] text-[#926a26]";
}

const avatarColors = [
  "bg-[#e8eff7] text-[#55749a]",
  "bg-[#f3eaf0] text-[#986681]",
  "bg-[#e8f3ee] text-[#568673]",
  "bg-[#fbf0df] text-[#9f7b43]",
  "bg-[#ecebfd] text-[#6966a0]",
];

export default function CandidateList({ candidates, error }: Props) {
  const [localCandidates, setLocalCandidates] = useState<Candidate[] | null>(null);
  const visibleCandidates = localCandidates ?? candidates;
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [notice, setNotice] = useState("");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const statusFilter = searchParams.get("status") ?? "";
  const stageFilter = searchParams.get("stage") ?? "";
  const pageParam = Number(searchParams.get("page") ?? "1");
  const currentPageFromUrl = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = 20;

  const updateQueryParameter = useCallback((key: "status" | "stage" | "page", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const filteredCandidates = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");
    return visibleCandidates.filter((candidate) => {
      const matchesSearch = !normalizedSearch || [candidate.name, candidate.email].some((value) => value.toLocaleLowerCase("es").includes(normalizedSearch));
      const matchesStatus = !statusFilter || candidate.status.toLocaleLowerCase("es").includes(statusFilter.toLocaleLowerCase("es"));
      const matchesStage = !stageFilter || candidate.stage.toLocaleLowerCase("es").includes(stageFilter.toLocaleLowerCase("es"));
      return matchesSearch && matchesStatus && matchesStage;
    });
  }, [search, stageFilter, statusFilter, visibleCandidates]);

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const currentPage = Math.min(currentPageFromUrl, totalPages);
  const pageCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredCandidates]);

  useEffect(() => {
    if (currentPageFromUrl !== currentPage) updateQueryParameter("page", String(currentPage));
  }, [currentPage, currentPageFromUrl, updateQueryParameter]);

  function goToPage(page: number) {
    const boundedPage = Math.max(1, Math.min(totalPages, page));
    updateQueryParameter("page", boundedPage === 1 ? "" : String(boundedPage));
  }

  const statuses = [...new Set(visibleCandidates.map((candidate) => candidate.status).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  const stages = [...new Set(visibleCandidates.map((candidate) => candidate.stage).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));

  async function refreshList(message: string, savedRecord: Record<string, unknown>, mode: "create" | "edit", editingId?: string) {
    setNotice(message);
    setCreating(false);
    setEditingCandidate(null);
    const firstText = (keys: string[], fallback = "") => {
      for (const key of keys) {
        const value = savedRecord[key];
        if ((typeof value === "string" && value.trim()) || typeof value === "number") return String(value);
      }
      return fallback;
    };
    if (mode === "edit" && editingId) {
      setLocalCandidates((current) => (current ?? candidates).map((candidate) => {
        if (candidate.id !== editingId) return candidate;
        const raw = { ...candidate.raw, ...savedRecord };
        return {
          ...candidate,
          name: firstText(["full_name", "name", "fullName", "candidate_name"], candidate.name),
          email: firstText(["email", "mail"], candidate.email),
          phone: firstText(["phone", "phone_number", "telephone"], candidate.phone),
          position: firstText(["position", "job_title", "jobTitle", "role", "vacancy"], candidate.position),
          status: firstText(["status", "application_status", "applicationStatus"], candidate.status),
          stage: firstText(["stage", "current_stage", "currentStage", "pipeline_stage"], candidate.stage),
          date: firstText(["created_at", "createdAt", "date", "applied_at", "updated_at"], candidate.date),
          raw,
        };
      }));
      return;
    }

    const id = firstText(["id", "_id", "uuid"]);
    if (!id) {
      try {
        setLocalCandidates(await fetchCandidates());
      } catch {
        setNotice("La candidatura se guardó, pero no se pudo actualizar la lista. Intenta recargar los datos.");
      }
      return;
    }
    const created: Candidate = {
      id,
      name: firstText(["full_name", "name", "fullName", "candidate_name"], `Candidato #${id}`),
      email: firstText(["email", "mail"]),
      phone: firstText(["phone", "phone_number", "telephone"]),
      position: firstText(["position", "job_title", "jobTitle", "role", "vacancy"], "Vacante no especificada"),
      status: firstText(["status", "application_status", "applicationStatus"], "En revisión"),
      stage: firstText(["stage", "current_stage", "currentStage", "pipeline_stage"], "Sin etapa"),
      date: firstText(["created_at", "createdAt", "date", "applied_at", "updated_at"]),
      raw: savedRecord,
    };
    setLocalCandidates((current) => [created, ...(current ?? candidates).filter((candidate) => candidate.id !== created.id)]);
  }

  return (
    <section className="overflow-hidden rounded-[10px] border border-[#e5ebee] bg-white" id="candidatos" aria-labelledby="candidate-title">
      {!error && <p className="sr-only" role="status">Candidaturas cargadas correctamente.</p>}
      <div className="flex min-h-[83px] items-center justify-between gap-5 px-5 py-[17px] max-[520px]:min-h-[74px] max-[520px]:gap-2 max-[520px]:px-[13px] max-[520px]:py-[14px]">
        <div><h2 className="mb-[5px] text-[15px] tracking-[-.1px] text-[#203d49] max-[520px]:text-[13px]" id="candidate-title">Todos los candidatos</h2><p className="mb-0 text-[11px] text-[#89969b] max-[520px]:text-[9px]">Revisa y organiza las candidaturas de tu equipo.</p></div>
        <div className="flex shrink-0 gap-2">
          <button className="inline-flex min-h-[35px] items-center gap-1.5 rounded-md bg-[#087e78] px-3 text-[11px] font-semibold text-white hover:bg-[#06645f] max-[520px]:min-h-8 max-[520px]:px-2 max-[520px]:text-[10px]" type="button" onClick={() => { setNotice(""); setCreating(true); }}><span aria-hidden="true" className="text-base">＋</span> Nueva candidatura</button>
          <button className="inline-flex min-h-[35px] items-center gap-2 rounded-md border border-[#e1e8ea] bg-white px-[11px] text-[11px] font-semibold text-[#63767d] hover:border-[#c8d8d7] hover:bg-[#f6fafa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087e78] max-[520px]:hidden" type="button" onClick={() => window.print()}><svg className="size-[15px] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7]" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" /></svg> Exportar</button>
        </div>
      </div>

      {notice && <p className="mx-5 mb-3 rounded-md bg-[#eef7f3] px-3 py-2 text-xs text-[#317653]" role="status">{notice}</p>}
      {creating && <div className="mx-5 mb-4 rounded-lg border border-[#e5ebee] bg-[#fbfcfc] p-5 sm:mx-6"><h3 className="mb-4 mt-0 text-sm font-semibold text-[#203d49]">Registrar candidatura</h3><CandidateForm mode="create" onCancel={() => setCreating(false)} onSuccess={(saved) => refreshList("Candidatura registrada.", saved, "create")} /></div>}
      {editingCandidate && <div className="mx-5 mb-4 rounded-lg border border-[#e5ebee] bg-[#fbfcfc] p-5 sm:mx-6"><h3 className="mb-4 mt-0 text-sm font-semibold text-[#203d49]">Editar candidatura: {editingCandidate.name}</h3><CandidateForm key={editingCandidate.id} mode="edit" initialRecord={editingCandidate.raw} onCancel={() => setEditingCandidate(null)} onSuccess={(saved) => refreshList("Candidatura actualizada.", saved, "edit", editingCandidate.id)} /></div>}

      {error && <div className="mx-5 mb-[14px] flex gap-[11px] rounded-[7px] border border-[#f0d9c8] bg-[#fffaf6] px-[13px] py-3 text-[#855339] max-[520px]:mx-3" role="alert"><span aria-hidden="true" className="grid size-[19px] shrink-0 place-items-center rounded-full bg-[#f8e6d9] text-xs font-bold">!</span><div><strong className="text-[11px]">No se pudieron cargar las candidaturas</strong><p className="mb-0 mt-1 text-[10px] text-[#8c766b]">{error}</p></div></div>}

      <div className="flex flex-wrap items-center gap-[10px] border-y border-[#eff2f3] px-5 py-[13px] max-[520px]:items-stretch max-[520px]:px-3 max-[520px]:py-[11px]">
        <label className="flex h-9 w-full max-w-[390px] items-center gap-[9px] rounded-md border border-[#e3e9eb] px-[10px] text-[#839298] focus-within:border-[#72b8b2] focus-within:ring-2 focus-within:ring-[#e5f3f1] max-[520px]:h-[35px] max-[520px]:gap-[6px] max-[520px]:px-2">
          <svg className="size-4 shrink-0 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7]" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg><span className="sr-only">Buscar candidatos</span><input className="w-full min-w-0 border-0 bg-transparent text-[10px] text-[#304b56] outline-none placeholder:text-[#a0aaae] max-[520px]:text-[9px]" type="search" placeholder="Buscar por nombre o email..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <label className="flex h-9 items-center gap-2 rounded-md border border-[#e3e9eb] px-[10px] text-[#7d8d93] focus-within:border-[#72b8b2] focus-within:ring-2 focus-within:ring-[#e5f3f1] max-[520px]:h-[35px] max-[520px]:w-[37px] max-[520px]:shrink-0 max-[520px]:justify-center max-[520px]:px-0">
          <span className="sr-only">Filtrar por estado</span><select className="w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent text-[10px] text-[#60747b] outline-none" value={statusFilter} onChange={(event) => updateQueryParameter("status", event.target.value)}><option value="">Todos los estados</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
        </label>
        <label className="flex h-9 min-w-0 items-center gap-2 rounded-md border border-[#e3e9eb] px-[10px] text-[#7d8d93] focus-within:border-[#72b8b2] focus-within:ring-2 focus-within:ring-[#e5f3f1] max-[520px]:flex-1 max-[520px]:px-2">
          <span className="sr-only">Filtrar por etapa</span><select className="w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent text-[10px] text-[#60747b] outline-none" value={stageFilter} onChange={(event) => updateQueryParameter("stage", event.target.value)}><option value="">Todas las etapas</option>{stages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select>
        </label>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className="bg-[#fafbfc]"><tr><th className="h-[39px] w-[43px] pl-5 pr-[13px] text-[9px] font-bold tracking-[.48px] text-[#99a5aa]" scope="col"><input className="m-0 size-[14px] cursor-pointer accent-[#087e78]" type="checkbox" aria-label="Seleccionar todos los candidatos" /></th><th className="min-w-[230px] px-[13px] text-[9px] font-bold tracking-[.48px] text-[#99a5aa]" scope="col">CANDIDATO</th><th className="min-w-[155px] px-[13px] text-[9px] font-bold tracking-[.48px] text-[#99a5aa]" scope="col">PUESTO</th><th className="min-w-[120px] px-[13px] text-[9px] font-bold tracking-[.48px] text-[#99a5aa]" scope="col">ESTADO</th><th className="min-w-[120px] px-[13px] text-[9px] font-bold tracking-[.48px] text-[#99a5aa]" scope="col">ETAPA ACTUAL</th><th className="min-w-[155px] px-[13px] text-[9px] font-bold tracking-[.48px] text-[#99a5aa]" scope="col">FECHA DE POSTULACIÓN</th><th className="px-[13px] text-[9px] font-bold text-[#99a5aa]" scope="col"><span className="sr-only">Acciones</span></th></tr></thead>
          <tbody>
            {pageCandidates.map((candidate, index) => (
              <tr className="hover:bg-[#fcfdfd]" key={`${candidate.id}-${index}`}>
                <td className="h-[65px] border-t border-[#f0f3f4] pl-5 pr-[13px]"><input className="m-0 size-[14px] cursor-pointer accent-[#087e78]" type="checkbox" aria-label={`Seleccionar a ${candidate.name}`} /></td>
                <td className="h-[65px] border-t border-[#f0f3f4] px-[13px]"><Link className="flex w-fit items-center gap-[10px] rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087e78]" href={`/candidates/${encodeURIComponent(candidate.id)}`}><div className={`grid size-[34px] shrink-0 place-items-center rounded-full text-[10px] font-bold ${avatarColors[index % avatarColors.length]}`} aria-hidden="true">{initials(candidate.name)}</div><div className="grid gap-1"><strong className="text-[11px] font-semibold text-[#304852] hover:text-[#087e78]">{candidate.name}</strong><span className="text-[10px] text-[#8b999e]">{candidate.email || candidate.phone || "Datos de contacto no disponibles"}</span></div></Link></td>
                <td className="h-[65px] border-t border-[#f0f3f4] px-[13px] text-[10px] text-[#50666e]">{candidate.position}</td>
                <td className="h-[65px] border-t border-[#f0f3f4] px-[13px]"><span className={`inline-flex min-h-[23px] items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-[9px] font-semibold ${statusColor(candidate.status)}`}><span aria-hidden="true" className="size-[5px] rounded-full bg-current" />{candidate.status}</span></td>
                <td className="h-[65px] border-t border-[#f0f3f4] px-[13px] text-[10px] text-[#50666e]">{candidate.stage}</td>
                <td className="h-[65px] whitespace-nowrap border-t border-[#f0f3f4] px-[13px] text-[10px] text-[#829097]">{formatDate(candidate.date)}</td>
                <td className="h-[65px] border-t border-[#f0f3f4] px-[13px]"><button className="h-[30px] w-7 border-0 bg-transparent text-[19px] text-[#87969b] hover:text-[#087e78]" type="button" aria-label={`Editar ${candidate.name}`} title="Editar candidatura" onClick={() => { setNotice(""); setCreating(false); setEditingCandidate(candidate); }}>✎</button></td>
              </tr>
            ))}
            {filteredCandidates.length === 0 && <tr><td className="border-t border-[#f0f3f4]" colSpan={7}><div className="grid min-h-[210px] justify-items-center content-center px-[25px] py-[25px] text-center"><div aria-hidden="true" className="mb-[11px] grid size-[37px] place-items-center rounded-full bg-[#eff5f4] text-[23px] text-[#5b8e88]">⌕</div><strong className="text-xs text-[#3b555f]">{error ? "Aún no hay datos para mostrar" : search || statusFilter || stageFilter ? "No encontramos coincidencias" : "Todavía no hay candidaturas"}</strong><p className="mb-0 mt-1.5 text-[10px] text-[#89979c]">{error ? "Cuando la API esté disponible, los candidatos aparecerán aquí." : search || statusFilter || stageFilter ? "Prueba otra búsqueda o cambia los filtros." : "Las nuevas postulaciones aparecerán en esta lista."}</p></div></td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex min-h-[52px] flex-wrap items-center justify-between gap-3 border-t border-[#eff2f3] px-[19px] text-[10px] text-[#8a989d] max-[520px]:px-3 max-[520px]:text-[9px]"><span>Mostrando <strong className="font-semibold text-[#586d74]">{filteredCandidates.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredCandidates.length)}</strong> de <strong className="font-semibold text-[#586d74]">{filteredCandidates.length}</strong> filtrados <span className="text-[#a1aaae]">({visibleCandidates.length} en total)</span></span><nav className="flex items-center gap-[5px]" aria-label="Paginación de candidaturas"><button className="grid size-[27px] place-items-center rounded-[5px] border border-[#e5eaec] bg-white text-xs text-[#687b82] disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)} aria-label="Página anterior">←</button>{Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1).map((page, index, visiblePages) => <span className="contents" key={page}>{index > 0 && page - visiblePages[index - 1] > 1 && <span className="px-1" aria-hidden="true">…</span>}<button className={`grid h-[26px] min-w-[27px] place-items-center rounded-[5px] border px-1.5 text-[10px] ${page === currentPage ? "border-[#b8d9d5] bg-[#eef7f6] text-[#087e78]" : "border-[#e5eaec] bg-white text-[#687b82] hover:bg-[#f6fafa]"}`} type="button" onClick={() => goToPage(page)} aria-label={`Página ${page}`} aria-current={page === currentPage ? "page" : undefined}>{page}</button></span>)}<button className="grid size-[27px] place-items-center rounded-[5px] border border-[#e5eaec] bg-white text-xs text-[#687b82] disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)} aria-label="Página siguiente">→</button></nav></div>
    </section>
  );
}
