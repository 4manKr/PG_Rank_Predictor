'use client';

import { FormEvent, useRef, useState } from 'react';
import { ArrowRight, BarChart3, Check, Phone, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';
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
  const scoreNumber = Number(score);
  const validPreview = score !== '' && Number.isInteger(scoreNumber) && scoreNumber >= 0 && scoreNumber <= 720;
  const percentage = validPreview ? (scoreNumber / 720) * 100 : 0;

  function requestPrediction() {
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
    } catch { setLeadError('We could not save your details. Please try again.'); }
    finally { setSubmitting(false); }
  }

  return (
    <main className="brand-shell min-h-screen overflow-hidden">
      <header className="glass-panel brand-ring sticky top-3 z-30 mx-3 mt-3 flex items-center justify-between rounded-full px-4 py-2.5 shadow-lg sm:mx-6 sm:px-6">
        <div className="flex items-center gap-3"><img src="/brand/logo.png" alt="TAB India" className="h-10 w-auto object-contain" /><span className="hidden h-6 w-px bg-[#123d63]/15 sm:block" /><p className="text-[11px] font-black uppercase tracking-[.24em] text-[#f26430] sm:text-sm">NEET PG 2026</p></div>
        <a href="tel:+919311483555" className="inline-flex items-center gap-2 rounded-full border border-[#123d63]/12 bg-white px-3 py-2 text-xs font-bold text-[#123d63] transition hover:border-[#f26430]/40 hover:text-[#f26430] sm:px-4 sm:text-sm"><Phone className="size-4" /><span className="hidden sm:inline">+91 93114 83555</span><span className="sm:hidden">Call us</span></a>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-9 sm:px-6 lg:px-8 lg:pt-14">
        <section className="grid items-center gap-9 lg:grid-cols-[1.02fr_.98fr] lg:gap-14">
          <div className="fade-up space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f26430]/20 bg-[#fff4e7] px-3.5 py-2 text-xs font-extrabold uppercase tracking-[.18em] text-[#d84e1d]"><Sparkles className="size-4" /> Updated 720-mark scale</div>
            <div className="space-y-4"><h1 className="headline max-w-2xl text-4xl font-black leading-[1.04] text-[#0a2844] sm:text-5xl lg:text-6xl">Know your NEET PG rank <span className="text-[#f26430]">in seconds.</span></h1><p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Enter your expected score out of 720 and get an instant 2026 All India Rank estimate from our marks-versus-rank dataset.</p></div>
            <div className="grid grid-cols-3 gap-3">
              {[[BarChart3, 'CSV-backed', 'rank data'], [Stethoscope, 'Built for', 'NEET PG'], [ShieldCheck, 'Private &', 'secure']].map(([Icon, top, bottom]) => { const FeatureIcon = Icon as typeof BarChart3; return <div key={String(top)} className="rounded-2xl border border-[#123d63]/8 bg-white/80 p-3 shadow-sm sm:p-4"><FeatureIcon className="mb-3 size-5 text-[#f26430]" /><p className="text-xs font-bold leading-5 text-[#123d63] sm:text-sm">{String(top)}<br />{String(bottom)}</p></div>; })}
            </div>
            <div className="brand-gradient brand-shadow-sm rounded-[1.75rem] p-5 text-white sm:p-6"><p className="text-xs font-bold uppercase tracking-[.26em] text-white/55">TAB India guidance</p><p className="mt-2 text-lg font-bold leading-7">Your rank is the first step. Our counsellors can help you plan the next one.</p></div>
          </div>

          <div id="predictor" className="slide-right relative">
            <div className="pointer-events-none absolute -left-8 top-10 h-40 w-40 rounded-full bg-[#f26430]/20 blur-3xl" /><div className="pointer-events-none absolute -right-8 bottom-8 h-48 w-48 rounded-full bg-[#123d63]/15 blur-3xl" />
            <div className="glass-panel brand-shadow relative overflow-hidden rounded-[2rem] border border-white/80 p-6 sm:p-8">
              <div className="mb-7 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.32em] text-[#f26430]">Live predictor</p><h2 className="headline mt-2 text-3xl font-black text-[#0a2844]">Predict my AIR</h2></div><div className="rounded-2xl border border-[#123d63]/10 bg-white px-4 py-2.5 text-right shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">Score range</p><p className="headline mt-1 text-xl font-black text-[#123d63]">0–720</p></div></div>
              <form onSubmit={(event) => { event.preventDefault(); requestPrediction(); }} className="space-y-5">
                <label className="block space-y-2" htmlFor="score"><span className="field-label">Expected NEET PG score</span><div className="score-input-wrap"><Input id="score" value={score} onChange={(event) => { setScore(event.target.value); setScoreError(''); }} type="number" min="0" max="720" step="1" inputMode="numeric" placeholder="e.g. 545" className="h-auto border-0 bg-transparent px-4 py-4 text-4xl font-black text-[#0a2844] shadow-none outline-none focus-visible:ring-0" /><span className="pr-4 text-sm font-bold text-slate-400">/ 720</span></div></label>
                <div className="space-y-2"><div className="flex justify-between text-xs font-semibold text-slate-400"><span>0</span><span className="text-[#f26430]">{validPreview ? `${scoreNumber} marks` : 'Enter your score'}</span><span>720</span></div><div className="score-track"><div className="score-fill" style={{ width: `${percentage}%` }} /></div></div>
                {scoreError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{scoreError}</p>}
                <Button type="submit" className="btn-orange h-auto w-full rounded-[1.35rem] py-4 text-base font-extrabold">Get my rank prediction <ArrowRight className="size-5" /></Button>
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">{['Instant result', 'Free to use', 'No sign-up'].map((item) => <span key={item} className="flex items-center gap-1.5"><Check className="size-3.5 text-[#f26430]" />{item}</span>)}</div>
              </form>
            </div>
          </div>
        </section>

        {prediction && <section ref={resultRef} className="fade-up mx-auto mt-12 max-w-4xl" aria-live="polite"><div className="brand-shadow overflow-hidden rounded-[2rem] border border-[#123d63]/8 bg-white"><div className="brand-gradient flex flex-col gap-5 p-6 text-white sm:flex-row sm:items-end sm:justify-between sm:p-8"><div><p className="text-xs font-bold uppercase tracking-[.3em] text-white/55">Your estimated result</p><h2 className="headline mt-2 text-3xl font-black sm:text-4xl">{candidateName}, your predicted AIR is</h2></div><div className="rounded-2xl bg-white/12 px-5 py-3 text-center"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/55">Score</p><p className="headline text-3xl font-black">{prediction.enteredScore}/720</p></div></div><div className="p-6 sm:p-8"><p className="headline text-5xl font-black text-[#f26430] sm:text-7xl">{formatRank(prediction.predictedRank)}</p><p className="mt-3 text-sm text-slate-500">Likely rank range: <strong className="text-[#123d63]">{formatRank(prediction.rankFrom)}–{formatRank(prediction.rankTo)}</strong></p><div className="mt-6 rounded-2xl border border-[#f26430]/12 bg-[#fff8ef] p-4 text-sm leading-6 text-slate-600">Your 720-mark score was proportionally mapped to the historical 800-mark dataset, then interpolated between the nearest CSV rows. This is an estimate, not an official rank.</div></div></div></section>}
        <footer className="mt-14 border-t border-[#123d63]/8 pt-7 text-center text-xs leading-5 text-slate-500"><p>Predictions are indicative and may vary from official results. © 2026 TAB India.</p></footer>
      </div>

      <Dialog open={leadOpen} onOpenChange={setLeadOpen}><DialogContent className="brand-shadow overflow-hidden rounded-[1.75rem] border-0 bg-white p-0 sm:max-w-md"><div className="brand-gradient px-6 py-5 text-white"><DialogHeader><p className="text-[10px] font-bold uppercase tracking-[.28em] text-white/55">One quick step</p><DialogTitle className="headline text-2xl font-black text-white">Where should we send your result?</DialogTitle><DialogDescription className="text-sm text-white/70">Enter your name and phone number to reveal your rank prediction.</DialogDescription></DialogHeader></div><form onSubmit={submitLead} className="space-y-4 p-6"><label className="block space-y-2" htmlFor="name"><span className="field-label">Full name</span><Input id="name" autoFocus autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input-field" /></label><label className="block space-y-2" htmlFor="phone"><span className="field-label">Phone number</span><Input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" className="input-field" /></label>{leadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{leadError}</p>}<Button type="submit" disabled={submitting} className="btn-orange h-auto w-full rounded-xl py-3.5 font-extrabold">{submitting ? 'Calculating…' : 'Show my prediction'} <ArrowRight /></Button><p className="text-center text-[10px] leading-4 text-slate-400">Your details are stored securely for result delivery and counselling follow-up.</p></form></DialogContent></Dialog>
    </main>
  );
}
