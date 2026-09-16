'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { ArrowDown, ArrowRight, Check, Download, FileImage, FilePlus2, FileStack, Layers3, Menu, Play, RefreshCw, Scissors, Sparkles, Trash2, Upload, X, Zap } from 'lucide-react'

type Tool = 'merge' | 'split' | 'jpg' | 'image-pdf' | 'pptx'
type Result = { name: string; blob: Blob; meta: string }
const tools: { id: Tool; label: string; eyebrow: string; description: string; icon: typeof Layers3; color: string }[] = [
  { id: 'merge', label: 'Merge PDFs', eyebrow: '01', description: 'Combine files into one ordered document.', icon: Layers3, color: '#5b6fa8' },
  { id: 'split', label: 'Split PDF', eyebrow: '02', description: 'Separate pages or sections into new files.', icon: Scissors, color: '#c97963' },
  { id: 'jpg', label: 'PDF to JPG', eyebrow: '03', description: 'Turn every page into a crisp image.', icon: FileImage, color: '#8a9bba' },
  { id: 'image-pdf', label: 'Images to PDF', eyebrow: '04', description: 'Build a PDF from JPG or PNG files.', icon: FilePlus2, color: '#c97963' },
  { id: 'pptx', label: 'PPTX to images', eyebrow: '05', description: 'Extract slide media locally from presentations.', icon: FileStack, color: '#7b7898' },
]

