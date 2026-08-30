'use client';

import { FormEvent, useRef, useState } from 'react';
import { ArrowRight, Check, ExternalLink, LockKeyhole, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { predictRank, validateScore, type Prediction } from '@/lib/predictor';

const SHEETS_WEBHOOK = process.env.NEXT_PUBLIC_SHEETS_URL || 'https://script.google.com/macros/s/AKfycbwQi_XO2FGV79p2vAGQYy0yGNmODOlnz6z0TAdRQIQI7VKWJPsWSs7EXuTqAx3cR7Rd/exec';
const formatRank = (value: number) => new Intl.NumberFormat('en-IN').format(value);

async function saveLead(payload: Record<string, unknown>) {
  await fetch(SHEETS_WEBHOOK, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) });
}

export default function Home() {
  const [score, setScore] = useState('');
  const [scoreError, setScoreError] = useState('');
  const [leadOpen, setLeadOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [leadError, setLeadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [candidateName, setCandidateName] = useState('');
  const resultRef = useRef<HTMLElement>(null);
  const numericScore = Number(score);
  const validScore = score !== '' && Number.isInteger(numericScore) && numericScore >= 0 && numericScore <= 720;
  const progress = validScore ? (numericScore / 720) * 100 : 0;

  function openDetails() {
    try { validateScore(score); setScoreError(''); setLeadError(''); setLeadOpen(true); }
    catch (error) { setScoreError(error instanceof Error ? error.message : 'Enter a valid score.'); }
  }

  async function submitLead(event: FormEvent) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/[\s()-]/g, '');
    if (cleanName.length < 2) return setLeadError('Please enter your full name.');
    if (!/^(?:\+91)?[6-9]\d{9}$/.test(cleanPhone)) return setLeadError('Enter a valid 10-digit Indian mobile number.');
    setSubmitting(true); setLeadError('');
    try {
      const enteredScore = validateScore(score);
      const result = predictRank(enteredScore);
      await saveLead({ type: 'neet_pg_rank_prediction', name: cleanName, phone: cleanPhone, score: enteredScore, predictedRank: result.predictedRank, predictedFrom: result.rankFrom, predictedTo: result.rankTo, scoreOutOf720: enteredScore, convertedScoreOutOf800: result.equivalentLegacyScore, predictedAIR: result.predictedRank, rankFrom: result.rankFrom, rankTo: result.rankTo, submittedAt: new Date().toISOString() });
      setCandidateName(cleanName.split(/\s+/)[0]); setPrediction(result); setLeadOpen(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
    } catch { setLeadError('Something went wrong. Please try again.'); }
    finally { setSubmitting(false); }
  }

  return (
    <main className="brand-shell min-h-screen overflow-hidden">
      <div className="orb orb-one" /><div className="orb orb-two" /><div className="orb orb-three" />
      <header className="glass-panel brand-ring sticky top-2.5 z-30 mx-3 mt-2.5 flex items-center justify-between rounded-full px-3.5 py-2 shadow-lg sm:mx-6 sm:mt-4 sm:px-6 sm:py-2.5">
        <a href="https://www.tabindia.org/pg" target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2.5" aria-label="Open TAB India PG website">
          <img src="/brand/logo.png" alt="TAB India" className="h-9 w-auto object-contain sm:h-10" />
          <span className="h-5 w-px bg-[#123d63]/15" />
          <span className="truncate text-[10px] font-black uppercase tracking-[.18em] text-[#f26430] sm:text-sm sm:tracking-[.24em]">NEET PG 2026</span>
        </a>
        <a href="https://www.tabindia.org/pg" target="_blank" rel="noreferrer" className="portal-link">PG Website <ExternalLink className="size-3.5" /></a>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8">
        <section className="grid items-center gap-7 lg:grid-cols-[.92fr_1.08fr] lg:gap-14">
          <div className="fade-up text-center lg:text-left">
            <div className="data-pill"><span className="pulse-dot" /> Based on NEET PG 2025 data</div>
            <h1 className="headline mx-auto mt-5 max-w-2xl text-[2.55rem] font-black leading-[.98] text-[#082b4c] sm:text-6xl lg:mx-0 lg:text-7xl">Your score.<br /><span className="gradient-text">Your predicted rank.</span></h1>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-slate-600 sm:text-lg sm:leading-8 lg:mx-0">Enter your expected NEET PG score out of 720 to estimate your All India Rank.</p>
            <div className="mt-6 flex items-center justify-center gap-5 text-xs font-semibold text-slate-500 lg:justify-start">
              <span className="flex items-center gap-1.5"><TrendingUp className="size-4 text-[#f26430]" /> Instant estimate</span>
              <span className="flex items-center gap-1.5"><LockKeyhole className="size-4 text-[#f26430]" /> Secure details</span>
            </div>
          </div>

          <div id="predictor" className="slide-right relative">
            <div className="predictor-glow" />
            <div className="predictor-card relative overflow-hidden rounded-[1.75rem] p-5 sm:rounded-[2.25rem] sm:p-9">
              <div className="mb-6 flex items-start justify-between gap-3 sm:mb-8">
                <div><p className="eyebrow">Rank predictor</p><h2 className="headline mt-1.5 text-2xl font-black text-[#082b4c] sm:text-4xl">Find your AIR</h2></div>
                <div className="score-range"><span>Maximum</span><strong>720</strong></div>
              </div>
              <form onSubmit={(event) => { event.preventDefault(); openDetails(); }} className="space-y-5 sm:space-y-6">
                <label className="block space-y-2" htmlFor="score"><span className="field-label">Expected score</span><div className="score-input-wrap"><Input id="score" value={score} onChange={(event) => { setScore(event.target.value); setScoreError(''); setPrediction(null); }} type="number" min="0" max="720" step="1" inputMode="numeric" placeholder="545" className="h-auto min-w-0 border-0 bg-transparent px-4 py-3.5 text-4xl font-black text-[#082b4c] shadow-none outline-none focus-visible:ring-0 sm:py-4 sm:text-5xl" /><span className="shrink-0 pr-4 text-xs font-extrabold text-slate-400 sm:text-sm">/ 720</span></div></label>
                <div className="space-y-2"><div className="flex justify-between text-[11px] font-semibold text-slate-400"><span>0</span><span className="text-[#e85926]">{validScore ? `${numericScore} marks` : 'Enter marks'}</span><span>720</span></div><div className="score-track"><div className="score-fill" style={{ width: `${progress}%` }} /></div></div>
                {scoreError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{scoreError}</p>}
                <Button type="submit" className="predict-button h-auto w-full rounded-2xl py-4 text-base font-extrabold sm:py-[1.1rem] sm:text-lg">Predict my rank <ArrowRight className="size-5" /></Button>
                <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400"><Sparkles className="size-3.5 text-[#f26430]" /> Estimated from NEET PG 2025 trends</p>
              </form>
            </div>
          </div>
        </section>

        {prediction && <section ref={resultRef} className="fade-up mx-auto mt-8 max-w-4xl sm:mt-12" aria-live="polite"><div className="result-card overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]"><div className="result-top p-5 text-white sm:p-8"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.25em] text-white/60">Estimated All India Rank</p><h2 className="headline mt-1.5 text-2xl font-black sm:text-4xl">{candidateName}, your AIR could be</h2></div><div className="score-chip"><span>Score</span><strong>{prediction.enteredScore}</strong></div></div></div><div className="bg-white p-5 sm:p-8"><p className="headline gradient-text text-5xl font-black sm:text-7xl">{formatRank(prediction.predictedRank)}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="result-stat"><span>Expected range</span><strong>{formatRank(prediction.rankFrom)} – {formatRank(prediction.rankTo)}</strong></div><div className="result-stat"><span>Data reference</span><strong>NEET PG 2025</strong></div></div><p className="mt-5 text-xs leading-5 text-slate-400">This is an estimate based on previous-year trends. The official rank may vary.</p></div></div></section>}
        <footer className="mt-10 text-center text-[11px] leading-5 text-slate-400 sm:mt-14">© 2026 TAB India · NEET PG Rank Predictor</footer>
      </div>

      <Dialog open={leadOpen} onOpenChange={setLeadOpen}><DialogContent className="modal-card overflow-hidden rounded-[1.6rem] border-0 bg-white p-0 sm:max-w-md"><div className="modal-top px-5 py-5 text-white sm:px-6"><DialogHeader><p className="text-[10px] font-bold uppercase tracking-[.25em] text-white/60">Your result is ready</p><DialogTitle className="headline text-2xl font-black text-white sm:text-3xl">View your predicted AIR</DialogTitle><DialogDescription className="text-sm text-white/75">Enter your details to continue.</DialogDescription></DialogHeader></div><form onSubmit={submitLead} className="space-y-4 p-5 sm:p-6"><label className="block space-y-2" htmlFor="name"><span className="field-label">Full name</span><Input id="name" autoFocus autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input-field" /></label><label className="block space-y-2" htmlFor="phone"><span className="field-label">Mobile number</span><Input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" className="input-field" /></label>{leadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{leadError}</p>}<Button type="submit" disabled={submitting} className="predict-button h-auto w-full rounded-xl py-3.5 font-extrabold">{submitting ? 'Calculating…' : 'View my rank'} <ArrowRight /></Button><p className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400"><Check className="size-3 text-emerald-500" /> Your information is securely submitted.</p></form></DialogContent></Dialog>
    </main>
  );
}
