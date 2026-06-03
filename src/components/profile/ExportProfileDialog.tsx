import React, { useEffect, useRef, useState } from "react";
import { X, Download, Printer, Mail, Loader2, Pin, PinOff, Eye } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface Props {
  open: boolean;
  onClose: () => void;
  rootId: string;
  fileName: string;
  userEmail: string;
  sectionLabels: Record<string, string>;
  visibleSections: Record<string, boolean>;
  onToggleSection: (k: string) => void;
}

interface PdfResult {
  blob: Blob;
  previewPages: string[];
}

const PDF_TARGET_PAGES = 2;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const isAbortError = (error: unknown) =>
  error instanceof DOMException ? error.name === "AbortError" : false;

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const ExportProfileDialog: React.FC<Props> = ({
  open, onClose, rootId, fileName, userEmail, sectionLabels, visibleSections, onToggleSection,
}) => {
  const [busy, setBusy] = useState<null | "pdf" | "print" | "email" | "preview">(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewState, setPreviewState] = useState<"idle" | "generating" | "loading" | "ready" | "error">("idle");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewTimeoutRef = useRef<number | null>(null);
  const previewTimedOutRef = useRef(false);

  const clearPreviewTimeout = () => {
    if (previewTimeoutRef.current !== null) {
      window.clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
  };

  useEffect(() => () => clearPreviewTimeout(), []);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  if (!open) return null;

  // Convert any external <img> inside the export root into an inline data URL,
  // routing CORS-blocked sources (Clearbit / DuckDuckGo / Google favicons / Supabase
  // logos that don't send ACAO) through images.weserv.nl which always returns
  // `Access-Control-Allow-Origin: *`. html2canvas can then rasterize them.
  const inlineImages = async (root: HTMLElement): Promise<() => void> => {
    const imgs = Array.from(root.querySelectorAll("img")) as HTMLImageElement[];
    const restorers: Array<() => void> = [];
    const toDataUrl = async (url: string): Promise<string | null> => {
      const tryFetch = async (u: string) => {
        const res = await fetch(u, { mode: "cors", credentials: "omit" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        return await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(String(fr.result));
          fr.onerror = () => reject(fr.error);
          fr.readAsDataURL(blob);
        });
      };
      try { return await tryFetch(url); } catch (error) {
        console.warn("[PDF export] Direct image fetch failed; trying proxy", { url, error });
      }
      try {
        const stripped = url.replace(/^https?:\/\//, "");
        const proxied = `https://images.weserv.nl/?url=${encodeURIComponent(stripped)}`;
        return await tryFetch(proxied);
      } catch (error) {
        console.warn("[PDF export] Image proxy fetch failed; image may be skipped", { url, error });
        return null;
      }
    };
    await Promise.all(
      imgs.map(async (img) => {
        const src = img.currentSrc || img.src;
        if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;
        const original = img.getAttribute("src") || "";
        const originalSrcset = img.getAttribute("srcset");
        const restoreOriginal = () => {
          img.setAttribute("src", original);
          if (originalSrcset) img.setAttribute("srcset", originalSrcset);
        };
        // Skip same-origin images that html2canvas can already read directly
        try {
          const u = new URL(src, window.location.href);
          if (u.origin === window.location.origin) return;
        } catch { /* malformed URL - try anyway */ }
        const data = await toDataUrl(src);
        img.setAttribute("src", data || TRANSPARENT_PIXEL);
        if (originalSrcset) img.removeAttribute("srcset");
        restorers.push(restoreOriginal);
        // Wait for the new src to be decoded so it's painted before snapshot
        try { await img.decode(); } catch { /* ignore */ }
      })
    );
    return () => restorers.forEach((r) => r());
  };

  const generatePdf = async (): Promise<PdfResult | null> => {
    console.log("[PDF export] Starting PDF generation", { rootId });
    const node = document.getElementById(rootId);
    if (!node) {
      console.error("[PDF export] Profile root element not found", { rootId });
      toast.error("Profile not found");
      return null;
    }
    document.body.classList.add("pdf-export-mode");
    // Render at A4 landscape width so the multi-column layout maps cleanly.
    const prevWidth = node.style.width;
    const prevMaxWidth = node.style.maxWidth;
    node.style.width = "1123px"; // ~ A4 landscape @ 96dpi
    node.style.maxWidth = "1123px";
    let restoreImages: (() => void) | null = null;
    try {
      const startedAt = performance.now();
      const imageCount = node.querySelectorAll("img").length;
      console.log("[PDF export] Preparing images for html2canvas", { imageCount });
      restoreImages = await inlineImages(node);
      console.log("[PDF export] Image preparation complete", { ms: Math.round(performance.now() - startedAt) });
      if (document.fonts?.ready) {
        console.log("[PDF export] Waiting for fonts before html2canvas snapshot");
        await document.fonts.ready;
      }
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      console.log("[PDF export] Capturing profile with html2canvas", {
        width: node.scrollWidth,
        height: node.scrollHeight,
      });
      const canvas = await html2canvas(node, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        windowWidth: 1123,
        imageTimeout: 8000,
        logging: true,
      });
      console.log("[PDF export] html2canvas complete", { width: canvas.width, height: canvas.height, ms: Math.round(performance.now() - startedAt) });

      const pdf = new jsPDF("l", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();   // 297mm
      const pageH = pdf.internal.pageSize.getHeight();  // 210mm
      const margin = 8;                                  // mm
      const drawW = pageW - margin * 2;
      const drawH = pageH - margin * 2;
      const pagePreviews: string[] = [];

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const fullWidthImageH = (canvas.height * drawW) / canvas.width;
      const twoPageScale = Math.min(1, (drawH * PDF_TARGET_PAGES) / fullWidthImageH);
      const renderedW = drawW * twoPageScale;
      const renderedH = fullWidthImageH * twoPageScale;
      const renderedX = margin + (drawW - renderedW) / 2;
      const previewCanvas = document.createElement("canvas");
      const previewCtx = previewCanvas.getContext("2d");
      if (!previewCtx) throw new Error("Failed to get 2D context for preview pages");
      previewCanvas.width = 1200;
      previewCanvas.height = Math.round(previewCanvas.width * (pageH / pageW));
      const previewPxPerMm = previewCanvas.width / pageW;

      for (let pageIdx = 0; pageIdx < PDF_TARGET_PAGES; pageIdx += 1) {
        const renderedY = margin - pageIdx * drawH;
        previewCtx.fillStyle = "#ffffff";
        previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.drawImage(
          canvas,
          renderedX * previewPxPerMm,
          renderedY * previewPxPerMm,
          renderedW * previewPxPerMm,
          renderedH * previewPxPerMm
        );
        pagePreviews.push(previewCanvas.toDataURL("image/jpeg", 0.9));
        if (pageIdx > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", renderedX, renderedY, renderedW, renderedH);
      }
      console.log("[PDF export] Pages written", {
        count: PDF_TARGET_PAGES,
        twoPageScale: Number(twoPageScale.toFixed(3)),
        renderedW: Number(renderedW.toFixed(1)),
        renderedH: Number(renderedH.toFixed(1)),
      });
      const blob = pdf.output("blob");
      console.log("[PDF export] PDF blob generated", { type: blob.type, size: blob.size, previewPages: pagePreviews.length });
      return { blob, previewPages: pagePreviews };
    } catch (error) {
      console.error("[PDF export] PDF generation failed", error);
      throw error;
    } finally {
      restoreImages?.();
      node.style.width = prevWidth;
      node.style.maxWidth = prevMaxWidth;
      document.body.classList.remove("pdf-export-mode");
    }
  };

  const handleDownload = async () => {
    setBusy("pdf");
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;
    const newTab = isAndroid ? null : window.open("", "_blank");
    try {
      const result = await generatePdf();
      if (!result) { newTab?.close(); return; }
      const { blob } = result;
      const file = new File([blob], `${fileName}.pdf`, { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      if (newTab) {
        newTab.document.title = "My profile PDF";
        newTab.document.body.style.fontFamily = "system-ui, sans-serif";
        newTab.document.body.style.padding = "24px";
        newTab.document.body.innerHTML = "<p>Your PDF is being prepared…</p>";
      }

      // 1) Best path on mobile: native share sheet → "Save to Files".
      const nav = navigator;
      if (isMobile && nav.canShare && nav.canShare({ files: [file] })) {
        try {
          newTab?.close();
          await nav.share({ files: [file], title: "My profile" });
          toast.success("If the share sheet opened, choose 'Save to Files'");
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          return;
        } catch (err: unknown) {
          if (isAbortError(err)) {
            setTimeout(() => URL.revokeObjectURL(url), 2000);
            return;
          }
          // fall through
        }
      }

      // 2) iOS fallback: show a real tapped link in the opened tab. iPhone Safari is
      // unreliable with automatic blob downloads, especially inside app previews.
      if (isIOS && newTab) {
        newTab.document.body.innerHTML = `
          <main style="max-width: 420px; margin: 0 auto; line-height: 1.4;">
            <h1 style="font-size: 22px; margin: 0 0 12px;">Your profile PDF is ready</h1>
            <p style="font-size: 16px; margin: 0 0 18px;">Tap the button below, then use the iPhone share icon and choose <strong>Save to Files</strong>.</p>
            <a href="${url}" target="_self" style="display: block; text-align: center; background: #00E600; color: #000; border: 2px solid #000; border-radius: 16px; padding: 16px; font-weight: 800; text-decoration: none;">Open PDF</a>
          </main>
        `;
        toast.success("A PDF tab opened - tap Open PDF, then Save to Files");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return;
      }

      // 3) Desktop / Android fallback: real download.
      newTab?.close();
      const a = document.createElement("a");
      a.href = url; a.download = `${fileName}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast.success("PDF downloaded");
    } catch (e: unknown) {
      newTab?.close();
      toast.error(getErrorMessage(e, "Could not generate PDF"));
    } finally { setBusy(null); }
  };

  const handlePreview = async () => {
    setBusy("preview");
    setPreviewOpen(true);
    setPreviewState("generating");
    setPreviewError(null);
    setPreviewPages([]);
    previewTimedOutRef.current = false;
    clearPreviewTimeout();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewBlob(null);
    try {
      console.log("[PDF preview] Preview requested");
      previewTimeoutRef.current = window.setTimeout(() => {
        console.error("[PDF preview] PDF generation did not finish within 8 seconds");
        previewTimedOutRef.current = true;
        setPreviewState("error");
        setPreviewError("PDF preview is taking longer than expected. You can try again or use Download PDF.");
      }, 8000);
      const result = await generatePdf();
      clearPreviewTimeout();
      const blob = result?.blob;
      if (!blob || blob.size === 0 || blob.type !== "application/pdf") {
        console.error("[PDF preview] Invalid PDF blob", { type: blob?.type, size: blob?.size });
        throw new Error("The PDF preview could not be generated.");
      }
      const url = URL.createObjectURL(blob);
      console.log("[PDF preview] Blob URL created", { size: blob.size, type: blob.type, urlPrefix: url.slice(0, 24), previewPages: result.previewPages.length });
      setPreviewBlob(blob);
      setPreviewUrl(url);
      setPreviewPages(result.previewPages);
      if (result.previewPages.length === 0) throw new Error("The PDF preview pages could not be created.");
      setPreviewState("ready");
      if (previewTimedOutRef.current) toast.success("PDF preview finished loading");
    } catch (e: unknown) {
      clearPreviewTimeout();
      const message = getErrorMessage(e, "Could not generate preview");
      console.error("[PDF preview] Preview generation failed", e);
      setPreviewState("error");
      setPreviewError(message);
      toast.error(message);
    } finally { setBusy(null); }
  };

  const closePreview = () => {
    clearPreviewTimeout();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewOpen(false);
    setPreviewUrl(null);
    setPreviewBlob(null);
    setPreviewPages([]);
    setPreviewState("idle");
    setPreviewError(null);
  };

  const downloadFromPreview = () => {
    if (!previewBlob || !previewUrl) {
      console.warn("[PDF preview] Download requested before PDF blob URL was ready");
      return;
    }
    const a = document.createElement("a");
    a.href = previewUrl; a.download = `${fileName}.pdf`;
    document.body.appendChild(a); a.click(); a.remove();
    toast.success("PDF downloaded");
  };

  const openPreviewInNewTab = () => {
    if (!previewUrl) {
      console.warn("[PDF preview] Open in new tab requested before PDF blob URL was ready");
      return;
    }
    console.log("[PDF preview] Opening blob URL in new tab");
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const handleIframeLoad = () => {
    console.log("[PDF preview] iframe loaded successfully");
    clearPreviewTimeout();
    setPreviewState("ready");
    setPreviewError(null);
  };

  const handleIframeError = () => {
    console.error("[PDF preview] iframe failed to load");
    clearPreviewTimeout();
    setPreviewState("error");
    setPreviewError("The PDF preview could not be displayed here. You can open it in a new tab, download it, or try again.");
  };

  const handlePrint = () => {
    setBusy("print");
    document.body.classList.add("pdf-export-mode");
    setTimeout(() => {
      window.print();
      document.body.classList.remove("pdf-export-mode");
      setBusy(null);
    }, 100);
  };

  const handleEmail = async () => {
    setBusy("email");
    try {
      const result = await generatePdf();
      if (!result) return;
      const { blob } = result;
      // Save the PDF locally and open the user's email client with a pre-filled draft
      // they can attach the file to. (No server / quotas needed.)
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${fileName}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      const subject = encodeURIComponent("My profile");
      const body = encodeURIComponent(
        `Hi,\n\nMy profile is attached as a PDF (just downloaded - please attach ${fileName}.pdf from your downloads).\n\nThanks!`
      );
      window.location.href = `mailto:${encodeURIComponent(userEmail || "")}?subject=${subject}&body=${body}`;
      toast.success("PDF saved to downloads. Email draft opened.");
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Could not prepare email"));
    } finally { setBusy(null); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-foreground/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 no-print" onClick={onClose}>
      <div
        className="bg-background w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border-2 border-foreground shadow-[6px_6px_0_hsl(var(--foreground))] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b border-border p-5 flex items-center justify-between">
          <div>
            <h2 className="font-display font-800 text-xl">Export your profile</h2>
            <p className="font-body text-xs text-muted-foreground mt-0.5">Choose what to include, then download, print or email.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="font-display text-[10px] font-700 uppercase tracking-wider text-muted-foreground mb-3">Sections to include</p>
          <div className="grid grid-cols-1 gap-2 mb-6">
            {Object.entries(sectionLabels).map(([k, label]) => {
              const on = visibleSections[k] !== false;
              return (
                <button
                  key={k}
                  onClick={() => onToggleSection(k)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl border-2 text-left transition-colors ${on ? "border-primary bg-primary/5" : "border-border bg-background opacity-70"}`}
                >
                  <span className="font-body text-sm">{label}</span>
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {on ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={handlePreview}
              disabled={busy !== null}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl px-4 py-3 font-display font-700 text-xs uppercase tracking-wider shadow-[3px_3px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
            >
              {busy === "preview" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Preview PDF
            </button>
            <button
              onClick={handleDownload}
              disabled={busy !== null}
              className="inline-flex items-center justify-center gap-2 border-2 border-foreground rounded-2xl px-4 py-3 font-display font-700 text-xs uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
            >
              {busy === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              disabled={busy !== null}
              className="inline-flex items-center justify-center gap-2 border-2 border-foreground rounded-2xl px-4 py-3 font-display font-700 text-xs uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
            >
              {busy === "print" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              Print
            </button>
            <button
              onClick={handleEmail}
              disabled={busy !== null}
              className="inline-flex items-center justify-center gap-2 border-2 border-border rounded-2xl px-4 py-3 font-display font-700 text-xs uppercase tracking-wider hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              {busy === "email" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Email me a copy
            </button>
            <p className="font-body text-[11px] text-muted-foreground text-center mt-1">
              Email opens your mail app with the PDF saved to your downloads - drag it onto the draft to attach.
            </p>
          </div>
        </div>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-[110] bg-foreground/80 flex flex-col p-2 sm:p-4" onClick={closePreview}>
          <div
            className="bg-background w-full flex-1 rounded-2xl border-2 border-foreground shadow-[6px_6px_0_hsl(var(--foreground))] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 p-3 border-b border-border">
              <h3 className="font-display font-800 text-base">PDF preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadFromPreview}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-3 py-2 font-display font-700 text-[11px] uppercase tracking-wider shadow-[3px_3px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button onClick={closePreview} className="p-2 hover:bg-muted rounded-full" aria-label="Close preview">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="relative flex-1 min-h-[60vh] overflow-y-auto bg-muted p-3 sm:p-5">
              {previewState === "ready" && previewPages.length > 0 && (
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                  {previewPages.map((page, index) => (
                    <img
                      key={`${page.slice(0, 32)}-${index}`}
                      src={page}
                      alt={`PDF preview page ${index + 1}`}
                      className="w-full rounded-sm border border-border bg-background shadow-[3px_3px_0_hsl(var(--foreground))]"
                    />
                  ))}
                </div>
              )}

              {(previewState === "generating" || previewState === "loading") && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/95 p-6 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="font-display font-800 text-sm uppercase tracking-wider">
                    {previewState === "generating" ? "Generating preview" : "Loading preview"}
                  </p>
                  <p className="max-w-sm font-body text-xs text-muted-foreground">
                    If the embedded PDF viewer does not respond, fallback options will appear automatically.
                  </p>
                </div>
              )}

              {previewState === "error" && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
                  <div className="max-w-md space-y-2">
                    <p className="font-display font-800 text-base uppercase tracking-wider">Preview could not load</p>
                    <p className="font-body text-sm text-muted-foreground">
                      {previewError || "The PDF preview could not be displayed here."}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={openPreviewInNewTab}
                      disabled={!previewUrl}
                      className="inline-flex items-center justify-center gap-2 border-2 border-foreground rounded-xl px-3 py-2 font-display font-700 text-[11px] uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
                    >
                      Open preview in new tab
                    </button>
                    <button
                      onClick={downloadFromPreview}
                      disabled={!previewUrl}
                      className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl px-3 py-2 font-display font-700 text-[11px] uppercase tracking-wider shadow-[3px_3px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={handlePreview}
                      disabled={busy !== null}
                      className="inline-flex items-center justify-center gap-2 border-2 border-border rounded-xl px-3 py-2 font-display font-700 text-[11px] uppercase tracking-wider hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                    >
                      {busy === "preview" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Try again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportProfileDialog;
