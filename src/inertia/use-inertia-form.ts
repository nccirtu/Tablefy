import { useForm as useInertiaUseForm } from "@inertiajs/react";
import { useMemo, useCallback } from "react";
import { UseInertiaFormOptions, UseInertiaFormReturn } from "./types";

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
  } = options;

  // Compute default values from schema fields
  const defaults = useMemo(() => {
    const d: Record<string, any> = {};
    for (const field of schema.fields) {
      d[field.name] =
        field.config.defaultValue !== undefined
          ? field.config.defaultValue
          : "";
    }
    return { ...d, ...initialData } as TData;
  }, [schema, initialData]);

  const form = useInertiaUseForm<TData>(defaults);

  const handleChange = useCallback(
    (field: keyof TData, value: any) => {
      form.setData(field as string, value);
    },
    [form],
  );

  const handleSubmit = useCallback(() => {
    if (!url) return;

    const submitOptions = {
      onSuccess: () => onSuccess?.(),
      onError: (errors: any) => onError?.(errors),
      onBefore: () => onBefore?.(),
      onFinish: () => onFinish?.(),
      preserveScroll,
    };

    switch (method) {
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
  }, [form, url, method, onSuccess, onError, onBefore, onFinish, preserveScroll]);

  return {
    data: form.data,
    errors: form.errors as Partial<Record<keyof TData, string>>,
    onChange: handleChange,
    onSubmit: handleSubmit,
    processing: form.processing,
    form,
  };
}
