import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

interface FileUploadConfig {
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  showPreview?: boolean;
}

export class FileUpload<TData = any> extends BaseField<TData, File | File[]> {
  private fileConfig: FileUploadConfig = {
    multiple: false,
    showPreview: true,
  };

  constructor(name: keyof TData & string) {
    super(name, "file");
  }

  static make<TData>(name: keyof TData & string): FileUpload<TData> {
    return new FileUpload<TData>(name);
  }

  accept(accept: string): this {
    this.fileConfig.accept = accept;
    return this;
  }

  maxSize(bytes: number): this {
    this.fileConfig.maxSize = bytes;
    return this;
  }

  maxFiles(count: number): this {
    this.fileConfig.maxFiles = count;
    this.fileConfig.multiple = count > 1;
    return this;
  }

  multiple(): this {
    this.fileConfig.multiple = true;
    return this;
  }

  hidePreview(): this {
    this.fileConfig.showPreview = false;
    return this;
  }

  protected render(props: FieldRenderProps<TData, File | File[]>) {
    const { field, value, error, onChange, data } = props;
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const isDisabled =
      typeof field.disabled === "function"
        ? field.disabled(data)
        : field.disabled;
    const isHidden =
      typeof field.hidden === "function" ? field.hidden(data) : field.hidden;
    const helperText =
      typeof field.helperText === "function"
        ? field.helperText(data)
        : field.helperText;

    if (isHidden) {
      return null;
    }

    const files = value ? (Array.isArray(value) ? value : [value]) : [];

    const handleFiles = (newFiles: FileList | null) => {
      if (!newFiles || newFiles.length === 0) return;

      const fileArray = Array.from(newFiles);

      // Validate file size
      if (this.fileConfig.maxSize) {
        const invalidFiles = fileArray.filter(
          (f) => f.size > this.fileConfig.maxSize!,
        );
        if (invalidFiles.length > 0) {
          alert(
            `Some files exceed the maximum size of ${this.fileConfig.maxSize / 1024 / 1024}MB`,
          );
          return;
        }
      }

      // Validate file count
      if (
        this.fileConfig.maxFiles &&
        fileArray.length > this.fileConfig.maxFiles
      ) {
        alert(`Maximum ${this.fileConfig.maxFiles} files allowed`);
        return;
      }

      if (this.fileConfig.multiple) {
        onChange(fileArray as any);
      } else {
        onChange(fileArray[0] as any);
      }
    };

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (!isDisabled && e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    };

    const removeFile = (index: number) => {
      if (this.fileConfig.multiple) {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles as any);
      } else {
        onChange(undefined as any);
      }
    };

    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
      <div className="space-y-2">
        {field.label && (
          <Label
            className={cn(
              field.required &&
                "after:content-['*'] after:ml-0.5 after:text-destructive",
            )}
          >
            {field.label}
          </Label>
        )}

        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 transition-colors",
            dragActive && "border-primary bg-primary/5",
            error && "border-destructive",
            isDisabled && "opacity-50 cursor-not-allowed",
            !isDisabled && "cursor-pointer hover:border-primary/50",
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isDisabled && inputRef.current?.click()}
        >
          <Input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={this.fileConfig.accept}
            multiple={this.fileConfig.multiple}
            disabled={isDisabled}
            onChange={(e: any) => handleFiles(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {field.placeholder || "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                {this.fileConfig.accept &&
                  `Accepted: ${this.fileConfig.accept}`}
                {this.fileConfig.maxSize &&
                  ` • Max size: ${formatFileSize(this.fileConfig.maxSize)}`}
                {this.fileConfig.maxFiles &&
                  ` • Max files: ${this.fileConfig.maxFiles}`}
              </p>
            </div>
          </div>
        </div>

        {this.fileConfig.showPreview && files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  disabled={isDisabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
}
