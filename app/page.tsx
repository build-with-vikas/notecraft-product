'use client'

import { useMemo, useRef, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import {
  ArrowRight, Check, ChevronDown, CloudUpload, Download, FileArchive, FileImage,
  FileText, History, LockKeyhole, Menu, Scissors, Sparkles, Trash2, X, Zap,
} from 'lucide-react'

type Part = { name: string; start: number; end: number }
type Result = { name: string; blob: Blob; pages: number }

const tools = [
  ['Smart Prepare', 'Organize one PDF into named, upload-ready parts.', Sparkles],
  ['Split PDF', 'Create separate PDFs from page ranges.', Scissors],
  ['Merge PDF', 'Combine documents in the order you choose.', FileArchive],
  ['PDF to JPG', 'Export selected pages as image files.', FileImage],
]

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [parts, setParts] = useState<Part[]>([])
  const [outputs, setOutputs] = useState<string[]>(['PDF'])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [error, setError] = useState('')
  const [mobileNav, setMobileNav] = useState(false)

  const coverage = useMemo(() => {
    if (!pageCount) return 0
    const covered = parts.reduce((total, part) => total + Math.max(0, part.end - part.start + 1), 0)
    return Math.min(100, Math.round((covered / pageCount) * 100))
  }, [parts, pageCount])

  async function inspectPdf(selected: File) {
    setError('')
    setResults([])
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please choose a PDF file.')
      return
    }
    if (selected.size > 500 * 1024 * 1024) {
      setError('This browser-only version supports files up to 500 MB.')
      return
    }
    try {
      const bytes = await selected.arrayBuffer()
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: false })
      const count = doc.getPageCount()
      setFile(selected)
      setPageCount(count)
      setParts([{ name: 'Part 01', start: 1, end: count }])
      document.getElementById('prepare')?.scrollIntoView({ behavior: 'smooth' })
    } catch {
      setError('We could not read this PDF. It may be encrypted or damaged.')
    }
  }

  function validate() {
    if (!file || !pageCount) return 'Choose a PDF before preparing it.'
    if (!parts.length) return 'Add at least one page range.'
    for (const part of parts) {
      if (part.start < 1 || part.end > pageCount || part.start > part.end) return 'Check the page ranges: every range must be within the document.'
    }
    const sorted = [...parts].sort((a, b) => a.start - b.start)
    for (let i = 1; i < sorted.length; i++) if (sorted[i].start <= sorted[i - 1].end) return 'Some ranges overlap. Adjust them before preparing the files.'
    return ''
  }

  async function prepare() {
    const issue = validate()
    if (issue) { setError(issue); return }
    if (!file) return
    setError('')
    setProcessing(true)
    setProgress(8)
    try {
      const source = await PDFDocument.load(await file.arrayBuffer())
      const created: Result[] = []
      for (let index = 0; index < parts.length; index++) {
        const part = parts[index]
        const output = await PDFDocument.create()
        const pages = await output.copyPages(source, Array.from({ length: part.end - part.start + 1 }, (_, i) => part.start - 1 + i))
        pages.forEach((page) => output.addPage(page))
        const bytes = await output.save()
        created.push({ name: `${part.name.replace(/[^a-z0-9-_ ]/gi, '').trim() || `Part ${index + 1}`}.pdf`, blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }), pages: pages.length })
        setProgress(Math.round(((index + 1) / parts.length) * 92))
        await new Promise((resolve) => setTimeout(resolve, 120))
      }
      setResults(created)
      setProgress(100)
    } catch {
      setError('The PDF could not be prepared in this browser. Try a smaller or unlocked file.')
    } finally { setProcessing(false) }
  }

  async function downloadZip() {
    if (!results.length) return
    const zip = new JSZip()
    results.forEach((result) => zip.file(result.name, result.blob))
    const blob = await zip.generateAsync({ type: 'blob' })
    download(blob, `${file?.name.replace(/\.pdf$/i, '') || 'notecraft'}-prepared.zip`)
  }

  function download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = name; anchor.click()
    URL.revokeObjectURL(url)
  }

  function addPart() { setParts([...parts, { name: `Part ${String(parts.length + 1).padStart(2, '0')}`, start: 1, end: 1 }]) }
  function updatePart(index: number, key: keyof Part, value: string) { const next = [...parts]; next[index] = { ...next[index], [key]: key === 'name' ? value : Number(value) || 0 }; setParts(next) }

  return (
    <main className="min-h-screen bg-[#fbfaf8] text-[#17161a]">
      <header className="sticky top-0 z-50 border-b border-black/[0.07] bg-[#fbfaf8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <a href="#home" className="flex items-center gap-2.5 font-semibold tracking-[-.03em]"><span className="grid size-8 place-items-center rounded-[10px] bg-[#5d46d9] text-white"><Sparkles size={16} /></span><span>NOTECRAFT</span></a>
          <nav className="hidden items-center gap-7 text-[13px] font-medium text-[#66636d] lg:flex"><a href="#prepare">Prepare</a><a href="#tools">Tools</a><a href="#how">How it works</a><a href="#history">History</a></nav>
          <div className="flex items-center gap-3"><button onClick={() => inputRef.current?.click()} className="hidden rounded-full bg-[#17161a] px-4 py-2.5 text-[12px] font-semibold text-white sm:block">New document <ArrowRight className="ml-1 inline" size={13} /></button><button aria-label="Open navigation" onClick={() => setMobileNav(!mobileNav)} className="rounded-full border border-black/10 p-2 lg:hidden"><Menu size={17} /></button><div className="grid size-9 place-items-center rounded-full border border-[#dedbe5] bg-white text-[11px] font-semibold">JD</div></div>
        </div>
        {mobileNav && <nav className="flex flex-col gap-4 border-t border-black/[.06] px-5 py-5 text-sm lg:hidden"><a href="#prepare">Prepare</a><a href="#tools">Tools</a><a href="#how">How it works</a><a href="#history">History</a></nav>}
      </header>

      <section id="home" className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 pb-24 pt-24 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:pb-32 lg:pt-32">
        <div><p className="mb-6 text-[11px] font-bold uppercase tracking-[.18em] text-[#5d46d9]">PDF preparation for teaching teams</p><h1 className="max-w-[620px] text-[clamp(3.5rem,7vw,6.7rem)] font-semibold leading-[.91] tracking-[-.085em]">Make every<br /><span className="text-[#5d46d9]">page count.</span></h1><p className="mt-7 max-w-[500px] text-[18px] leading-8 text-[#6e6a75]">Prepare annotated faculty PDFs for upload, sharing, and review without repeating the same file work by hand.</p><div className="mt-9 flex flex-wrap gap-3"><button onClick={() => inputRef.current?.click()} className="rounded-full bg-[#5d46d9] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(93,70,217,.2)]">Choose a PDF <ArrowRight className="ml-2 inline" size={15} /></button><a href="#how" className="rounded-full border border-black/10 bg-white px-5 py-3.5 text-sm font-semibold">See the process</a></div><p className="mt-5 text-xs text-[#8b8791]">Runs in your browser. No subscription required. Your original file stays on your device.</p></div>
        <div className="relative min-h-[430px]"><div className="absolute right-0 top-6 size-72 rounded-full bg-[#ddd7ff] opacity-60 blur-3xl" /><div className="absolute left-4 top-16 h-[350px] w-[270px] rotate-[-8deg] rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_30px_70px_rgba(34,25,75,.12)]"><span className="rounded bg-[#f0edff] px-2 py-1 text-[9px] font-bold text-[#5d46d9]">FACULTY NOTES</span><div className="mt-14 h-2 w-32 rounded bg-[#24212c]" /><div className="mt-3 h-2 w-44 rounded bg-[#eceaf0]" /><div className="mt-10 space-y-3"><div className="h-2 w-full rounded bg-[#eceaf0]" /><div className="h-2 w-11/12 rounded bg-[#eceaf0]" /><div className="h-20 rounded-xl bg-[#f4f1ff]" /></div><p className="absolute bottom-7 text-[10px] text-[#9d98a4]">One source document</p></div><div className="absolute right-0 top-10 w-[275px] rounded-[24px] bg-[#19171d] p-5 text-white shadow-[0_30px_70px_rgba(34,25,75,.22)]"><p className="text-[11px] text-white/55">PREPARATION STATUS</p><div className="mt-4 h-1.5 rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-[#8d79ff]" /></div><div className="mt-9 flex items-center gap-3"><span className="grid size-8 place-items-center rounded-xl bg-[#6651e1]"><Zap size={15} /></span><div><p className="text-sm font-medium">Organizing pages</p><p className="mt-1 text-[10px] text-white/45">Named parts, ready to review</p></div></div><div className="mt-8 space-y-3 text-xs"><p className="flex items-center gap-2"><Check size={13} className="text-[#9fd7bc]" /> Read source PDF</p><p className="flex items-center gap-2"><Check size={13} className="text-[#9fd7bc]" /> Define page ranges</p><p className="flex items-center gap-2 text-white/70"><span className="size-2 rounded-full bg-[#ff907d]" /> Export clean files</p></div></div></div>
      </section>

      <section id="prepare" className="scroll-mt-20 border-y border-black/[.06] bg-white px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto max-w-[1240px]"><div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#fa725e]">The preparation desk</p><h2 className="text-4xl font-semibold tracking-[-.06em] lg:text-6xl">From source PDF<br /><span className="text-[#5d46d9]">to clean handoff.</span></h2></div><p className="max-w-[330px] text-sm leading-6 text-[#7b7681]">Choose a file, review its ranges, and export organized PDFs. Processing happens locally in your browser.</p></div><input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => event.target.files?.[0] && inspectPdf(event.target.files[0])} />
        <div className="overflow-hidden rounded-[28px] border border-black/[.08] shadow-[0_25px_80px_rgba(37,23,80,.08)]"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[.07] px-5 py-4 lg:px-7"><div className="flex items-center gap-3 text-sm font-semibold"><span className="grid size-8 place-items-center rounded-lg bg-[#f0edff] text-[#5d46d9]"><FileText size={16} /></span> Smart Prepare</div><span className="flex items-center gap-2 text-xs text-[#6e6a75]"><span className="size-2 rounded-full bg-[#8bc7a6]" /> {file ? `${pageCount} pages loaded` : 'Waiting for a PDF'}</span></div><div className="grid lg:grid-cols-[.72fr_1.28fr]"><div className="border-b border-black/[.07] bg-[#fdfcfe] p-5 lg:border-b-0 lg:border-r lg:p-7"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#98939e]">01 · Choose document</p>{!file ? <button onClick={() => inputRef.current?.click()} className="group mt-5 flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#cfc8ed] bg-[#f6f3ff] text-center hover:border-[#5d46d9]"><span className="mb-4 grid size-12 place-items-center rounded-2xl bg-white text-[#5d46d9] shadow-sm"><CloudUpload size={21} /></span><span className="text-sm font-semibold">Drop a PDF here</span><span className="mt-2 text-xs text-[#8b8496]">or choose from this device</span><span className="mt-4 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#5d46d9]">PDF up to 500 MB</span></button> : <div className="mt-5 rounded-2xl border border-[#ded9ef] bg-white p-4"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#f0edff] text-[#5d46d9]"><FileText size={18} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{file.name}</p><p className="mt-1 text-xs text-[#8a8590]">{(file.size / 1024 / 1024).toFixed(1)} MB · {pageCount} pages</p></div><button aria-label="Remove PDF" onClick={() => { setFile(null); setPageCount(0); setParts([]); setResults([]) }}><X size={16} /></button></div><div className="mt-5 h-1.5 rounded-full bg-[#ece9f5]"><div className="h-full w-full rounded-full bg-[#5d46d9]" /></div><button onClick={() => inputRef.current?.click()} className="mt-3 text-xs font-semibold text-[#5d46d9]">Choose a different file</button></div>}<div className="mt-6 rounded-2xl bg-[#f7f6f8] p-4"><div className="flex items-center gap-2 text-xs font-semibold"><LockKeyhole size={14} className="text-[#5d46d9]" /> Local processing</div><p className="mt-2 text-[11px] leading-5 text-[#8a8590]">The PDF is read and prepared on this device. Nothing is uploaded to a server in this free version.</p></div>{error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0ec] p-3 text-xs leading-5 text-[#b94d3d]">{error}</p>}</div>
          <div className="p-5 lg:p-7"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#98939e]">02 · Define ranges</p><p className="mt-2 text-lg font-semibold">Name the sections you need</p></div><span className="rounded-full bg-[#f5f4f7] px-3 py-2 text-xs"><b className="text-[#5d46d9]">{coverage}%</b> covered</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-[#f0edf5]"><div className="h-full rounded-full bg-gradient-to-r from-[#5d46d9] to-[#fa725e]" style={{ width: `${coverage}%` }} /></div><div className="mt-5 flex flex-col gap-2.5">{parts.map((part, index) => <div key={index} className="flex flex-wrap items-center gap-2 rounded-xl border border-black/[.07] p-2.5"><span className="grid size-7 place-items-center rounded-lg bg-[#f3f0ff] text-[10px] font-bold text-[#5d46d9]">{String(index + 1).padStart(2, '0')}</span><input aria-label="Part name" value={part.name} onChange={(e) => updatePart(index, 'name', e.target.value)} className="w-24 bg-transparent text-xs font-semibold outline-none" /><span className="text-[11px] text-[#a19ca7]">Pages</span><input aria-label="Start page" type="number" value={part.start} onChange={(e) => updatePart(index, 'start', e.target.value)} className="w-14 rounded-md border border-black/10 px-2 py-1 text-xs" /><span className="text-[#aaa5af]">–</span><input aria-label="End page" type="number" value={part.end} onChange={(e) => updatePart(index, 'end', e.target.value)} className="w-14 rounded-md border border-black/10 px-2 py-1 text-xs" /><button aria-label={`Remove ${part.name}`} onClick={() => setParts(parts.filter((_, i) => i !== index))} className="ml-auto p-1 text-[#aaa5af] hover:text-[#d35a4a]"><Trash2 size={14} /></button></div>)}</div><button onClick={addPart} disabled={!pageCount} className="mt-4 text-xs font-semibold text-[#5d46d9] disabled:opacity-40">+ Add another section</button><div className="mt-8 border-t border-black/[.07] pt-6"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#98939e]">03 · Export</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{['PDF', 'ZIP'].map((output) => <button key={output} onClick={() => setOutputs(outputs.includes(output) ? outputs.filter((item) => item !== output) : [...outputs, output])} className={`rounded-xl border p-3 text-left text-xs font-semibold ${outputs.includes(output) ? 'border-[#bdb2f6] bg-[#f5f2ff] text-[#5d46d9]' : 'border-black/[.08] bg-white text-[#77727d]'}`}><span className="flex items-center justify-between">{output === 'PDF' ? 'Separate PDFs' : 'ZIP archive'} {outputs.includes(output) && <Check size={14} />}</span></button>)}</div><button onClick={prepare} disabled={processing || !file} className="mt-5 w-full rounded-xl bg-[#17161a] px-4 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{processing ? `Preparing files · ${progress}%` : 'Prepare documents'} <ArrowRight className="ml-2 inline" size={15} /></button></div></div></div></div>{results.length > 0 && <div className="mt-5 rounded-[24px] border border-[#cce6d7] bg-[#f3fbf6] p-5 lg:p-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#4c9a6e]">Preparation complete</p><h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">Your files are ready.</h3></div>{outputs.includes('ZIP') && <button onClick={downloadZip} className="rounded-full bg-[#4c9a6e] px-4 py-2.5 text-xs font-semibold text-white"><Download className="mr-2 inline" size={14} /> Download ZIP</button>}</div><div className="mt-5 grid gap-2">{results.map((result) => <div key={result.name} className="flex items-center gap-3 rounded-xl bg-white p-3"><FileText size={16} className="text-[#5d46d9]" /><span className="flex-1 truncate text-xs font-semibold">{result.name}</span><span className="text-[11px] text-[#8a8590]">{result.pages} pages</span><button onClick={() => download(result.blob, result.name)} aria-label={`Download ${result.name}`} className="p-1 text-[#5d46d9]"><Download size={15} /></button></div>)}</div></div>}</div></section>

      <section id="how" className="bg-[#f1eff9] px-5 py-24 lg:px-8"><div className="mx-auto max-w-[1240px]"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#5d46d9]">A clear process</p><h2 className="mt-4 max-w-[620px] text-4xl font-semibold tracking-[-.06em] lg:text-6xl">Less file handling.<br />More time for teaching.</h2><div className="mt-12 grid gap-5 md:grid-cols-4">{[['01', 'Choose', 'Select the PDF from your device.'], ['02', 'Define', 'Name sections and set page ranges.'], ['03', 'Prepare', 'Create separate PDFs in your browser.'], ['04', 'Download', 'Keep the files or package them as a ZIP.']].map(([number, title, description]) => <article key={number} className="rounded-2xl bg-white p-5 shadow-[0_12px_30px_rgba(37,23,80,.04)]"><p className="text-xs font-bold text-[#5d46d9]">{number}</p><h3 className="mt-12 text-base font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-[#87828d]">{description}</p></article>)}</div></div></section>
      <section id="tools" className="mx-auto max-w-[1240px] scroll-mt-20 px-5 py-24 lg:px-8 lg:py-32"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#fa725e]">Tools for the full job</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.06em] lg:text-6xl">A focused toolkit<br /><span className="text-[#96919b]">for document work.</span></h2><div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4">{tools.map(([title, description, Icon]) => <button key={title} onClick={() => document.getElementById('prepare')?.scrollIntoView({ behavior: 'smooth' })} className="group rounded-2xl border border-black/[.08] bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(37,23,80,.08)]"><span className="grid size-9 place-items-center rounded-xl bg-[#f3f0ff] text-[#5d46d9]"><Icon size={17} /></span><h3 className="mt-10 text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-[#89848f]">{description}</p></button>)}</div></section>
      <section id="history" className="border-t border-black/[.07] bg-white px-5 py-24 lg:px-8"><div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><History className="text-[#5d46d9]" size={22} /><h2 className="mt-5 text-4xl font-semibold tracking-[-.06em]">A calmer way to<br />handle PDFs.</h2><p className="mt-5 max-w-[350px] text-sm leading-6 text-[#7b7681]">NoteCraft is intentionally straightforward: one document, one clear preparation path, and files you can download when the work is done.</p></div><div className="rounded-2xl border border-black/[.08] bg-[#fbfaf8] p-6"><div className="flex items-center gap-3"><LockKeyhole className="text-[#5d46d9]" size={18} /><p className="text-sm font-semibold">Designed for local-first work</p></div><p className="mt-3 text-sm leading-6 text-[#7b7681]">This free version does not send your PDF to a server. The browser reads the document, creates the selected files, and offers them for download.</p><div className="mt-6 flex items-center gap-2 text-xs text-[#4c9a6e]"><Check size={14} /> No account required</div><div className="mt-3 flex items-center gap-2 text-xs text-[#4c9a6e]"><Check size={14} /> No subscription required</div></div></div></section>
      <footer className="border-t border-black/[.07] px-5 py-8 lg:px-8"><div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 text-xs text-[#8b8791] sm:flex-row"><span className="font-semibold tracking-[.12em] text-[#17161a]">NOTECRAFT</span><span>PDF preparation, kept clear.</span></div></footer>
    </main>
  )
}
