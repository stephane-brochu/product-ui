"use client";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { PdfLoader, PdfDocumentHandle } from "./pdf-viewer";
/** Worker URL must point to the exact pinned pdfjs-dist worker served by the product. */
export function createPdfJsLoader({
  url,
  workerSrc,
  withCredentials = false,
  httpHeaders,
  assets,
}: {
  url: string;
  workerSrc: string;
  withCredentials?: boolean;
  httpHeaders?: Record<string, string>;
  assets?: {
    cMapUrl?: string;
    standardFontDataUrl?: string;
    wasmUrl?: string;
    iccUrl?: string;
  };
}): PdfLoader {
  if (!url || !workerSrc)
    throw new Error("A PDF source and matching worker URL are required");
  return () => {
    GlobalWorkerOptions.workerSrc = workerSrc;
    const task = getDocument({
      url,
      withCredentials,
      httpHeaders,
      ...assets,
      stopAtErrors: true,
      verbosity: 0,
    });
    const promise: Promise<PdfDocumentHandle> = task.promise.then(
      (document) => ({
        numPages: document.numPages,
        getPage: async (number) => {
          const page = await document.getPage(number);
          return {
            size: () => {
              const viewport = page.getViewport({ scale: 1 });
              return { width: viewport.width, height: viewport.height };
            },
            render: (canvas, scale) => {
              const context = canvas.getContext("2d");
              if (!context) throw new Error("Canvas unavailable");
              const render = page.render({
                canvas,
                canvasContext: context,
                viewport: page.getViewport({ scale }),
              });
              return { promise: render.promise, cancel: () => render.cancel() };
            },
            text: async () => {
              const text = await page.getTextContent();
              return text.items
                .map((item) => ("str" in item ? item.str : ""))
                .join(" ");
            },
            cleanup: () => page.cleanup(),
          };
        },
      }),
    );
    return { promise, destroy: () => task.destroy() };
  };
}
