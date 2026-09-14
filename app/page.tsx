'use client'

import { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Box,
  Check,
  ChevronDown,
  Clock3,
  CloudUpload,
  FileArchive,
  FileImage,
  FilePlus2,
  FileText,
  Files,
  Gauge,
  History,
  Info,
  Layers3,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  PackageCheck,
  PanelTop,
  Plus,
  RotateCw,
  Scissors,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react'

const tools = [
  ['Smart Prepare', 'The full notes workflow, automated.', Sparkles, 'MOST USED'],
  ['Split PDF', 'Break one file into clean parts.', Scissors, 'ORGANIZE'],
  ['Merge PDF', 'Combine files in the order you need.', Files, 'ORGANIZE'],
  ['PDF → JPG', 'Turn pages into crisp images.', FileImage, 'CONVERT'],
  ['Compress PDF', 'Make sharing lighter, not harder.', Gauge, 'OPTIMIZE'],
  ['PDF Info', 'See what is inside, at a glance.', Info, 'INSPECT'],
  ['Extract Pages', 'Pull only the pages that matter.', FilePlus2, 'ORGANIZE'],
  ['Reorder Pages', 'Put every page in its right place.', Layers3, 'ORGANIZE'],
  ['Delete Pages', 'Remove the noise in seconds.', Trash2, 'ORGANIZE'],
  ['Rotate Pages', 'Fix orientation without the fuss.', RotateCw, 'ORGANIZE'],
  ['PDF → ZIP', 'Package a complete handoff.', FileArchive, 'EXPORT'],
  ['Batch Convert', 'Process a whole class at once.', Box, 'CONVERT'],
] as const

const recentProjects = [
  { name: 'Anatomy TD · Annotated', meta: '217 MB · 560 pages', time: '12 min ago', tone: 'violet' },
  { name: 'Pathology Class Notes', meta: '84 MB · 320 pages', time: 'Yesterday', tone: 'coral' },
  { name: 'Pharmacology Revision', meta: '46 MB · 188 pages', time: 'Mon, 9:42 AM', tone: 'blue' },
]

type Part = { name: string; start: number; end: number }

export default function Page() {
  const [activeTool, setActiveTool] = useState('Smart Prepare')
  const [demoLoaded, setDemoLoaded] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [complete, setComplete] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [parts, setParts] = useState<Part[]>([
    { name: 'Part 01', start: 1, end: 100 },
    { name: 'Part 02', start: 101, end: 200 },
    { name: 'Part 03', start: 201, end: 300 },
    { name: 'Part 04', start: 301, end: 400 },
    { name: 'Part 05', start: 401, end: 560 },
  ])
  const [outputs, setOutputs] = useState(['PDF', 'JPG'])

  const coverage = useMemo(() => {
    const covered = parts.reduce((sum, part) => sum + Math.max(0, part.end - part.start + 1), 0)
    return Math.min(100, Math.round((covered / 560) * 100))
  }, [parts])

  function loadDemo() {
    setDemoLoaded(true)
    setComplete(false)
    setProcessing(false)
    document.getElementById('smart-prepare')?.scrollIntoView({ behavior: 'smooth' })
  }

  function startProcessing() {
    setProcessing(true)
    setComplete(false)
    window.setTimeout(() => {
      setProcessing(false)
      setComplete(true)
    }, 1800)
  }

  function updatePart(index: number, key: 'start' | 'end', value: string) {
    const next = [...parts]
    next[index] = { ...next[index], [key]: Number(value) || 0 }
    setParts(next)
  }

  function addPart() {
    setParts([...parts, { name: `Part ${String(parts.length + 1).padStart(2, '0')}`, start: 1, end: 1 }])
  }

  function removePart(index: number) {
    setParts(parts.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf8] text-[#17161a]">
      <header className="sticky top-0 z-50 border-b border-black/[0.07] bg-[#fbfaf8]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <a href="#home" className="flex items-center gap-2.5 font-semibold tracking-[-0.03em]">
            <span className="grid size-8 place-items-center rounded-[10px] bg-[#5d46d9] text-white shadow-[0_6px_18px_rgba(93,70,217,.25)]"><Sparkles size={16} /></span>
            <span className="text-[17px]">NOTECRAFT</span>
          </a>
          <nav className="hidden items-center gap-7 text-[13px] font-medium text-[#66636d] lg:flex">
            <a href="#home" className="transition-colors hover:text-[#5d46d9]">Home</a>
            <a href="#tools" className="transition-colors hover:text-[#5d46d9]">Tools</a>
            <a href="#smart-prepare" className="transition-colors hover:text-[#5d46d9]">Smart Prepare</a>
            <a href="#history" className="transition-colors hover:text-[#5d46d9]">History</a>
            <a href="#how" className="transition-colors hover:text-[#5d46d9]">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={loadDemo} className="hidden rounded-full bg-[#17161a] px-4 py-2.5 text-[12px] font-semibold text-white transition-transform hover:-translate-y-0.5 sm:block">New project <ArrowRight className="ml-1 inline" size={13} /></button>
            <button aria-label="Open navigation" onClick={() => setMobileNav(!mobileNav)} className="rounded-full border border-black/10 p-2 lg:hidden"><Menu size={17} /></button>
            <div className="grid size-9 place-items-center rounded-full border border-[#dedbe5] bg-white text-[11px] font-semibold">JD</div>
          </div>
        </div>
        {mobileNav && <nav className="flex flex-col gap-4 border-t border-black/[0.06] px-5 py-5 text-sm lg:hidden"><a href="#home">Home</a><a href="#tools">Tools</a><a href="#smart-prepare">Smart Prepare</a><a href="#history">History</a></nav>}
      </header>

      <section id="home" className="relative mx-auto grid max-w-[1240px] items-center gap-14 px-5 pb-20 pt-20 lg:grid-cols-[.92fr_1.08fr] lg:px-8 lg:pb-28 lg:pt-28">
        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dcd6f8] bg-[#f2efff] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[.16em] text-[#5d46d9]"><span className="size-1.5 rounded-full bg-[#fa725e]" /> Internal productivity workspace</div>
          <h1 className="max-w-[610px] text-[clamp(3.8rem,7vw,6.8rem)] font-semibold leading-[.91] tracking-[-.085em]">Your faculty PDFs.<br /><span className="text-[#5d46d9]">Ready in minutes.</span></h1>
          <p className="mt-7 max-w-[500px] text-[18px] leading-8 text-[#6e6a75]">One powerful workspace for turning large annotated faculty PDFs into clean, upload-ready notes.</p>
          <div className="mt-9 flex flex-wrap gap-3"><button onClick={loadDemo} className="group rounded-full bg-[#5d46d9] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(93,70,217,.2)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(93,70,217,.28)]">Start preparing <ArrowRight className="ml-2 inline transition-transform group-hover:translate-x-1" size={15} /></button><a href="#tools" className="rounded-full border border-black/10 bg-white px-5 py-3.5 text-sm font-semibold transition-colors hover:border-[#5d46d9]">Explore tools</a></div>
          <div className="mt-12 flex items-center gap-3 text-xs text-[#8b8791]"><div className="flex -space-x-2"><span className="grid size-7 place-items-center rounded-full border-2 border-[#fbfaf8] bg-[#d9d1ff] text-[9px] font-bold">AM</span><span className="grid size-7 place-items-center rounded-full border-2 border-[#fbfaf8] bg-[#ffd3c5] text-[9px] font-bold">RK</span><span className="grid size-7 place-items-center rounded-full border-2 border-[#fbfaf8] bg-[#c9e6e1] text-[9px] font-bold">+8</span></div> Used every week by our notes team</div>
        </div>
        <div className="relative min-h-[420px] lg:min-h-[520px]">
          <div className="absolute -right-16 top-8 size-72 rounded-full bg-[#ddd7ff] opacity-50 blur-3xl" />
          <div className="absolute left-6 top-20 h-[360px] w-[270px] rotate-[-8deg] rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_30px_70px_rgba(34,25,75,.12)]"><div className="mb-12 flex justify-between"><span className="rounded bg-[#f0edff] px-2 py-1 text-[9px] font-bold text-[#5d46d9]">PDF</span><MoreHorizontal size={17} className="text-[#aaa5b2]" /></div><div className="h-2 w-32 rounded bg-[#24212c]" /><div className="mt-3 h-2 w-44 rounded bg-[#eceaf0]" /><div className="mt-10 space-y-3"><div className="h-2 w-full rounded bg-[#eceaf0]" /><div className="h-2 w-11/12 rounded bg-[#eceaf0]" /><div className="h-2 w-4/5 rounded bg-[#eceaf0]" /><div className="h-20 rounded-xl bg-[#f4f1ff]" /></div><div className="absolute bottom-7 left-6 right-6 flex items-center justify-between text-[10px] text-[#9d98a4]"><span>Annotated notes</span><span>560 pages</span></div></div>
          <div className="absolute right-0 top-8 w-[270px] rounded-[24px] border border-black/10 bg-[#19171d] p-5 text-white shadow-[0_30px_70px_rgba(34,25,75,.22)]"><div className="flex items-center justify-between text-[11px] text-white/55"><span>PROCESSING</span><span className="text-[#b8aaff]">67%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-[#8d79ff]" /></div><div className="mt-9 flex items-center gap-3"><span className="grid size-8 place-items-center rounded-xl bg-[#6651e1]"><Zap size={15} /></span><div><p className="text-sm font-medium">Preparing notes</p><p className="mt-1 text-[10px] text-white/45">Converting Part 3 · Page 184</p></div></div><div className="mt-8 space-y-3 text-xs"><p className="flex items-center gap-2"><Check size={13} className="text-[#9fd7bc]" /> Reading PDF</p><p className="flex items-center gap-2"><Check size={13} className="text-[#9fd7bc]" /> Creating page ranges</p><p className="flex items-center gap-2 text-white/70"><span className="size-2 rounded-full bg-[#ff907d]" /> Converting pages</p></div></div>
          <div className="absolute bottom-14 left-1/2 w-[228px] -translate-x-1/2 rotate-[5deg] rounded-[20px] border border-black/10 bg-white p-4 shadow-[0_24px_55px_rgba(34,25,75,.14)]"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#fff0ec] text-[#fa725e]"><PackageCheck size={18} /></span><div><p className="text-sm font-semibold">Ready to upload</p><p className="mt-1 text-[10px] text-[#8f8a96]">5 parts · 560 JPGs</p></div></div></div>
        </div>
      </section>

      <section className="border-y border-black/[0.06] bg-white/70"><div className="mx-auto grid max-w-[1240px] grid-cols-2 divide-x divide-black/[0.07] lg:grid-cols-4">{[['200+', 'MB · large file support'], ['1 click', 'multi-step preparation'], ['12', 'focused tools'], ['100%', 'built for our workflow']].map(([value, label]) => <div key={value} className="px-5 py-7 lg:px-8"><p className="text-[28px] font-semibold tracking-[-.05em]">{value}</p><p className="mt-1 text-xs text-[#87828d]">{label}</p></div>)}</div></section>

      <section id="smart-prepare" className="mx-auto max-w-[1240px] scroll-mt-20 px-5 py-24 lg:px-8 lg:py-32">
        <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#fff0ec] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-[#e95f4d]"><Sparkles size={12} /> Most powerful</div><h2 className="max-w-[680px] text-4xl font-semibold tracking-[-.06em] lg:text-6xl">Why do it manually<br /><span className="text-[#5d46d9]">when one workflow can?</span></h2></div><p className="max-w-[310px] text-sm leading-6 text-[#7b7681]">Smart Prepare turns one large faculty PDF into organized, upload-ready notes in a single pass.</p></div>
        <div className="overflow-hidden rounded-[28px] border border-black/[0.08] bg-white shadow-[0_25px_80px_rgba(37,23,80,.08)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.07] px-5 py-4 lg:px-7"><div className="flex items-center gap-3 text-sm font-semibold"><span className="grid size-8 place-items-center rounded-lg bg-[#f0edff] text-[#5d46d9]"><FileText size={16} /></span> Smart Prepare <span className="rounded-full bg-[#f4f2f7] px-2 py-1 text-[10px] font-medium text-[#827d89]">Demo mode</span></div><div className="flex items-center gap-2 text-xs text-[#8a8590]"><span className="size-2 rounded-full bg-[#a6d9bd]" /> Ready to prepare</div></div>
          <div className="grid lg:grid-cols-[.75fr_1.25fr]">
            <div className="border-b border-black/[0.07] bg-[#fdfcfe] p-5 lg:border-b-0 lg:border-r lg:p-7"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#98939e]">01 · Upload</p><p className="mt-2 text-lg font-semibold">Start with a PDF</p></div><CloudUpload className="text-[#5d46d9]" size={20} /></div>{!demoLoaded ? <button onClick={loadDemo} className="group flex min-h-[205px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfc8ed] bg-[#f6f3ff] text-center transition-all hover:border-[#5d46d9] hover:bg-[#f1edff]"><span className="mb-4 grid size-12 place-items-center rounded-2xl bg-white text-[#5d46d9] shadow-sm transition-transform group-hover:-translate-y-1"><UploadCloud size={21} /></span><span className="text-sm font-semibold">Drop a PDF here</span><span className="mt-2 text-xs text-[#8b8496]">or click to browse · up to 500 MB</span><span className="mt-4 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#5d46d9]">Try demo instead</span></button> : <div className="rounded-2xl border border-[#ded9ef] bg-white p-4"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#f0edff] text-[#5d46d9]"><FileText size={18} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Anatomy_TD_Annotated.pdf</p><p className="mt-1 text-xs text-[#8a8590]">217.4 MB · 560 pages</p></div><Check size={16} className="text-[#47a477]" /></div><div className="mt-5 h-1.5 rounded-full bg-[#ece9f5]"><div className="h-full w-full rounded-full bg-[#5d46d9]" /></div><p className="mt-2 text-[10px] text-[#8a8590]">Demo file loaded · large file mode</p></div>}<div className="mt-6 rounded-2xl bg-[#f7f6f8] p-4"><div className="flex items-center gap-2 text-xs font-semibold"><LockKeyhole size={14} className="text-[#5d46d9]" /> Files stay in your workspace</div><p className="mt-2 text-[11px] leading-5 text-[#8a8590]">Demo files are local to this experience. Production storage can be connected to your private worker.</p></div></div>
            <div className="p-5 lg:p-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#98939e]">02 · Select ranges</p><p className="mt-2 text-lg font-semibold">How should we split it?</p></div><div className="flex items-center gap-2 rounded-full bg-[#f5f4f7] px-3 py-2 text-xs"><span className="font-semibold text-[#5d46d9]">{coverage}%</span><span className="text-[#89848e]">covered</span></div></div><div className="mt-6 h-2 overflow-hidden rounded-full bg-[#f0edf5]"><div className="h-full rounded-full bg-gradient-to-r from-[#5d46d9] via-[#8977ef] to-[#fa725e] transition-all" style={{ width: `${coverage}%` }} /></div><div className="mt-2 flex justify-between text-[10px] text-[#9b96a0]"><span>Page 1</span><span>Page 560</span></div><div className="mt-5 space-y-2.5">{parts.map((part, index) => <div key={`${part.name}-${index}`} className="group flex flex-wrap items-center gap-2 rounded-xl border border-black/[0.07] bg-white p-2.5 transition-shadow hover:shadow-[0_8px_22px_rgba(37,23,80,.06)]"><span className="grid size-7 place-items-center rounded-lg bg-[#f3f0ff] text-[10px] font-bold text-[#5d46d9]">{String(index + 1).padStart(2, '0')}</span><input aria-label={`${part.name} name`} value={part.name} onChange={(e) => { const next = [...parts]; next[index] = { ...next[index], name: e.target.value }; setParts(next) }} className="w-20 bg-transparent text-xs font-semibold outline-none" /><span className="text-[11px] text-[#a19ca7]">Pages</span><input aria-label={`${part.name} start page`} value={part.start} onChange={(e) => updatePart(index, 'start', e.target.value)} className="w-12 rounded-md border border-black/10 px-2 py-1 text-xs outline-none focus:border-[#5d46d9]" type="number" /><span className="text-[#aaa5af]">–</span><input aria-label={`${part.name} end page`} value={part.end} onChange={(e) => updatePart(index, 'end', e.target.value)} className="w-12 rounded-md border border-black/10 px-2 py-1 text-xs outline-none focus:border-[#5d46d9]" type="number" /><span className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"><button aria-label={`Move ${part.name} up`} onClick={() => index > 0 && setParts(parts.map((item, itemIndex) => itemIndex === index - 1 ? parts[index] : itemIndex === index ? parts[index - 1] : item))} className="rounded p-1.5 hover:bg-[#f2efff]"><ArrowUp size={13} /></button><button aria-label={`Move ${part.name} down`} onClick={() => index < parts.length - 1 && setParts(parts.map((item, itemIndex) => itemIndex === index + 1 ? parts[index] : itemIndex === index ? parts[index + 1] : item))} className="rounded p-1.5 hover:bg-[#f2efff]"><ArrowDown size={13} /></button><button aria-label={`Delete ${part.name}`} onClick={() => removePart(index)} className="rounded p-1.5 text-[#d7675a] hover:bg-[#fff1ee]"><X size={13} /></button></span></div>)}</div><button onClick={addPart} className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#5d46d9] hover:underline"><Plus size={14} /> Add part</button><div className="mt-6 grid gap-3 border-t border-black/[0.07] pt-5 md:grid-cols-[1fr_auto] md:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#98939e]">03 · Choose output</p><div className="mt-3 flex flex-wrap gap-2">{['PDF', 'JPG', 'ZIP'].map((output) => <button key={output} onClick={() => setOutputs(outputs.includes(output) ? outputs.filter((item) => item !== output) : [...outputs, output])} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${outputs.includes(output) ? 'border-[#b9adf5] bg-[#f1edff] text-[#5d46d9]' : 'border-black/10 bg-white text-[#87818d]'}`}><span className={`grid size-4 place-items-center rounded border ${outputs.includes(output) ? 'border-[#5d46d9] bg-[#5d46d9] text-white' : 'border-black/20'}`}>{outputs.includes(output) && <Check size={11} />}</span>{output}</button>)}</div></div><button disabled={!demoLoaded || outputs.length === 0 || processing} onClick={startProcessing} className="rounded-xl bg-[#17161a] px-4 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">{processing ? 'Preparing…' : complete ? 'Prepared ✓' : 'Prepare notes'} <ArrowRight className="ml-1 inline" size={13} /></button></div>{(processing || complete) && <div className={`mt-5 rounded-xl p-4 ${complete ? 'bg-[#edf8f1]' : 'bg-[#f5f2ff]'}`}><div className="flex items-center gap-3">{complete ? <span className="grid size-8 place-items-center rounded-full bg-[#bce7cc] text-[#27784b]"><Check size={16} /></span> : <span className="grid size-8 place-items-center rounded-full bg-[#dcd5ff] text-[#5d46d9]"><Zap size={15} /></span>}<div><p className="text-sm font-semibold">{complete ? 'Your notes are ready.' : 'Preparing your notes…'}</p><p className="mt-1 text-[11px] text-[#7d7884]">{complete ? '5 PDF files · 560 JPG pages · 3 ZIP packages' : 'Converting Part 3 · Page 184 / 200'}</p></div></div>{complete && <button className="mt-3 rounded-full bg-white px-3 py-2 text-[11px] font-semibold text-[#27784b] shadow-sm">Download demo outputs <ArrowDown className="ml-1 inline" size={12} /></button>}</div>}</div>
          </div>
        </div>
      </section>

      <section id="how" className="bg-[#f1eff9] px-5 py-24 lg:px-8"><div className="mx-auto max-w-[1240px]"><div className="mb-12 max-w-[560px]"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#5d46d9]">The simple version</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.06em] lg:text-5xl">From messy file to<br />clean handoff.</h2></div><div className="grid gap-5 md:grid-cols-5">{[['01', 'Upload', 'Drop in the large annotated PDF.'], ['02', 'Organize', 'Name parts and set page ranges.'], ['03', 'Choose output', 'Select PDF, JPG, ZIP, or all three.'], ['04', 'Prepare', 'One workflow handles the heavy lifting.'], ['05', 'Download', 'Everything arrives ready to share.']].map(([num, title, desc]) => <div key={num} className="relative rounded-2xl bg-white p-5 shadow-[0_12px_30px_rgba(37,23,80,.04)]"><p className="text-xs font-bold text-[#5d46d9]">{num}</p><h3 className="mt-10 text-base font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-[#87828d]">{desc}</p>{num !== '05' && <ArrowRight className="absolute right-4 top-5 hidden text-[#d3ccef] md:block" size={16} />}</div>)}</div></div></section>

      <section id="tools" className="mx-auto max-w-[1240px] scroll-mt-20 px-5 py-24 lg:px-8 lg:py-32"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#fa725e]">A focused toolkit</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.06em] lg:text-6xl">Everything you need.<br /><span className="text-[#96919b]">Nothing you don&apos;t.</span></h2></div><p className="max-w-[280px] text-sm leading-6 text-[#7b7681]">Every tool is designed around the way our notes actually get prepared.</p></div><div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{tools.map(([title, desc, Icon, category], index) => <button key={title} onClick={() => { setActiveTool(title); document.getElementById('smart-prepare')?.scrollIntoView({ behavior: 'smooth' }) }} className={`group relative flex min-h-[158px] flex-col justify-between rounded-2xl border p-5 text-left transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(37,23,80,.08)] ${activeTool === title ? 'border-[#bdb2f6] bg-[#f5f2ff]' : 'border-black/[0.08] bg-white'}`}><div className="flex items-start justify-between"><span className="grid size-9 place-items-center rounded-xl bg-[#f3f0ff] text-[#5d46d9]"><Icon size={17} /></span><span className="text-[10px] font-bold text-[#b0abb5]">{String(index + 1).padStart(2, '0')}</span></div><div><div className="flex items-center gap-2"><h3 className="text-sm font-semibold">{title}</h3>{title === 'Smart Prepare' && <Sparkles size={12} className="text-[#fa725e]" />}</div><p className="mt-1 text-xs text-[#89848f]">{desc}</p></div><span className="absolute bottom-5 right-5 text-[#c2bdc9] transition-all group-hover:translate-x-1 group-hover:text-[#5d46d9]"><ArrowRight size={15} /></span><span className="absolute right-5 top-14 rounded-full bg-[#f6f4f8] px-2 py-1 text-[8px] font-bold uppercase tracking-[.12em] text-[#9c97a1]">{category}</span></button>)}</div></section>

      <section className="border-y border-black/[0.07] bg-white px-5 py-24 lg:px-8"><div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><div className="mb-5 grid size-12 place-items-center rounded-2xl bg-[#fff0ec] text-[#fa725e]"><LockKeyhole size={20} /></div><h2 className="text-4xl font-semibold tracking-[-.06em] lg:text-5xl">Your files stay<br /><span className="text-[#5d46d9]">yours.</span></h2><p className="mt-5 max-w-[400px] text-sm leading-6 text-[#7b7681]">No bouncing between random PDF websites. NoteCraft is built as an internal workspace for the files your team already trusts.</p></div><div className="grid gap-3 sm:grid-cols-2">{[['Built for large files', 'Designed around the PDFs your workflow actually produces.'], ['One workflow', 'Split, convert, organize, and package without tab-hopping.'], ['Private by design', 'Keep processing inside your application infrastructure.'], ['Simple by default', 'Powerful controls, presented only when you need them.']].map(([title, desc]) => <div key={title} className="rounded-2xl bg-[#fbfaf8] p-5"><h3 className="text-sm font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-[#89848f]">{desc}</p></div>)}</div></div></section>

      <section id="history" className="mx-auto max-w-[1240px] scroll-mt-20 px-5 py-24 lg:px-8"><div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#5d46d9]">Workspace memory</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.06em]">Recent projects</h2></div><button className="hidden items-center gap-2 text-xs font-semibold text-[#5d46d9] sm:flex">View history <ArrowRight size={14} /></button></div><div className="mt-10 grid gap-3 lg:grid-cols-3">{recentProjects.map((project) => <div key={project.name} className="group rounded-2xl border border-black/[0.08] bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(37,23,80,.07)]"><div className="flex items-start justify-between"><span className={`grid size-10 place-items-center rounded-xl ${project.tone === 'violet' ? 'bg-[#f0edff] text-[#5d46d9]' : project.tone === 'coral' ? 'bg-[#fff0ec] text-[#fa725e]' : 'bg-[#ebf6f5] text-[#4b9b91]'}`}><FileText size={18} /></span><button aria-label={`More actions for ${project.name}`} className="text-[#b0abb5]"><MoreHorizontal size={18} /></button></div><h3 className="mt-7 text-sm font-semibold">{project.name}</h3><p className="mt-1 text-xs text-[#89848f]">{project.meta}</p><div className="mt-6 flex items-center justify-between border-t border-black/[0.07] pt-4 text-[10px] text-[#9a95a0]"><span className="flex items-center gap-1.5"><Clock3 size={12} /> {project.time}</span><span className="font-semibold text-[#47a477]">Completed</span></div></div>)}</div></section>

      <footer className="bg-[#17161a] px-5 py-14 text-white lg:px-8"><div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-12 md:flex-row"><div><div className="flex items-center gap-2.5 font-semibold tracking-[-.03em]"><span className="grid size-8 place-items-center rounded-[10px] bg-[#8d79ff]"><Sparkles size={16} /></span> NOTECRAFT</div><p className="mt-5 max-w-[250px] text-sm leading-6 text-white/50">Built to make note preparation ridiculously simple.</p></div><div className="grid grid-cols-2 gap-x-16 gap-y-4 text-xs text-white/55"><a href="#tools" className="hover:text-white">Tools</a><a href="#smart-prepare" className="hover:text-white">Smart Prepare</a><a href="#history" className="hover:text-white">History</a><a href="#how" className="hover:text-white">How it works</a><span className="col-span-2 mt-5 text-[10px] uppercase tracking-[.16em] text-white/30">Internal productivity tool · Light mode only</span></div></div></footer>
    </main>
  )
}
