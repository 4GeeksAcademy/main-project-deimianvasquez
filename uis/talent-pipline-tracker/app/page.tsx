import CandidateList from "@/app/components/candidate-list";
import Link from "next/link";
import { Suspense } from "react";
import { fetchCandidates } from "@/lib/api";
import type { Candidate } from "@/types/api";

async function getCandidates(): Promise<{ candidates: Candidate[]; error: string | null }> {
  try {
    return { candidates: await fetchCandidates(), error: null };
  } catch (error) {
    return { candidates: [], error: error instanceof Error ? error.message : "No fue posible cargar las candidaturas." };
  }
}

async function CandidatePage() {
  const { candidates, error } = await getCandidates();
  const reviewCount = candidates.filter((candidate) => /review|revisi|pending/i.test(candidate.status)).length;

  return (
    <main className="min-h-screen bg-[#f7f9fb] text-[#18323d]">
      <aside aria-label="Navegación principal" className="fixed inset-y-0 left-0 z-20 hidden w-[252px] flex-col border-r border-[#e5ebee] bg-white px-[17px] py-[29px] min-[761px]:flex max-[1050px]:w-[220px] max-[760px]:static max-[760px]:w-full max-[760px]:flex-row max-[760px]:items-center max-[760px]:justify-between max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:px-[18px] max-[760px]:py-[13px]">
        <Link className="mb-[52px] ml-[9px] inline-flex w-fit items-center gap-[10px] text-xl font-bold tracking-[-.8px] text-[#132f43] max-[760px]:m-0 max-[760px]:text-lg" href="/" aria-label="TalentFlow, inicio">
          <span className="grid size-[29px] rotate-[-5deg] place-items-center rounded-[9px] bg-[#087e78] max-[760px]:size-[26px]"><span className="size-3 rotate-[5deg] rounded-[4px_7px_4px_7px] border-2 border-white" /></span>
          <span>talent<span className="font-medium text-[#087e78]">flow</span></span>
        </Link>
        <div className="px-[11px] text-[10px] font-bold tracking-[1.1px] text-[#99a7ad] max-[760px]:hidden">WORKSPACE</div>
        <nav className="mt-[13px] grid gap-1.5 max-[760px]:ml-auto max-[760px]:mt-0 max-[760px]:flex">
          <Link className="flex min-h-11 items-center gap-3 rounded-lg bg-[#eaf6f4] px-[11px] text-[13px] font-semibold text-[#076b67] max-[760px]:min-h-[38px] max-[760px]:px-[10px] max-[760px]:text-[11px]" href="/" aria-current="page">
            <span aria-hidden="true" className="w-[19px] text-center text-[17px] max-[760px]:hidden">▦</span>Candidaturas<span className="ml-auto rounded-xl bg-white px-2 py-[3px] text-[11px] text-[#55716e]">{candidates.length}</span>
          </Link>
          <a className="flex min-h-11 items-center gap-3 rounded-lg px-[11px] text-[13px] font-semibold text-[#6b7c83] hover:bg-[#f5f8f8] max-[760px]:hidden" href="#vacantes"><span aria-hidden="true" className="w-[19px] text-center text-[17px]">◫</span>Vacantes</a>
        </nav>
        <div className="mt-auto max-[760px]:hidden">
          <div className="mb-4 mx-[3px] rounded-[10px] border border-[#e8eeee] bg-[#fbfcfc] p-4">
            <div aria-hidden="true" className="mb-[11px] grid size-[25px] place-items-center rounded-full bg-[#e7f3f1] text-[13px] font-bold text-[#087e78]">?</div>
            <p className="mb-1 text-xs font-bold">¿Necesitas ayuda?</p><span className="text-[11px] text-[#7c8b91]">Estamos aquí para ayudarte.</span>
            <a className="mt-[13px] block text-[11px] font-bold text-[#087e78]" href="mailto:soporte@talentflow.example">Contactar soporte <span aria-hidden="true">↗</span></a>
          </div>
          <div className="flex items-center gap-[10px] border-t border-[#e5ebee] px-[3px] pb-[2px] pt-[13px]">
            <div aria-hidden="true" className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[#ddebe9] text-[10px] font-bold text-[#315b58]">TM</div>
            <div className="grid min-w-0 gap-1"><strong className="truncate text-[11px]">Talent Manager</strong><span className="text-[10px] text-[#849198]">Administrador</span></div>
            <button className="ml-auto min-h-11 border-0 bg-transparent text-xl text-[#697a80]" type="button" aria-label="Más opciones de perfil">···</button>
          </div>
        </div>
      </aside>

      <section className="min-h-screen ml-[252px] max-[1050px]:ml-[220px] max-[760px]:ml-0">
        <header className="sticky top-0 z-10 flex h-[66px] items-center justify-between border-b border-[#e5ebee] bg-white/95 px-11 backdrop-blur-xl max-[1050px]:px-7 max-[760px]:h-[53px] max-[760px]:px-[19px]">
          <div className="flex items-center gap-3 text-xs text-[#87949a] max-[520px]:gap-2 max-[520px]:text-[10px]"><span>Workspace</span><span aria-hidden="true">/</span><strong className="font-semibold text-[#354e58]">Candidaturas</strong></div>
          <div className="flex items-center gap-[21px] max-[760px]:gap-[13px] max-[520px]:gap-[10px]">
            <span className={`flex items-center gap-[7px] text-[11px] max-[760px]:text-[10px] max-[520px]:gap-[5px] max-[520px]:text-[0px] ${error ? "text-[#9b5b39]" : "text-[#51716c]"}`}><span aria-hidden="true" className={`size-[7px] rounded-full shadow-[0_0_0_3px_#e6f5ee] max-[520px]:size-2 ${error ? "bg-[#c17a46] shadow-[0_0_0_3px_#f9eee5]" : "bg-[#35a77a]"}`} />{error ? "API no disponible" : "API conectada"}</span>
            <button className="relative grid size-[34px] place-items-center border-0 bg-transparent text-[#61747b]" type="button" aria-label="Notificaciones"><svg className="size-[18px] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7]" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg><i className="absolute right-[7px] top-[7px] size-[5px] rounded-full border border-white bg-[#e89060]" /></button>
            <div aria-label="Perfil de Talent Manager" className="grid size-8 place-items-center rounded-full bg-[#ddebe9] text-[9px] font-bold text-[#315b58]">TM</div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1270px] px-11 pb-[23px] pt-[41px] max-[1050px]:px-7 max-[1050px]:pb-[22px] max-[1050px]:pt-[34px] max-[760px]:px-[18px] max-[760px]:pb-5 max-[760px]:pt-[30px] max-[520px]:px-[13px] max-[520px]:pb-[18px] max-[520px]:pt-[25px]">
          <div className="mb-[27px] flex items-end justify-between gap-6 max-[760px]:mb-[21px] max-[760px]:items-start max-[520px]:block">
            <div>
              <div className="mb-[10px] flex items-center gap-[7px] text-[9px] font-bold tracking-[1.15px] text-[#73908d]"><span className="size-1.5 rounded-full bg-[#13a18e]" /> TALENT PIPELINE</div>
              <h1 className="mb-2 text-[clamp(27px,3vw,34px)] leading-[1.15] tracking-[-1px] text-[#163544] max-[520px]:text-[29px]">Candidaturas</h1>
              <p className="mb-0 text-[13px] text-[#7a8b92] max-[760px]:max-w-[390px] max-[760px]:leading-[1.55] max-[520px]:max-w-[290px] max-[520px]:text-xs">Encuentra y gestiona a las personas que quieren unirse a tu equipo.</p>
            </div>
            <a className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-[7px] bg-[#087e78] px-4 text-xs font-bold text-white shadow-[0_2px_5px_#087e7826] transition hover:-translate-y-px hover:bg-[#06645f] max-[760px]:min-h-[38px] max-[760px]:px-[11px] max-[760px]:text-[10px] max-[520px]:mt-4" href="#candidatos"><span aria-hidden="true" className="text-[19px] font-normal leading-none">＋</span> Ver candidatos</a>
          </div>

          <div aria-label="Resumen de candidaturas" className="mb-[29px] grid grid-cols-3 gap-[15px] max-[760px]:mb-[21px] max-[760px]:gap-[9px] max-[760px]:[&>article]:min-h-[115px] max-[760px]:[&>article]:p-3 max-[520px]:gap-[7px] max-[520px]:[&>article]:min-h-[106px] max-[520px]:[&>article]:px-[9px] max-[520px]:[&>article]:py-[10px]">
            <article className="min-h-[133px] rounded-[9px] border border-[#e5ebee] bg-white px-[19px] py-[17px] max-[760px]:px-3 max-[760px]:py-3 max-[520px]:px-[9px] max-[520px]:py-[10px]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#75858c] max-[760px]:gap-[5px] max-[760px]:text-[9px] max-[520px]:items-start max-[520px]:text-[8px] max-[520px]:leading-[1.35]">Total de candidatos<span aria-hidden="true" className="grid size-[30px] place-items-center rounded-lg bg-[#edf2fb] text-base text-[#5377bd] max-[760px]:size-[25px] max-[760px]:text-[13px] max-[520px]:size-[22px] max-[520px]:text-[11px]">♙</span></div>
              <div className="mb-[3px] mt-2 text-[27px] font-bold tracking-[-.7px] text-[#183542] max-[760px]:mt-[9px] max-[760px]:text-[23px] max-[520px]:text-[21px]">{candidates.length}</div><div className="text-[10px] text-[#89979c] max-[760px]:text-[9px] max-[760px]:leading-[1.4] max-[520px]:text-[8px]">Candidaturas recibidas</div>
            </article>
            <article className="min-h-[133px] rounded-[9px] border border-[#e5ebee] bg-white px-[19px] py-[17px] max-[760px]:px-3 max-[760px]:py-3 max-[520px]:px-[9px] max-[520px]:py-[10px]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#75858c] max-[760px]:gap-[5px] max-[760px]:text-[9px] max-[520px]:items-start max-[520px]:text-[8px] max-[520px]:leading-[1.35]">En revisión<span aria-hidden="true" className="grid size-[30px] place-items-center rounded-lg bg-[#fff4e4] text-base text-[#c48a38] max-[760px]:size-[25px] max-[760px]:text-[13px] max-[520px]:size-[22px] max-[520px]:text-[11px]">◷</span></div>
              <div className="mb-[3px] mt-2 text-[27px] font-bold tracking-[-.7px] text-[#183542] max-[760px]:mt-[9px] max-[760px]:text-[23px] max-[520px]:text-[21px]">{reviewCount}</div><div className="text-[10px] text-[#89979c] max-[760px]:text-[9px] max-[760px]:leading-[1.4] max-[520px]:text-[8px]">Pendientes de evaluar</div>
            </article>
            <article className="min-h-[133px] rounded-[9px] border border-[#e5ebee] bg-white px-[19px] py-[17px] max-[760px]:px-3 max-[760px]:py-3 max-[520px]:px-[9px] max-[520px]:py-[10px]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#75858c] max-[760px]:gap-[5px] max-[760px]:text-[9px] max-[520px]:items-start max-[520px]:text-[8px] max-[520px]:leading-[1.35]">Vacantes activas<span aria-hidden="true" className="grid size-[30px] place-items-center rounded-lg bg-[#eaf6f0] text-base text-[#4c9b73] max-[760px]:size-[25px] max-[760px]:text-[13px] max-[520px]:size-[22px] max-[520px]:text-[11px]">✳</span></div>
              <div className="mb-[3px] mt-2 text-[27px] font-bold tracking-[-.7px] text-[#183542] max-[760px]:mt-[9px] max-[760px]:text-[23px] max-[520px]:text-[21px]">—</div><div className="text-[10px] text-[#89979c] max-[760px]:text-[9px] max-[760px]:leading-[1.4] max-[520px]:text-[8px]">En proceso de selección</div>
            </article>
          </div>

          <CandidateList candidates={candidates} error={error} />
          <footer className="flex justify-between gap-[15px] px-0.5 pt-[22px] text-[9px] text-[#a1aaae] max-[520px]:text-[8px]"><span>TalentFlow <span aria-hidden="true" className="text-[#8cbab4]">·</span> Pipeline de talento</span><span>Hecho para equipos que crecen <span aria-hidden="true" className="text-[#8cbab4]">✦</span></span></footer>
        </div>
      </section>
    </main>
  );
}

function LoadingPage() {
  return <main className="grid min-h-screen place-items-center bg-[#f7f9fb] text-[13px] text-[#60747b]" aria-live="polite" aria-busy="true"><div className="flex items-center gap-[11px]"><span className="size-[19px] animate-spin rounded-full border-2 border-[#dcebe9] border-t-[#087e78] motion-reduce:animate-none" />Cargando candidaturas…</div></main>;
}

export default function Home() {
  return <Suspense fallback={<LoadingPage />}><CandidatePage /></Suspense>;
}
