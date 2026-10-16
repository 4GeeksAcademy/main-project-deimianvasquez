import Link from "next/link";
import { Suspense } from "react";
import CandidateManagement from "./candidate-management";
import { fetchCandidate } from "@/lib/api";
import type { ApiRecord } from "@/types/api";

async function getCandidate(id: string): Promise<{ record: ApiRecord | null; error: string | null }> {
  try {
    return { record: await fetchCandidate(id), error: null };
  } catch (error) {
    return { record: null, error: error instanceof Error ? error.message : "No fue posible cargar la candidatura." };
  }
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
}

async function CandidateDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { record, error } = await getCandidate(id);
  const nameValue = record && [record.full_name, record.name, record.fullName, record.candidate_name].find((value) => typeof value === "string" && value.trim());
  const name = typeof nameValue === "string" ? nameValue : `Candidato #${id}`;

  return (
    <main className="min-h-screen bg-[#f7f9fb] text-[#18323d]">
      <header className="sticky top-0 z-10 flex h-[66px] items-center justify-between border-b border-[#e5ebee] bg-white/95 px-6 backdrop-blur-xl sm:px-11">
        <Link className="inline-flex items-center gap-2 text-lg font-bold tracking-[-.6px] text-[#132f43]" href="/" aria-label="TalentFlow, volver al listado">
          <span className="grid size-7 rotate-[-5deg] place-items-center rounded-lg bg-[#087e78]"><span className="size-3 rotate-[5deg] rounded-[4px_7px_4px_7px] border-2 border-white" /></span>
          <span>talent<span className="font-medium text-[#087e78]">flow</span></span>
        </Link>
        <span className="text-xs text-[#87949a]">Workspace <span aria-hidden="true" className="mx-2">/</span> Candidaturas</span>
      </header>

      <div className="mx-auto w-full max-w-[1050px] px-4 pb-10 pt-7 sm:px-7 sm:pt-10">
        <Link className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-md text-xs font-semibold text-[#087e78] hover:text-[#06645f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#087e78]" href="/">
          <span aria-hidden="true" className="text-lg">←</span> Volver a candidaturas
        </Link>

        {error || !record ? (
          <section className="rounded-[10px] border border-[#e5ebee] bg-white p-6 sm:p-9" role="alert">
            <div className="mb-3 grid size-10 place-items-center rounded-full bg-[#fff4e4] text-lg font-bold text-[#a97730]" aria-hidden="true">!</div>
            <h1 className="mb-2 text-xl font-semibold text-[#183542]">No se pudo cargar la candidatura</h1>
            <p className="m-0 text-sm leading-6 text-[#7a8b92]">{error ?? "No encontramos los datos solicitados."}</p>
          </section>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-full bg-[#e8f3ee] text-sm font-bold text-[#568673]">{initials(name)}</div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-[10px] font-bold tracking-[1.1px] text-[#73908d]">DETALLE DE CANDIDATURA</div>
                <h1 className="m-0 break-words text-[26px] font-semibold tracking-[-.6px] text-[#163544] sm:text-[32px]">{name}</h1>
                <p className="mb-0 mt-1 text-xs text-[#87949a]">Identificador: {id}</p>
              </div>
              <a className="inline-flex min-h-10 items-center rounded-md border border-[#e1e8ea] bg-white px-3 text-xs font-semibold text-[#63767d] hover:bg-[#f6fafa]" href="#datos-completos">Ver todos los datos</a>
            </div>

            <CandidateManagement id={id} initialRecord={record} />
            <p className="sr-only" role="status">Candidatura cargada correctamente.</p>
          </>
        )}
      </div>
    </main>
  );
}

function LoadingDetails() {
  return <main className="grid min-h-screen place-items-center bg-[#f7f9fb] text-[13px] text-[#60747b]" aria-live="polite" aria-busy="true"><div className="flex items-center gap-3"><span className="size-5 animate-spin rounded-full border-2 border-[#dcebe9] border-t-[#087e78] motion-reduce:animate-none" />Cargando candidatura…</div></main>;
}

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<LoadingDetails />}><CandidateDetails params={params} /></Suspense>;
}
