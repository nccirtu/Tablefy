import { useForm as useInertiaUseForm } from "@inertiajs/react";
import { useMemo, useCallback } from "react";
import { UseInertiaFormOptions, UseInertiaFormReturn } from "./types";

/** Recursively detect File/Blob/FileList in the payload (drives multipart). */
function containsFiles(value: any): boolean {
  if (typeof File !== "undefined" && value instanceof File) return true;
  if (typeof Blob !== "undefined" && value instanceof Blob) return true;
  if (typeof FileList !== "undefined" && value instanceof FileList) return true;
  if (Array.isArray(value)) return value.some(containsFiles);
  if (value && typeof value === "object")
    return Object.values(value).some(containsFiles);
  return false;
}

export function useInertiaForm<TData extends Record<string, any>>(
  options: UseInertiaFormOptions<TData>,
): UseInertiaFormReturn<TData> {
  const {
    schema,
    initialData,
    url,
    method = "post",
    onSuccess,
    onError,
    onBefore,
    onFinish,
    preserveScroll,
    headers,
  } = options;

  // Compute default values from schema fields
  const defaults = useMemo(() => {
    const merged: Record<string, any> = {};
    for (const field of schema.fields) {
      merged[field.name] =
        field.config.defaultValue !== undefined
          ? field.config.defaultValue
          : "";
    }
    Object.assign(merged, initialData);
    // afterStateHydrated-style: format the loaded value for display.
    for (const field of schema.fields) {
      const fmt = field.config.formatStateUsing;
      if (fmt) merged[field.name] = fmt(merged[field.name], merged as TData);
    }
    return merged as TData;
  }, [schema, initialData]);

  const form = useInertiaUseForm<TData>(defaults);

  // Build the submit payload: drop `dehydrated(false)` fields and apply
  // each field's `mutateBeforeSave`.
  const transformPayload = useCallback(
    (data: TData) => {
      const out: Record<string, any> = { ...data };
      for (const field of schema.fields) {
        const cfg = field.config;
        if (cfg.dehydrated === false) {
          delete out[field.name];
          continue;
        }
        if (cfg.mutateBeforeSave && field.name in out) {
          out[field.name] = cfg.mutateBeforeSave(out[field.name], data);
        }
      }
      return out as TData;
    },
    [schema],
  );

  const handleChange = useCallback(
    (field: keyof TData, value: any) => {
      form.setData(field as string, value);
    },
    [form],
  );

  const handleSubmit = useCallback(() => {
    if (!url) return;

    // PHP only parses multipart bodies on POST — so when files are present and
    // the verb is PUT/PATCH/DELETE, send POST + `_method` spoofing (FormData).
    const hasFiles = containsFiles(transformPayload(form.data));
    const spoof = hasFiles && method !== "post";

    form.transform((data) =>
      spoof
        ? { ...transformPayload(data), _method: method.toUpperCase() }
        : transformPayload(data),
    );

    const submitOptions = {
      onSuccess: () => onSuccess?.(),
      onError: (errors: any) => onError?.(errors),
      onBefore: () => onBefore?.(),
      onFinish: () => onFinish?.(),
      preserveScroll,
      ...(hasFiles ? { forceFormData: true } : {}),
      ...(headers ? { headers } : {}),
    };

    switch (spoof ? "post" : method) {
      case "post":
        form.post(url, submitOptions);
        break;
      case "put":
        form.put(url, submitOptions);
        break;
      case "patch":
        form.patch(url, submitOptions);
        break;
      case "delete":
        form.delete(url, submitOptions);
        break;
    }
  }, [form, url, method, onSuccess, onError, onBefore, onFinish, preserveScroll, headers, transformPayload]);

  return {
    data: form.data,
    errors: form.errors as Partial<Record<keyof TData, string>>,
    onChange: handleChange,
    onSubmit: handleSubmit,
    processing: form.processing,
    form,
  };
}
