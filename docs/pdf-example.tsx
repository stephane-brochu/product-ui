import { useMemo, useState } from "react";
import { PdfViewer, PreviewFrame } from "../src/components/patterns/pdf-viewer";
import { createPdfJsLoader } from "../src/components/patterns/pdfjs-loader";
import { Select } from "../src/components/ui/fields";
import { Button } from "../src/components/ui/button";
import exampleUrl from "./fixtures/example.pdf?url";
import blankUrl from "./fixtures/blank.pdf?url";
import invalidUrl from "./fixtures/not-a-pdf.txt?url";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
export default function PdfExample() {
  const [mode, setMode] = useState("ready"),
    [generation, setGeneration] = useState(0);
  const url =
    mode === "blank" ? blankUrl : mode === "error" ? invalidUrl : exampleUrl;
  const loadDocument = useMemo(
    () => createPdfJsLoader({ url, workerSrc }),
    [url],
  );
  return (
    <div className="example">
      <Select
        label="PDF example state"
        value={mode}
        onChange={(event) => setMode(event.target.value)}
        options={[
          { value: "ready", label: "Two-page source" },
          { value: "blank", label: "No selectable text" },
          { value: "error", label: "Invalid source / retry" },
          { value: "limit", label: "Exceeds one-page preview limit" },
        ]}
      />
      <Button
        variant="tertiary"
        onClick={() => setGeneration((value) => value + 1)}
      >
        Retry preview
      </Button>
      <PreviewFrame
        title="Fictional project brief"
        fallback={
          <a href={url} target="_blank" rel="noreferrer">
            Open supplied original separately
          </a>
        }
      >
        <PdfViewer
          sourceKey={`${mode}:${generation}`}
          title="Fictional project brief"
          loadDocument={loadDocument}
          maxPages={mode === "limit" ? 1 : 100}
          maxPixels={2_500_000}
        />
      </PreviewFrame>
      <p className="note">
        Only the current page is rendered. Page and raster limits do not
        authorize a source or bound all font/image decoding memory. This demo
        does not persist the source, annotate it, or extract financial records.
      </p>
    </div>
  );
}
