"use client";
import { useId, useRef, useState, type ComponentPropsWithRef } from "react";
import { Button } from "../ui/button";
export type FileSelectionProps = Omit<
  ComponentPropsWithRef<"input">,
  | "type"
  | "value"
  | "defaultValue"
  | "accept"
  | "onChange"
  | "multiple"
  | "children"
  | "name"
  | "required"
> & {
  label: string;
  description?: string;
  accept?: readonly string[];
  maxBytes?: number;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  validateFile?: (file: File) => string | undefined;
};
function accepted(file: File, rules: readonly string[]) {
  return (
    !rules.length ||
    rules.some((rule) =>
      rule.startsWith(".")
        ? file.name.toLowerCase().endsWith(rule.toLowerCase())
        : rule.endsWith("/*")
          ? file.type.startsWith(rule.slice(0, -1))
          : file.type === rule ||
            (rule === "application/pdf" &&
              !file.type &&
              file.name.toLowerCase().endsWith(".pdf")),
    )
  );
}
export function FileSelection({
  label,
  description,
  accept = [],
  maxBytes,
  multiple = true,
  disabled,
  onFiles,
  validateFile,
  id: suppliedId,
  className = "",
  ref: forwardedRef,
  ...props
}: FileSelectionProps) {
  const generatedId = useId(),
    id = suppliedId ?? generatedId;
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false),
    [errors, setErrors] = useState<string[]>([]);
  if (maxBytes !== undefined && (!Number.isFinite(maxBytes) || maxBytes <= 0))
    throw new Error("maxBytes must be positive");
  function collect(files: File[]) {
    if (disabled || input.current?.matches(":disabled")) return;
    const seen = new Set<string>(),
      messages: string[] = [],
      valid: File[] = [];
    for (const file of files) {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      let problem: string | undefined;
      if (seen.has(key))
        problem =
          "possible duplicate selection. Server hashing is required for a confirmed duplicate.";
      else if (!accepted(file, accept)) problem = "unsupported file type.";
      else if (!file.size) problem = "file is empty.";
      else if (maxBytes !== undefined && file.size > maxBytes)
        problem = "exceeds the size limit.";
      else problem = validateFile?.(file);
      seen.add(key);
      if (problem) messages.push(`${file.name}: ${problem}`);
      else valid.push(file);
    }
    if (!multiple && valid.length > 1)
      messages.push("Choose one file at a time.");
    setErrors(messages);
    if (valid.length) onFiles(multiple ? valid : valid.slice(0, 1));
  }
  return (
    <div className={`ds-file-selection ${className}`}>
      <div
        className="ds-file-dropzone"
        data-dragging={dragging || undefined}
        data-disabled={disabled || undefined}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          collect(Array.from(event.dataTransfer.files));
        }}
      >
        <label htmlFor={id} className="ds-file-label">
          {label}
        </label>
        {description && <p id={`${id}-description`}>{description}</p>}
        <input
          {...props}
          ref={(node) => {
            input.current = node;
            if (typeof forwardedRef === "function") return forwardedRef(node);
            if (forwardedRef) forwardedRef.current = node;
          }}
          id={id}
          type="file"
          accept={accept.join(",")}
          multiple={multiple}
          disabled={disabled}
          aria-invalid={errors.length ? true : props["aria-invalid"]}
          aria-describedby={
            [
              props["aria-describedby"],
              description && `${id}-description`,
              errors.length > 0 && `${id}-errors`,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            collect(files);
          }}
        />
        <Button
          variant="secondary"
          disabled={disabled}
          onClick={() => input.current?.click()}
        >
          Choose {multiple ? "files" : "file"}
        </Button>
      </div>
      {errors.length > 0 && (
        <ul role="alert" id={`${id}-errors`} className="ds-workflow-error">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
