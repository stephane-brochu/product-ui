"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../ui/button";
import { Disclosure } from "./disclosure";
export type PdfPageHandle = {
  size: () => { width: number; height: number };
  render: (
    canvas: HTMLCanvasElement,
    scale: number,
  ) => { promise: Promise<unknown>; cancel: () => void };
  text: () => Promise<string>;
  cleanup?: () => void;
};
export type PdfDocumentHandle = {
  numPages: number;
  getPage: (page: number) => Promise<PdfPageHandle>;
};
export type PdfLoadTask = {
  promise: Promise<PdfDocumentHandle>;
  destroy: () => Promise<unknown>;
};
export type PdfLoader = () => PdfLoadTask;
export type PdfViewerProps = {
  title: string;
  sourceKey: string;
  loadDocument: PdfLoader;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  onDocumentReady?: (pages: number) => void;
  pageId?: (page: number) => string;
  maxPages?: number;
  maxWidth?: number;
  maxPixels?: number;
  loadErrorMessage?: string;
  renderErrorMessage?: string;
  textEmptyMessage?: string;
  fallback?: ReactNode;
};
/** Pure viewer. Supply a stable loader and change sourceKey whenever its source or policy changes. */
export function PdfViewer(props: PdfViewerProps) {
  return (
    <PdfSession
      key={`${props.sourceKey}:${props.maxPages ?? 100}`}
      {...props}
    />
  );
}
function PdfSession({
  title,
  loadDocument,
  page: controlledPage,
  defaultPage = 1,
  onPageChange,
  onDocumentReady,
  pageId,
  maxPages = 100,
  maxWidth = 1000,
  maxPixels = 2_500_000,
  loadErrorMessage = "This document could not be previewed.",
  renderErrorMessage = "This page could not be rendered.",
  textEmptyMessage = "This page has no selectable text. Review the rendered image or original document.",
  fallback,
}: PdfViewerProps) {
  const [pdf, setPdf] = useState<PdfDocumentHandle | null>(null),
    [internalPage, setPage] = useState(defaultPage),
    [loadError, setLoadError] = useState(false),
    [renderError, setRenderError] = useState(false),
    [pageText, setPageText] = useState(""),
    [drawing, setDrawing] = useState(true),
    [textError, setTextError] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null),
    container = useRef<HTMLDivElement>(null);
  const [renderedPage, setRenderedPage] = useState<number | null>(null);
  if (
    !Number.isInteger(maxPages) ||
    maxPages < 1 ||
    !Number.isFinite(maxWidth) ||
    maxWidth < 1 ||
    maxWidth > 4096 ||
    !Number.isInteger(maxPixels) ||
    maxPixels < 1024 ||
    maxPixels > 16_000_000
  )
    throw new Error("Invalid PDF resource limits");
  if (
    !Number.isInteger(defaultPage) ||
    defaultPage < 1 ||
    (controlledPage !== undefined &&
      (!Number.isInteger(controlledPage) || controlledPage < 1))
  )
    throw new Error("PDF pages must be positive integers");
  const page = Math.min(
    pdf?.numPages ?? Math.max(defaultPage, controlledPage ?? 1),
    controlledPage ?? internalPage,
  );
  useEffect(() => {
    let disposed = false,
      task: PdfLoadTask | undefined,
      destroyed = false;
    async function destroy() {
      if (destroyed || !task) return;
      destroyed = true;
      try {
        await task.destroy();
      } catch {
        /* Cleanup is best effort. */
      }
    }
    void Promise.resolve().then(async () => {
      if (disposed) return;
      try {
        task = loadDocument();
        const document = await task.promise;
        if (
          !Number.isInteger(document.numPages) ||
          document.numPages < 1 ||
          document.numPages > maxPages
        )
          throw new Error("Unsupported page count");
        if (!disposed) setPdf(document);
      } catch {
        if (!disposed) {
          setLoadError(true);
          setDrawing(false);
        }
        await destroy();
      }
    });
    return () => {
      disposed = true;
      void destroy();
    };
  }, [loadDocument, maxPages]);
  useEffect(() => {
    if (pdf) onDocumentReady?.(pdf.numPages);
  }, [pdf, onDocumentReady]);
  useEffect(() => {
    if (!pdf || !canvas.current || !container.current) return;
    let disposed = false,
      render: { promise: Promise<unknown>; cancel: () => void } | undefined,
      rendering = false,
      queued = false;
    let observedWidth = container.current.clientWidth;
    async function draw() {
      if (rendering || disposed) return;
      rendering = true;
      let sourcePage: PdfPageHandle | undefined;
      let buffer: HTMLCanvasElement | undefined;
      try {
        await Promise.resolve();
        if (disposed) return;
        setDrawing(true);
        setRenderError(false);
        setPageText("");
        setTextError(false);
        const target = canvas.current;
        if (!target || !container.current) return;
        target.getContext("2d")?.clearRect(0, 0, target.width, target.height);
        sourcePage = await pdf!.getPage(page);
        if (disposed) return;
        const base = sourcePage.size();
        if (
          !Number.isFinite(base.width) ||
          !Number.isFinite(base.height) ||
          base.width <= 0 ||
          base.height <= 0
        )
          throw new Error("Invalid page dimensions");
        const width = Math.min(
          container.current.clientWidth || maxWidth,
          maxWidth,
        );
        const scale = Math.min(
          width / base.width,
          Math.sqrt(maxPixels / base.width / base.height),
        );
        buffer = document.createElement("canvas");
        buffer.width = Math.max(1, Math.floor(base.width * scale));
        buffer.height = Math.max(1, Math.floor(base.height * scale));
        if (
          !Number.isFinite(scale) ||
          scale <= 0 ||
          buffer.width * buffer.height > maxPixels
        )
          throw new Error("Raster budget exceeded");
        render = sourcePage.render(buffer, scale);
        await render.promise;
        if (disposed) return;
        const context = target.getContext("2d");
        if (!context) throw new Error("Canvas unavailable");
        target.width = buffer.width;
        target.height = buffer.height;
        context.drawImage(buffer, 0, 0);
        try {
          const text = await sourcePage.text();
          if (!disposed) setPageText(text);
        } catch {
          if (!disposed) setTextError(true);
        }
        if (!disposed) setRenderedPage(page);
      } catch {
        if (!disposed) setRenderError(true);
      } finally {
        if (buffer) {
          buffer.width = 0;
          buffer.height = 0;
        }
        try {
          sourcePage?.cleanup?.();
        } catch {
          /* Document/task destruction remains the final cleanup boundary. */
        }
        rendering = false;
        if (!disposed) {
          setDrawing(false);
          if (queued) {
            queued = false;
            void draw();
          }
        }
      }
    }
    function resized() {
      const width = container.current?.clientWidth ?? 0;
      if (Math.abs(width - observedWidth) < 1) return;
      observedWidth = width;
      if (rendering) queued = true;
      else void draw();
    }
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(resized)
        : null;
    if (observer) observer.observe(container.current);
    else window.addEventListener("resize", resized);
    void draw();
    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener("resize", resized);
      render?.cancel();
    };
  }, [pdf, page, maxWidth, maxPixels]);
  const busy =
    !loadError &&
    !renderError &&
    (drawing || (pdf !== null && renderedPage !== page));
  function navigate(next: number) {
    if (busy || !pdf) return;
    const value = Math.max(1, Math.min(pdf.numPages, next));
    if (controlledPage === undefined) setPage(value);
    onPageChange?.(value);
  }
  return (
    <div
      className="ds-pdf-viewer"
      ref={container}
      id={pageId?.(page)}
      aria-busy={busy}
    >
      {loadError && (
        <div role="alert" className="ds-pdf-error">
          {loadErrorMessage}
        </div>
      )}
      {renderError && (
        <div role="alert" className="ds-pdf-error">
          {renderErrorMessage}
        </div>
      )}
      {pdf && (
        <div className="ds-pdf-toolbar">
          <Button
            variant="secondary"
            size="compact"
            disabled={page <= 1 || busy}
            onClick={() => navigate(page - 1)}
          >
            Previous page
          </Button>
          <span role="status">
            Page {page} of {pdf.numPages}
          </span>
          <Button
            variant="secondary"
            size="compact"
            disabled={page >= pdf.numPages || busy}
            onClick={() => navigate(page + 1)}
          >
            Next page
          </Button>
        </div>
      )}
      {busy && <p role="status">Rendering source page</p>}
      <canvas
        ref={canvas}
        role="img"
        aria-label={`${title}, page ${page}${pdf ? ` of ${pdf.numPages}` : ""}`}
        hidden={loadError || renderError || renderedPage !== page}
      />
      {pdf && !loadError && !renderError && (
        <Disclosure title="Selectable page text">
          <p>
            {busy || renderedPage !== page
              ? "Loading current page text…"
              : textError
                ? "Selectable text is unavailable. Review the rendered image or original document."
                : pageText || textEmptyMessage}
          </p>
        </Disclosure>
      )}
      {fallback}
    </div>
  );
}
export function PreviewFrame({
  title,
  children,
  action,
  fallback,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <section className="ds-preview-frame" aria-label={title}>
      <header>
        <h3>{title}</h3>
        {action}
      </header>
      {children}
      {fallback}
    </section>
  );
}