function download(blob: Blob, name: string) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 500) }
function baseName(name: string) { return name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_ ]/gi, '').trim() || 'document' }

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [tool, setTool] = useState<Tool>('merge')
  const [files, setFiles] = useState<File[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mobileMenu, setMobileMenu] = useState(false)
  const active = tools.find((item) => item.id === tool)!
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (frame) window.cancelAnimationFrame(frame) }
  }, [])

  const accepted = tool === 'image-pdf' ? 'image/jpeg,image/png,image/webp' : tool === 'pptx' ? '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation' : '.pdf,application/pdf'
  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files])

  function chooseTool(next: Tool) { setTool(next); setFiles([]); setResults([]); setError(''); setProgress(0) }
  function addFiles(list: FileList | null) {
    if (!list) return
    const incoming = Array.from(list)
    const valid = incoming.filter((file) => {
      const name = file.name.toLowerCase()
      if (tool === 'image-pdf') return file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/.test(name)
      if (tool === 'pptx') return name.endsWith('.pptx')
      return file.type === 'application/pdf' || name.endsWith('.pdf')
    })
    if (!valid.length) { setError(`Choose ${tool === 'image-pdf' ? 'JPG or PNG images' : tool === 'pptx' ? 'a PPTX presentation' : 'PDF files'} for this tool.`); return }
    if (incoming.some((file) => file.size > 500 * 1024 * 1024)) { setError('Files must be smaller than 500 MB each.'); return }
    setError(''); setResults([]); setFiles((current) => tool === 'split' || tool === 'jpg' || tool === 'pptx' ? [valid[0]] : [...current, ...valid])
  }

  async function run() {
    if (!files.length) { setError('Add a file to begin.'); return }
    setBusy(true); setError(''); setResults([]); setProgress(8)
    try {
      const created: Result[] = []
      if (tool === 'merge') {
        const output = await PDFDocument.create()
        for (let i = 0; i < files.length; i++) { const source = await PDFDocument.load(await files[i].arrayBuffer()); const pages = await output.copyPages(source, source.getPageIndices()); pages.forEach((page) => output.addPage(page)); setProgress(15 + Math.round(((i + 1) / files.length) * 75)) }
        const bytes = await output.save(); created.push({ name: `${baseName(files[0].name)}-merged.pdf`, blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }), meta: `${output.getPageCount()} pages · ${files.length} files` })
      } else if (tool === 'image-pdf') {
        const output = await PDFDocument.create()
        for (let i = 0; i < files.length; i++) { const bytes = await files[i].arrayBuffer(); const image = files[i].type === 'image/png' ? await output.embedPng(bytes) : await output.embedJpg(bytes); const page = output.addPage([image.width, image.height]); page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height }); setProgress(15 + Math.round(((i + 1) / files.length) * 75)) }
        const bytes = await output.save(); created.push({ name: 'images-combined.pdf', blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }), meta: `${files.length} images · PDF` })
      } else if (tool === 'split') {
        const source = await PDFDocument.load(await files[0].arrayBuffer())
        for (let i = 0; i < source.getPageCount(); i++) { const part = await PDFDocument.create(); const [page] = await part.copyPages(source, [i]); part.addPage(page); const bytes = await part.save(); created.push({ name: `${baseName(files[0].name)}-page-${String(i + 1).padStart(2, '0')}.pdf`, blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }), meta: `Page ${i + 1} of ${source.getPageCount()}` }); setProgress(15 + Math.round(((i + 1) / source.getPageCount()) * 75)) }
      } else if (tool === 'jpg') {
        const data = new Uint8Array(await files[0].arrayBuffer())
        const pdf = await getDocument({ data, disableWorker: true, useWorkerFetch: false, isEvalSupported: false, disableFontFace: true }).promise
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const baseViewport = page.getViewport({ scale: 1 })
          const viewport = page.getViewport({ scale: Math.min(2, 1600 / baseViewport.width) })
          const canvas = document.createElement('canvas')
          canvas.width = Math.ceil(viewport.width)
          canvas.height = Math.ceil(viewport.height)
          const context = canvas.getContext('2d')
          if (!context) throw new Error('Canvas rendering is unavailable in this browser.')
          context.save()
          context.fillStyle = '#ffffff'
          context.fillRect(0, 0, canvas.width, canvas.height)
          context.restore()
          await page.render({ canvasContext: context, viewport }).promise
          const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('JPG encoding failed.')), 'image/jpeg', .92))
          created.push({ name: `${baseName(files[0].name)}-page-${String(i).padStart(2, '0')}.jpg`, blob, meta: `JPG image · ${canvas.width} × ${canvas.height}` })
          setProgress(15 + Math.round((i / pdf.numPages) * 75))
        }
      } else {
        const zip = await JSZip.loadAsync(await files[0].arrayBuffer()); const media = Object.keys(zip.files).filter((name) => /^ppt\/media\/.+\.(png|jpe?g|webp)$/i.test(name));
        for (const name of media) { const blob = await zip.files[name].async('blob'); created.push({ name: name.split('/').pop() || 'slide-image', blob, meta: 'Extracted presentation media' }) }
        if (!created.length) setError('This presentation has no embedded JPG, PNG, or WebP images to extract.')
        setProgress(100)
      }
      setResults(created)
    } catch (cause) {
      console.error('[v0] document conversion failed', cause)
      const message = cause instanceof Error ? cause.message.toLowerCase() : ''
      setError(message.includes('password') || message.includes('encrypted') ? 'This PDF is password-protected. Remove its password and try again.' : 'This PDF could not be rendered by the browser. Try exporting an unlocked copy or a smaller PDF.')
    }
    finally { setBusy(false); setProgress(100) }
  }
  async function downloadAll() { if (!results.length) return; const zip = new JSZip(); results.forEach((result) => zip.file(result.name, result.blob)); download(await zip.generateAsync({ type: 'blob' }), `notecraft-${tool}-results.zip`) }

  return <main className="nc-shell" style={{ '--scroll-progress': scrollProgress } as React.CSSProperties}>
    <header className="nc-nav"><a href="#top" className="nc-brand"><span><Sparkles size={16} /></span> NOTECRAFT</a><nav className={mobileMenu ? 'nc-navlinks open' : 'nc-navlinks'}><a href="#studio">Studio</a><a href="#tools">Tools</a><a href="#method">Method</a></nav><button className="nc-menu" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Open navigation"><Menu size={18} /></button><button className="nc-nav-cta" onClick={() => inputRef.current?.click()}>Open files <ArrowRight size={14} /></button></header>
    <section id="top" className="nc-hero"><div className="nc-orbit orbit-one" /><div className="nc-orbit orbit-two" /><div className="nc-hero-copy"><p className="nc-kicker"><span className="nc-pulse" /> Document operations, handled locally</p><h1>Make every page<br /><em>land better.</em></h1><p className="nc-hero-sub">Merge, split, convert, and prepare documents in one beautifully controlled workspace. Your files stay on your device.</p><div className="nc-hero-actions"><a href="#studio" className="nc-primary"><Play size={15} fill="currentColor" /> Start working</a><a href="#tools" className="nc-text-link">Explore the tools <ArrowDown size={14} /></a></div></div><div className="nc-hero-stack" aria-hidden="true"><div className="paper-fragment fragment-one">01 / 08<br /><b>BRIEF</b></div><div className="paper-fragment fragment-two">INDEX<br /><b>READY</b></div><div className="stack-back" /><div className="stack-mid" /><div className="stack-front"><span>DOCUMENT<br /><b>STUDIO</b></span><div className="stack-line" /><small>LOCAL / PRIVATE / READY</small></div></div><div className="nc-scroll-cue"><span>Scroll to work</span><ArrowDown size={14} /></div></section>
    <section id="studio" className="nc-studio"><div className="nc-section-heading"><div><p className="nc-kicker">The workspace</p><h2>One place for<br /><em>the full job.</em></h2></div><p>Choose an operation, add your files, and let your browser do the heavy lifting. No account. No upload queue. No hidden bill.</p></div><div className="nc-studio-grid"><aside className="nc-tool-rail"><p className="rail-label">Choose an operation</p>{tools.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => chooseTool(item.id)} className={tool === item.id ? 'nc-tool active' : 'nc-tool'}><span className="tool-index" style={{ color: item.color }}>{item.eyebrow}</span><Icon size={19} /><span><b>{item.label}</b><small>{item.description}</small></span><ArrowRight size={15} /></button> })}</aside><section className="nc-workbench"><div className="workbench-top"><div><span className="workbench-number">{active.eyebrow} / {active.label}</span><h3>{active.label}</h3></div><span className="local-badge"><Zap size={13} /> Runs locally</span></div><div className="nc-dropzone" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files) }}><input ref={inputRef} type="file" hidden multiple accept={accepted} onChange={(event) => addFiles(event.target.files)} /><div className="drop-icon"><Upload size={22} /></div><h4>{files.length ? `${files.length} file${files.length > 1 ? 's' : ''} ready` : 'Drop files here'}</h4><p>or click to browse · {tool === 'image-pdf' ? 'JPG, PNG, WebP' : tool === 'pptx' ? 'PPTX' : 'PDF'}</p></div>{files.length > 0 && <div className="file-list">{files.map((file, index) => <div className="file-row" key={`${file.name}-${index}`}><span className="file-type">{file.name.split('.').pop()?.toUpperCase()}</span><span className="file-name">{file.name}</span><span className="file-size">{(file.size / 1024 / 1024).toFixed(1)} MB</span><button onClick={() => setFiles(files.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${file.name}`}><X size={15} /></button></div>)}<div className="file-total">{files.length} file{files.length > 1 ? 's' : ''} · {(totalSize / 1024 / 1024).toFixed(1)} MB total</div></div>}{error && <p className="nc-error" role="alert">{error}</p>}<div className="workbench-actions"><button className="nc-run" disabled={busy || !files.length} onClick={run}>{busy ? <><RefreshCw size={15} className="spin" /> Working {progress}%</> : <><Sparkles size={15} /> Run {active.label}</>}</button>{results.length > 0 && <button className="nc-secondary" onClick={downloadAll}><Download size={15} /> Download ZIP</button>}</div>{busy && <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>}{results.length > 0 && <div className="result-panel"><div className="result-heading"><span><Check size={16} /> Ready to download</span><small>{results.length} result{results.length > 1 ? 's' : ''}</small></div>{results.map((result) => <div className="result-row" key={result.name}><div><b>{result.name}</b><small>{result.meta}</small></div><button onClick={() => download(result.blob, result.name)} aria-label={`Download ${result.name}`}><Download size={16} /></button></div>)}</div>}</section></div></section>
    <section id="tools" className="nc-tool-showcase"><div className="nc-showcase-copy"><p className="nc-kicker">Built for momentum</p><h2>Small actions.<br /><em>Remarkable finish.</em></h2><p>From the first upload to the final download, every state is designed to keep you oriented. The result is less friction and more confidence in the file you send next.</p><a className="nc-primary dark" href="#studio">Open the studio <ArrowRight size={14} /></a></div><div className="nc-feature-cards"><article><span>01</span><strong>Order matters</strong><p>Arrange source files before merging. The final PDF follows your sequence exactly.</p></article><article><span>02</span><strong>Pages become assets</strong><p>Export pages as high-quality JPG files, individually or as one downloadable archive.</p></article><article><span>03</span><strong>Private by design</strong><p>Processing stays inside your browser. Nothing is sent to a remote conversion service.</p></article></div></section>
    <section id="method" className="nc-method"><div><p className="nc-kicker">The method</p><h2>Clarity is<br /><em>a feature.</em></h2></div><div className="method-steps"><div><b>01</b><span>Select</span><p>Pick the operation that matches the job.</p></div><div><b>02</b><span>Shape</span><p>Add files, set the order, and check the input.</p></div><div><b>03</b><span>Release</span><p>Download the result, or keep going with another file.</p></div></div></section>
    <footer className="nc-footer"><span>NOTECRAFT</span><span>Document preparation, with intent.</span><span>Local processing · Light mode</span></footer>
  </main>
}
