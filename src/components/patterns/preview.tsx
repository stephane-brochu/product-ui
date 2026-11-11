import type { ComponentPropsWithRef, CSSProperties } from "react";

export function HtmlPreview({
  html,
  title,
  height = 720,
  className = "",
  ...props
}: Omit<ComponentPropsWithRef<"iframe">, "src" | "srcDoc" | "sandbox" | "title"> & {
  html: string;
  title: string;
  height?: number;
}) {
  if (!Number.isFinite(height) || height < 120) throw new RangeError("HtmlPreview height must be at least 120 pixels");
  return <iframe {...props} className={`ds-html-preview ${className}`} title={title} srcDoc={html} height={height} sandbox="allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" />;
}

export function DevicePreviewFrame({
  src,
  title,
  width,
  height,
  scale = 1,
  className = "",
}: {
  src: string;
  title: string;
  width: number;
  height: number;
  scale?: number;
  className?: string;
}) {
  if (![width, height, scale].every((value) => Number.isFinite(value) && value > 0))
    throw new RangeError("DevicePreviewFrame dimensions and scale must be positive");
  return (
    <div className={`ds-device-preview ${className}`} style={{ "--device-width": `${width}px`, "--device-height": `${height}px`, "--device-scale": scale } as CSSProperties}>
      <div className="ds-device-preview-frame">
        <PreviewIframe src={src} title={title} width={width} height={height} loading="eager" />
      </div>
    </div>
  );
}

export function PreviewIframe({
  title,
  ...props
}: Omit<ComponentPropsWithRef<"iframe">, "srcDoc" | "sandbox" | "title"> & { title: string }) {
  return <iframe {...props} title={title} referrerPolicy="no-referrer" />;
}
