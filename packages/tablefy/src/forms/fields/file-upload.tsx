"use client";
import React, { ReactNode, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload, X, File } from "lucide-react";
import { getPageProps } from "../../dialog/store";
import { BaseField } from "./base-field";
import { FileUploadConfig } from "../types/field";
import { FieldType, FieldRenderProps } from "../types/form";

/**
 * The largest file the server will actually take, in bytes.
 *
 * Shared by the host as `maxUploadSize` (in Laravel:
 * `UploadedFile::getMaxFilesize()`, the smaller of upload_max_filesize and
 * post_max_size). Offering more than that is how an upload ends up doing
 * nothing: the file goes, PHP drops it, and the form has nothing to show.
 */
function serverLimit(): number | undefined {
  const shared = getPageProps().maxUploadSize;

  return typeof shared === "number" && shared > 0 ? shared : undefined;
}

/** "2 MB" rather than "2097152". */
function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);

  return mb >= 1
    ? `${Math.round(mb * 10) / 10} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

export class FileUpload<
  TData extends Record<string, any>,
> extends BaseField<TData, FileUploadConfig<TData>> {
  readonly fieldType: FieldType = "file-upload";

  constructor(name: string) {
    super(name);
    (this.config as FileUploadConfig<TData>).multiple = false;
    (this.config as FileUploadConfig<TData>).preview = true;
    (this.config as FileUploadConfig<TData>).maxFiles = 1;
  }

  static make<TData extends Record<string, any>>(
    name: string & keyof TData | string,
  ): FileUpload<TData> {
    return new FileUpload(name);
  }

  accept(accept: string): this {
    (this.config as FileUploadConfig<TData>).accept = accept;
    return this;
  }

  maxSize(bytes: number): this {
    (this.config as FileUploadConfig<TData>).maxSize = bytes;
    return this;
  }

  multiple(multiple = true): this {
    (this.config as FileUploadConfig<TData>).multiple = multiple;
    return this;
  }

  maxFiles(max: number): this {
    (this.config as FileUploadConfig<TData>).maxFiles = max;
    return this;
  }

  preview(preview = true): this {
    (this.config as FileUploadConfig<TData>).preview = preview;
    return this;
  }

  image(): this {
    return this.accept("image/*");
  }

  pdf(): this {
    return this.accept("application/pdf");
  }

  renderField({
    value,
    onChange,
    error,
    disabled,
  }: FieldRenderProps<TData>): ReactNode {
    const cfg = this.config as FileUploadConfig<TData>;
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const files: File[] = Array.isArray(value) ? value : value ? [value] : [];

    // Whichever is lower: what this field allows, or what the server takes.
    // Saying nothing is the normal case — then the server's limit is the limit,
    // and no screen has to know a number.
    const limits = [cfg.maxSize, serverLimit()].filter(
      (candidate): candidate is number => typeof candidate === "number",
    );
    const limit = limits.length > 0 ? Math.min(...limits) : undefined;

    // A file over the limit is kept rather than dropped: it stays visible, it
    // says why it will not do, and the reader can take it out. Dropping it
    // silently is how an upload "does nothing" with nothing to read anywhere —
    // and a message held in component state does not survive the form
    // re-rendering around it.
    const oversized = limit
      ? files.find((file) => file.size > limit)
      : undefined;

    const handleFiles = (fileList: FileList | null) => {
      if (!fileList) return;
      const newFiles = Array.from(fileList);

      if (cfg.multiple) {
        const combined = [...files, ...newFiles].slice(0, cfg.maxFiles);
        onChange(combined);
      } else {
        onChange(newFiles[0] || null);
      }
    };

    const removeFile = (index: number) => {
      if (cfg.multiple) {
        const updated = files.filter((_, i) => i !== index);
        onChange(updated.length ? updated : null);
      } else {
        onChange(null);
      }
    };

    return (
      <div className={cn("space-y-2", cfg.className)}>
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25",
            error && "border-destructive",
            disabled && "cursor-not-allowed opacity-50",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!disabled) handleFiles(e.dataTransfer.files);
          }}
        >
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Datei hierher ziehen oder{" "}
            <button
              type="button"
              className="text-primary underline"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              auswählen
            </button>
          </p>
          {(cfg.accept || limit) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {[cfg.accept, limit ? `max. ${formatBytes(limit)}` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={cfg.accept}
            multiple={cfg.multiple}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
        </div>

        {oversized && limit && (
          <p data-field-error className="text-sm text-destructive">
            {oversized.name} ist {formatBytes(oversized.size)} groß — erlaubt
            sind {formatBytes(limit)}.
          </p>
        )}

        {files.length > 0 && (
          <ul className="space-y-1">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 truncate">
                  <File className="h-4 w-4 text-muted-foreground" />
                  {file.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}
