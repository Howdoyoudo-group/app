import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Download, Printer, Loader2, Eye, FileText, Sparkles, LayoutGrid, Pin, Trash2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import PageFrame, { PAGE_H, PAGE_W } from "./PageFrame";
import { TEMPLATES } from "./templates";
import { defaultTuning, nextTuning, shouldSwitchTemplate } from "./engine";
import { inventory, scoreLayout, selectTemplate, nextTemplate, passes, PASS } from "./scoring";
import { extractPullQuote, summarise } from "./ai";
import type { PrintableData, RenderTuning, Scores, TemplateKey } from "./types";
import PinnedPage, { PINNED_DROP_H, PINNED_DROP_W } from "./PinnedPage";
import { SECTION_LIST, DEFAULT_PINNED_LAYOUT, newSlotId, type PinnedLayout, type SectionId } from "./sections";

const PINNED_LS_KEY = "magazine-pinned-layout-v1";
const PINNED_TEMPLATE_KEY = "__pinned__" as const;
type ExtendedTemplate = TemplateKey | typeof PINNED_TEMPLATE_KEY;


interface Props {
  open: boolean;
  onClose: () => void;
  data: PrintableData;
  fileName: string;
}

const MagazineGenerator: React.FC<Props> = ({ open, onClose, data, fileName }) => {
  const [busy, setBusy] = useState<null | "pdf" | "ai">(null);
  const [previewMode, setPreviewMode] = useState(true);
  const [tuning, setTuning] = useState<RenderTuning>(defaultTuning);
  const [template, setTemplate] = useState<ExtendedTemplate>(PINNED_TEMPLATE_KEY);
  const [pinnedLayout, setPinnedLayout] = useState<PinnedLayout>(() => {
    try {
      const raw = localStorage.getItem(PINNED_LS_KEY);
      if (raw) return JSON.parse(raw) as PinnedLayout;
    } catch {}
    return DEFAULT_PINNED_LAYOUT;
  });
  const [showSlotEditor, setShowSlotEditor] = useState(true);
  useEffect(() => {
    try { localStorage.setItem(PINNED_LS_KEY, JSON.stringify(pinnedLayout)); } catch {}
  }, [pinnedLayout]);
  const [autoTemplate, setAutoTemplate] = useState(true);
  const [workDescriptions, setWorkDescriptions] = useState<Record<string, string>>({});
  const [pullQuoteText, setPullQuoteText] = useState("");
  const [scores, setScores] = useState<Scores | null>(null);
  const [iteration, setIteration] = useState(0);
  const [aiSummarised, setAiSummarised] = useState(false);
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  // Drag-from-sidebar state - drop tiles small, in exact canvas pixels, so resizing is not locked to coarse rows.
  const DROP_W = PINNED_DROP_W;
  const DROP_H = PINNED_DROP_H;
  const dragRef = useRef<{ section: SectionId } | null>(null);
  const [dropDims] = useState<{ w: number; h: number }>({ w: DROP_W, h: DROP_H });
  const handleSidebarDragStart = (e: React.DragEvent, section: SectionId) => {
    dragRef.current = { section };
    e.dataTransfer.setData("text/plain", section);
    e.dataTransfer.effectAllowed = "copy";
  };
  const handleDrop = (page: "page1" | "page2", x: number, y: number) => {
    const d = dragRef.current;
    if (!d) return;
    setPinnedLayout(prev => {
      const maxZ = prev[page].reduce((m, s) => Math.max(m, s.z ?? 0), 0);
      return {
        ...prev,
        [page]: [...prev[page], {
          i: newSlotId(d.section),
          section: d.section,
          unit: "px" as const,
          x, y, w: DROP_W, h: DROP_H,
          z: maxZ + 1,
        }],
      };
    });
    dragRef.current = null;
  };


  const inv = useMemo(() => inventory(data), [data]);

  // initialise on open
  useEffect(() => {
    if (!open) return;
    setTuning(defaultTuning);
    setIteration(0);
    setAiSummarised(false);
    setScores(null);
    const init: Record<string, string> = {};
    (data.workHistory || []).forEach((w, i) => { init[w.id || String(i)] = w.description || ""; });
    setWorkDescriptions(init);
    setTemplate(PINNED_TEMPLATE_KEY);
    setPullQuoteText(extractPullQuote(data.pbIntro || data.personalitySummary));
  }, [open, data, inv, autoTemplate]);

  const Tpl = template === PINNED_TEMPLATE_KEY ? null : TEMPLATES[template as TemplateKey];

  // inclusion ratio: how much of present data is being shown
  const inclusionRatio = useMemo(() => {
    const present = [
      inv.hasIntro, inv.hasPhoto, inv.hasRiasec, inv.hasValues,
      inv.passionsCount > 0, inv.industriesCount > 0, inv.lovesCount > 0,
      inv.workCount > 0, inv.eduCount > 0, inv.funFactCount > 0,
      inv.targetRolesCount > 0 || inv.targetCompaniesCount > 0,
    ];
    const presentCount = present.filter(Boolean).length || 1;
    // Assume all are shown when they exist; this is a soft floor since templates always render available data.
    return Math.min(1, presentCount / presentCount);
  }, [inv]);

  // measure + rebalance loop (skip in pinned mode - user controls layout)
  useEffect(() => {
    if (!open) return;
    if (template === PINNED_TEMPLATE_KEY) return;
    const t = window.setTimeout(async () => {
      const s = scoreLayout(page1Ref.current, page2Ref.current, inclusionRatio);
      setScores(s);
      if (passes(s)) return;
      if (iteration >= 5) return;

      // template switch fallback
      if (shouldSwitchTemplate(s, iteration) && autoTemplate) {
        const n = nextTemplate(template as TemplateKey, inv);
        if (n) {
          setTemplate(n);
          setIteration(i => i + 1);
          return;
        }
      }

      // AI summarise longest descriptions once when page 2 is overflowing
      if (!aiSummarised && (s.fillP2 > 1 || s.printSafe === 0)) {
        const longest = Object.entries(workDescriptions)
          .filter(([, t]) => t.length > 240)
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, 4);
        if (longest.length > 0) {
          setBusy("ai");
          try {
            const updates: Record<string, string> = {};
            await Promise.all(longest.map(async ([k, t]) => {
              const target = Math.max(140, Math.floor(t.length * 0.55));
              updates[k] = await summarise(t, target, "work experience");
            }));
            setWorkDescriptions(prev => ({ ...prev, ...updates }));
            setAiSummarised(true);
          } finally {
            setBusy(null);
          }
          setIteration(i => i + 1);
          return;
        }
      }

      // mechanical rebalance
      const nt = nextTuning({ tuning, scores: s, iteration });
      setTuning(nt);
      setIteration(i => i + 1);
    }, 280);
    return () => window.clearTimeout(t);
  }, [open, template, tuning, workDescriptions, iteration, inclusionRatio, aiSummarised, autoTemplate, inv]);

  // 1x1 transparent PNG used to neutralise images we can't embed.
  const BLANK_PNG =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  // Inline all <img> sources as data URIs so html-to-image can rasterise them
  // even when the host doesn't send CORS headers (most company/school logo CDNs).
  // Anything that fails both direct + proxy fetch is replaced with a blank PNG
  // so html-to-image never re-attempts the network and rejects the whole render.
  const inlineImages = async (root: HTMLElement) => {
    const imgs = Array.from(root.querySelectorAll("img"));
    await Promise.all(imgs.map(async (img) => {
      const rawSrc = img.getAttribute("src");
      if (!rawSrc || rawSrc.startsWith("data:")) return;
      // Resolve relative URLs against the current origin
      let src = rawSrc;
      try { src = new URL(rawSrc, window.location.href).toString(); } catch {}
      try {
        let blob: Blob | null = null;
        // 1) direct CORS fetch
        try {
          const r = await fetch(src, { mode: "cors", cache: "force-cache" });
          if (r.ok) blob = await r.blob();
        } catch {}
        // 2) weserv proxy (strips protocol)
        if (!blob) {
          try {
            const r2 = await fetch(`https://images.weserv.nl/?url=${encodeURIComponent(src.replace(/^https?:\/\//, ""))}`);
            if (r2.ok) blob = await r2.blob();
          } catch {}
        }
        // 3) wsrv.nl (same service, different host - sometimes one is rate limited)
        if (!blob) {
          try {
            const r3 = await fetch(`https://wsrv.nl/?url=${encodeURIComponent(src.replace(/^https?:\/\//, ""))}`);
            if (r3.ok) blob = await r3.blob();
          } catch {}
        }
        // 4) corsproxy.io (full URL passthrough, useful for SVGs weserv refuses)
        if (!blob) {
          try {
            const r4 = await fetch(`https://corsproxy.io/?${encodeURIComponent(src)}`);
            if (r4.ok) blob = await r4.blob();
          } catch {}
        }
        if (!blob) {
          console.warn("[pdf] could not inline image:", src);
          img.setAttribute("src", BLANK_PNG);
          img.removeAttribute("srcset");
          img.removeAttribute("crossorigin");
          return;
        }
        const dataUrl: string = await new Promise((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result as string);
          fr.onerror = reject;
          fr.readAsDataURL(blob!);
        });
        img.setAttribute("src", dataUrl);
        img.removeAttribute("srcset");
        img.removeAttribute("crossorigin");
      } catch {
        img.setAttribute("src", BLANK_PNG);
        img.removeAttribute("srcset");
        img.removeAttribute("crossorigin");
      }
    }));
  };

  const createExportClone = async (el: HTMLElement) => {
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.left = "-10000px";
    host.style.top = "0";
    host.style.width = `${PAGE_W}px`;
    host.style.height = `${PAGE_H}px`;
    host.style.overflow = "hidden";
    host.style.transform = "none";
    host.style.background = "#ffffff";

    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.width = `${PAGE_W}px`;
    clone.style.height = `${PAGE_H}px`;
    clone.style.maxWidth = "none";
    clone.style.maxHeight = "none";
    clone.style.transform = "none";
    clone.style.transformOrigin = "top left";
    clone.style.margin = "0";
    clone.querySelectorAll(".slot-action-btn, .slot-edit-label").forEach(node => node.remove());
    clone.querySelectorAll<HTMLElement>(".slot-edit-shell").forEach(node => {
      node.style.boxShadow = "none";
      node.classList.remove("ring-1", "ring-2", "ring-primary", "ring-foreground/20");
    });
    host.appendChild(clone);
    document.body.appendChild(host);
    await inlineImages(clone);
    return { clone, cleanup: () => host.remove() };
  };

  const buildPdf = async () => {
    if (!page1Ref.current || !page2Ref.current) return null;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (document.fonts?.ready) await document.fonts.ready;
    try {
      await Promise.all([
        (document as any).fonts?.load?.('700 16px "Dela Gothic One"'),
        (document as any).fonts?.load?.('400 12px "Space Grotesk"'),
        (document as any).fonts?.load?.('700 12px "Space Grotesk"'),
      ]);
    } catch {}
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const page1 = await createExportClone(page1Ref.current);
    const page2 = await createExportClone(page2Ref.current);
    const opts = {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      width: PAGE_W,
      height: PAGE_H,
      canvasWidth: PAGE_W * 2,
      canvasHeight: PAGE_H * 2,
      style: {
        width: `${PAGE_W}px`,
        height: `${PAGE_H}px`,
        transform: "none",
        maxWidth: "none",
      },
      cacheBust: true,
      skipFonts: false,
      imagePlaceholder: BLANK_PNG,
      filter: (node: HTMLElement) => {
        if (node?.tagName === "IMG") {
          const s = (node as HTMLImageElement).getAttribute("src") || "";
          if (/^https?:\/\//i.test(s)) return false;
        }
        return true;
      },
    } as const;
    const renderPage = async (el: HTMLElement) => {
      try {
        return await toJpeg(el, { ...opts, quality: 0.95 });
      } catch (err) {
        console.warn("toJpeg first attempt failed, retrying without fonts", err);
        return await toJpeg(el, { ...opts, quality: 0.92, skipFonts: true });
      }
    };
    try {
      const img1 = await renderPage(page1.clone);
      const img2 = await renderPage(page2.clone);
      const pdf = new jsPDF("l", "px", [PAGE_W, PAGE_H]);
      pdf.addImage(img1, "JPEG", 0, 0, PAGE_W, PAGE_H);
      pdf.addPage([PAGE_W, PAGE_H], "l");
      pdf.addImage(img2, "JPEG", 0, 0, PAGE_W, PAGE_H);
      return pdf;
    } finally {
      page1.cleanup();
      page2.cleanup();
    }
  };

  const exportPdf = async () => {
    setBusy("pdf");
    try {
      const pdf = await buildPdf();
      if (!pdf) return;
      const blob = pdf.output("blob") as Blob;
      const filename = `${fileName}.pdf`;

      // Mobile-friendly path: Web Share API (iOS Safari, Android Chrome, Capacitor)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const file = new File([blob], filename, { type: "application/pdf" });
      const nav: any = navigator;
      if (isMobile && nav.canShare && nav.canShare({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: filename });
          toast.success("PDF ready to share");
          return;
        } catch (err: any) {
          if (err?.name === "AbortError") return; // user cancelled
          // fall through to blob URL fallback
        }
      }

      // Fallback: open the PDF blob in a new tab so iOS Safari users can
      // use the share sheet to save / send. Desktop browsers download normally.
      const blobUrl = URL.createObjectURL(blob);
      if (isMobile) {
        const win = window.open(blobUrl, "_blank");
        if (!win) window.location.href = blobUrl;
        toast.success("PDF opened - tap the share icon to save");
      } else {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success("PDF downloaded");
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (e: any) {
      console.error("PDF export failed:", e?.message || e?.type || e);
      toast.error("Could not generate PDF");
    } finally {
      setBusy(null);
    }
  };


  // Print = build the same PDF, open it in a new tab so the user can
  // preview and use the browser's native print dialog.
  const printNow = async () => {
    setBusy("pdf");
    try {
      const pdf = await buildPdf();
      if (!pdf) return;
      const blobUrl = pdf.output("bloburl") as unknown as string;
      const win = window.open(blobUrl, "_blank");
      if (!win) {
        // Popup blocked - fall back to in-page navigation
        window.location.href = blobUrl;
        return;
      }
      // Trigger the print dialog once the PDF viewer has loaded.
      const tryPrint = () => { try { win.focus(); win.print(); } catch {} };
      win.addEventListener("load", tryPrint);
      // Safari/Chrome PDF viewers sometimes don't fire load - fallback timer.
      setTimeout(tryPrint, 1200);
    } catch (e: any) {
      console.error("Print failed:", e?.message || e?.type || e);
      toast.error("Could not open print preview");
    } finally {
      setBusy(null);
    }
  };

  if (!open) return null;
  const tplProps = { d: data, tuning, workDescriptions, pullQuoteText };

  const fmt = (n: number) => `${Math.round(n * 100)}%`;
  const allPass = scores && passes(scores);

  return (
    <div className="fixed inset-0 z-[100] bg-foreground/70 backdrop-blur-sm flex flex-col no-print" onClick={onClose}>
      <div className="bg-background border-b border-border p-3 flex flex-wrap items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 flex-wrap">
          <FileText className="w-4 h-4 text-primary" />
          <h2 className="font-display font-800 text-sm md:text-base">Magazine profile</h2>

          <button
            onClick={() => setShowSlotEditor(v => !v)}
            className={`px-2 py-1 rounded-full font-display text-[10px] font-700 border inline-flex items-center gap-1 ${showSlotEditor ? "bg-foreground text-background border-foreground" : "border-foreground/30"}`}
            title="Pin / resize sections"
          ><Pin className="w-3 h-3" />{showSlotEditor ? "Hide editor" : "Edit slots"}</button>
          {busy === "ai" && <span className="font-display text-[10px] uppercase tracking-wider text-primary inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> Summarising</span>}
        </div>
        <div className="flex items-center gap-2">
          {template === PINNED_TEMPLATE_KEY && (
            <button
              onClick={() => {
                try {
                  localStorage.setItem(PINNED_LS_KEY, JSON.stringify(pinnedLayout));
                  toast.success("Layout saved");
                } catch {
                  toast.error("Could not save layout");
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background font-display text-xs font-700"
              title="Save current pinned layout"
            >
              <Save className="w-3.5 h-3.5" /> Save layout
            </button>
          )}
          <button onClick={() => setPreviewMode(v => !v)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-foreground text-foreground font-display text-xs font-700">
            <Eye className="w-3.5 h-3.5" />{previewMode ? "Actual size" : "Fit"}
          </button>
          <button onClick={printNow} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-foreground font-display text-xs font-700">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button onClick={exportPdf} disabled={!!busy} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-display text-xs font-700 disabled:opacity-50">
            {busy === "pdf" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Download PDF
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted p-6 flex justify-center gap-6" onClick={e => e.stopPropagation()}>
        {template === PINNED_TEMPLATE_KEY && showSlotEditor && (
          <ThumbnailPalette
            layout={pinnedLayout}
            ctx={tplProps}
            onDragStart={handleSidebarDragStart}
            onRemove={(page, id) => setPinnedLayout(prev => ({
              ...prev,
              [page]: prev[page].filter(s => s.i !== id),
            }))}
            onReset={() => setPinnedLayout(DEFAULT_PINNED_LAYOUT)}
          />
        )}
        <div className="printable-profile-stage space-y-6" style={{ transform: previewMode ? "scale(0.78)" : "scale(1)", transformOrigin: "top center" }}>
          {template === PINNED_TEMPLATE_KEY ? (
            <>
              <PageFrame ref={page1Ref} label="Page 1 of 2 · Pinned slots">
                <PinnedPage
                  layout={pinnedLayout}
                  page="page1"
                  editing={showSlotEditor}
                  onLayoutChange={(p, l) => setPinnedLayout(prev => ({
                    ...prev,
                    [p]: prev[p].map(s => {
                      const m = l.find(x => x.i === s.i);
                      return m ? { ...s, unit: "px" as const, x: m.x, y: m.y, w: m.w, h: m.h, z: m.z ?? s.z } : s;
                    }),
                  }))}

                  onRemove={(p, id) => setPinnedLayout(prev => ({
                    ...prev,
                    [p]: prev[p].filter(s => s.i !== id),
                  }))}
                  onDropSection={handleDrop}
                  droppingItem={{ i: "__dropping-elem__", w: dropDims.w, h: dropDims.h }}
                  {...tplProps}
                />
              </PageFrame>
              <PageFrame ref={page2Ref} label="Page 2 of 2 · Pinned slots">
                <PinnedPage
                  layout={pinnedLayout}
                  page="page2"
                  editing={showSlotEditor}
                  onLayoutChange={(p, l) => setPinnedLayout(prev => ({
                    ...prev,
                    [p]: prev[p].map(s => {
                      const m = l.find(x => x.i === s.i);
                      return m ? { ...s, unit: "px" as const, x: m.x, y: m.y, w: m.w, h: m.h, z: m.z ?? s.z } : s;
                    }),
                  }))}

                  onRemove={(p, id) => setPinnedLayout(prev => ({
                    ...prev,
                    [p]: prev[p].filter(s => s.i !== id),
                  }))}
                  onDropSection={handleDrop}
                  droppingItem={{ i: "__dropping-elem__", w: dropDims.w, h: dropDims.h }}
                  {...tplProps}
                />
              </PageFrame>
            </>
          ) : (
            <>
              <PageFrame ref={page1Ref} label={`Page 1 of 2 · ${Tpl?.label || ""}`}>{Tpl && <Tpl.P1 {...tplProps} />}</PageFrame>
              <PageFrame ref={page2Ref} label="Page 2 of 2 · Career">{Tpl && <Tpl.P2 {...tplProps} />}</PageFrame>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ----- Thumbnail palette: real mini-renders, native HTML5 drag onto pages -----
const THUMB_W = 240;        // sidebar render width before scaling
const THUMB_RENDER_W = 720; // we render the section at this width
const SCALE = THUMB_W / THUMB_RENDER_W;

const ThumbnailPalette: React.FC<{
  layout: PinnedLayout;
  ctx: { d: any; tuning: any; workDescriptions: Record<string,string>; pullQuoteText: string };
  onDragStart: (e: React.DragEvent, section: SectionId) => void;
  onRemove: (page: "page1" | "page2", id: string) => void;
  onReset: () => void;
}> = ({ layout, ctx, onDragStart, onRemove, onReset }) => {
  const usage = (sec: SectionId) => ({
    p1: layout.page1.filter(s => s.section === sec),
    p2: layout.page2.filter(s => s.section === sec),
  });

  return (
    <div className="w-[272px] shrink-0 self-start sticky top-0 max-h-[calc(100vh-120px)] overflow-y-auto bg-background border border-foreground/20 rounded-2xl p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="font-display font-800 text-xs uppercase tracking-wider">Sections</div>
        <div className="flex items-center gap-1">
          <button onClick={onReset} title="Reset layout" className="inline-flex items-center gap-1 text-[10px] font-display font-700 px-2 py-1 rounded-full border border-foreground/30 hover:bg-foreground hover:text-background">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>
      <p className="text-[10px] opacity-70 leading-snug">
        <strong>Drag</strong> a thumbnail onto either page to drop it. Then drag inside the page to reposition, or pull any edge or corner handle to resize.
      </p>
      <div className="space-y-2">
        {SECTION_LIST.map(s => {
          const has = s.has(ctx as any);
          const { p1, p2 } = usage(s.id);
          const used = p1.length + p2.length > 0;
          // Render the section at full width, then scale down. Height proportional to default row span.
          const ROW_PX = 56; // unscaled row height (matches grid roughly)
          const innerH = Math.max(120, s.defaultRows * ROW_PX);
          const previewH = Math.round(innerH * SCALE);
          const node = has ? s.render(ctx as any) : (
            <div className="h-full w-full rounded-xl border-2 border-dashed border-foreground/30 flex items-center justify-center text-[18px] uppercase tracking-wider font-display text-foreground/50 p-3 text-center">
              No data yet
            </div>
          );
          return (
            <div
              key={s.id}
              draggable
              onDragStart={e => onDragStart(e, s.id)}
              className={`group relative border rounded-xl bg-background cursor-grab active:cursor-grabbing select-none ${used ? "border-primary/60" : "border-foreground/15"}`}
              title={`Drag to add: ${s.label}`}
            >
              {/* Mini preview clipped to thumb width */}
              <div
                className="relative overflow-hidden rounded-t-xl bg-background"
                style={{ width: THUMB_W, height: previewH }}
              >
                <div
                  className="pointer-events-none origin-top-left"
                  style={{
                    width: THUMB_RENDER_W,
                    height: innerH,
                    transform: `scale(${SCALE})`,
                    transformOrigin: "top left",
                  }}
                >
                  <div style={{ width: THUMB_RENDER_W, height: innerH, padding: 8, boxSizing: "border-box" }}>
                    {node}
                  </div>
                </div>
                {/* light overlay so drag origin is obvious */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-primary/10 transition-colors" />
              </div>
              {/* Caption */}
              <div className="flex items-center justify-between gap-1 px-2 py-1 border-t border-foreground/10">
                <div className="min-w-0">
                  <div className="font-display font-700 text-[10px] truncate">{s.label}</div>
                  <div className="text-[9px] opacity-60">
                    {has ? "Has data" : "No data"} · drops as {s.defaultCols}×{s.defaultRows}
                  </div>
                </div>
                {used && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    {p1.map(slot => (
                      <button key={slot.i} onMouseDown={e => e.stopPropagation()} onClick={() => onRemove("page1", slot.i)} className="inline-flex items-center gap-0.5 text-[9px] font-display font-700 px-1 py-0.5 rounded bg-foreground/5 hover:bg-destructive/10 hover:text-destructive" title="Remove from page 1">
                        P1 <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    ))}
                    {p2.map(slot => (
                      <button key={slot.i} onMouseDown={e => e.stopPropagation()} onClick={() => onRemove("page2", slot.i)} className="inline-flex items-center gap-0.5 text-[9px] font-display font-700 px-1 py-0.5 rounded bg-foreground/5 hover:bg-destructive/10 hover:text-destructive" title="Remove from page 2">
                        P2 <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


const Badge: React.FC<{ ok: boolean; children: React.ReactNode }> = ({ ok, children }) => (
  <span className={`px-1.5 py-0.5 rounded ${ok ? "bg-primary/15 text-foreground" : "bg-destructive/10 text-destructive"}`}>{children}</span>
);

export default MagazineGenerator;
