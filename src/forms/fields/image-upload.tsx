import { BaseField } from "./base-field";
import { FieldRenderProps } from "../types/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

interface ImageUploadConfig {
  maxSize?: number; // in bytes
  maxImages?: number;
  multiple?: boolean;
  aspectRatio?: string;
  showPreview?: boolean;
}

export class ImageUpload<TData = any> extends BaseField<
  TData,
  File | File[] | string | string[]
> {
  private imageConfig: ImageUploadConfig = {
    multiple: false,
    showPreview: true,
  };

  constructor(name: keyof TData & string) {
    super(name, "image");
  }

  static make<TData>(name: keyof TData & string): ImageUpload<TData> {
    return new ImageUpload<TData>(name);
  }

  maxSize(bytes: number): this {
    this.imageConfig.maxSize = bytes;
    return this;
  }

  maxImages(count: number): this {
    this.imageConfig.maxImages = count;
    this.imageConfig.multiple = count > 1;
    return this;
  }

  multiple(): this {
    this.imageConfig.multiple = true;
    return this;
  }

  aspectRatio(ratio: string): this {
    this.imageConfig.aspectRatio = ratio;
    return this;
  }

  hidePreview(): this {
    this.imageConfig.showPreview = false;
    return this;
  }

  protected render(
    props: FieldRenderProps<TData, File | File[] | string | string[]>,
  ) {
    const { field, value, error, onChange, data } = props;
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);

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

    // Handle both File objects and URL strings
    const getImageUrls = () => {
      if (!value) return [];

      const values = Array.isArray(value) ? value : [value];
      return values
        .map((v) => {
          if (typeof v === "string") return v;
          if (v instanceof File) return URL.createObjectURL(v);
          return "";
        })
        .filter(Boolean);
    };

    const imageUrls = getImageUrls();

    const handleFiles = (newFiles: FileList | null) => {
      if (!newFiles || newFiles.length === 0) return;

      const fileArray = Array.from(newFiles);

      // Validate file type
      const invalidFiles = fileArray.filter(
        (f) => !f.type.startsWith("image/"),
      );
      if (invalidFiles.length > 0) {
        alert("Only image files are allowed");
        return;
      }

      // Validate file size
      if (this.imageConfig.maxSize) {
        const oversizedFiles = fileArray.filter(
          (f) => f.size > this.imageConfig.maxSize!,
        );
        if (oversizedFiles.length > 0) {
          alert(
            `Some images exceed the maximum size of ${this.imageConfig.maxSize / 1024 / 1024}MB`,
          );
          return;
        }
      }

      // Validate image count
      if (
        this.imageConfig.maxImages &&
        fileArray.length > this.imageConfig.maxImages
      ) {
        alert(`Maximum ${this.imageConfig.maxImages} images allowed`);
        return;
      }

      if (this.imageConfig.multiple) {
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

    const removeImage = (index: number) => {
      if (this.imageConfig.multiple && Array.isArray(value)) {
        const newValues = value.filter((_, i) => i !== index);
        onChange(newValues as any);
      } else {
        onChange(undefined as any);
      }
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
            accept="image/*"
            multiple={this.imageConfig.multiple}
            disabled={isDisabled}
            onChange={(e: any) => handleFiles(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {field.placeholder || "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to{" "}
                {this.imageConfig.maxSize
                  ? `${this.imageConfig.maxSize / 1024 / 1024}MB`
                  : "10MB"}
                {this.imageConfig.maxImages &&
                  ` • Max ${this.imageConfig.maxImages} images`}
              </p>
            </div>
          </div>
        </div>

        {this.imageConfig.showPreview && imageUrls.length > 0 && (
          <div
            className={cn(
              "grid gap-4",
              imageUrls.length === 1
                ? "grid-cols-1"
                : "grid-cols-2 md:grid-cols-3",
            )}
          >
            {imageUrls.map((url, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border bg-muted"
                style={{
                  aspectRatio: this.imageConfig.aspectRatio || "16/9",
                }}
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    disabled={isDisabled}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
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
