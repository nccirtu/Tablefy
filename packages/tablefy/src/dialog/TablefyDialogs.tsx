"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormRenderer } from "../forms";
import type { FormBuildResult } from "../forms";
import { useInertiaForm } from "../inertia/use-inertia-form";
import { registerConfirm } from "../confirm/confirm";
import { dialog } from "./dialog";
import { closeDialog, getDialogs, getPageProps, subscribeDialogs } from "./store";
import type {
  ConfirmDialogState,
  CustomDialogState,
  DialogState,
  FormDialogState,
  FormSchemaInput,
} from "./types";

function resolveSchema(
  input: FormSchemaInput<any>,
): FormBuildResult<Record<string, unknown>> {
  return typeof (input as { build?: unknown }).build === "function"
    ? (input as { build(): FormBuildResult<Record<string, unknown>> }).build()
    : (input as FormBuildResult<Record<string, unknown>>);
}

/**
 * Local open state for a dialog item. Closing first transitions `open → false`
 * (so Radix runs its cleanup: restoring body pointer-events + scroll lock), then
 * removes the item from the store after the close animation — avoids the
 * "page frozen after close" bug caused by unmounting while still open.
 */
function useDialogClose(id: string) {
  const [open, setOpen] = useState(true);
  const close = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      closeDialog(id);
      // When a dialog is opened from a Radix DropdownMenu (row actions), the
      // menu's pointer-events lock can get stuck on <body> ("page frozen").
      // Once no dialog remains, clear any leftover inline lock.
      if (typeof document !== "undefined" && getDialogs().length === 0) {
        document.body.style.pointerEvents = "";
      }
    }, 200);
  }, [id]);
  return { open, close };
}

function ConfirmItem({ state }: { state: ConfirmDialogState }) {
  const { title, description, confirmLabel, cancelLabel, variant, icon, image } =
    state.options;
  const { open, close } = useDialogClose(state.id);

  const settle = (value: boolean) => {
    state.resolve(value);
    close();
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && settle(false)}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            {title || "Bestätigung erforderlich"}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-center">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {image && (
          <div className="flex justify-center py-4">
            <img src={image} alt="" className="h-24 w-24 object-contain" />
          </div>
        )}
        {icon && !image && (
          <div className="flex justify-center py-4 text-6xl">{icon}</div>
        )}
        <AlertDialogFooter className="flex flex-row !justify-between w-full">
          <AlertDialogCancel onClick={() => settle(false)} className="mt-0">
            {cancelLabel || "Abbrechen"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => settle(true)}
            variant={variant === "destructive" ? "destructive" : "default"}
          >
            {confirmLabel || "Bestätigen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FormItem({ state }: { state: FormDialogState }) {
  const o = state.options;
  const { open, close } = useDialogClose(state.id);
  const built = resolveSchema(o.schema);
  // Render fields only — submit/cancel live in the dialog footer.
  const fieldsOnly: FormBuildResult<Record<string, unknown>> = {
    ...built,
    config: { ...built.config, actions: undefined },
  };

  const method = o.method ?? "post";
  const operation = method === "post" ? "create" : "edit";

  const form = useInertiaForm<Record<string, unknown>>({
    schema: built,
    initialData: o.data,
    url: o.url,
    method,
    preserveScroll: true,
    headers: { "X-Tablefy-Modal": "1" },
    onSuccess: () => {
      o.onSuccess?.();
      close();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent>
        {(o.title || o.description) && (
          <DialogHeader>
            {o.title && <DialogTitle>{o.title}</DialogTitle>}
            {o.description && <DialogDescription>{o.description}</DialogDescription>}
          </DialogHeader>
        )}
        {/* Scrollbarer Feld-Bereich; Header + Footer bleiben sichtbar. */}
        <div className="-mx-1 max-h-[65vh] overflow-y-auto px-1">
          <FormRenderer
            schema={fieldsOnly}
            data={form.data}
            errors={form.errors}
            onChange={form.onChange}
            onSubmit={form.onSubmit}
            processing={form.processing}
            external={getPageProps()}
            operation={operation}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            {o.cancelLabel ?? "Abbrechen"}
          </Button>
          <Button onClick={() => form.onSubmit()} disabled={form.processing}>
            {o.submitLabel ?? "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CustomItem({ state }: { state: CustomDialogState }) {
  const o = state.options;
  const { open, close } = useDialogClose(state.id);
  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className={o.className}>
        {(o.title || o.description) && (
          <DialogHeader>
            {o.title && <DialogTitle>{o.title}</DialogTitle>}
            {o.description && <DialogDescription>{o.description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="-mx-1 max-h-[70vh] overflow-y-auto px-1">{o.content}</div>
      </DialogContent>
    </Dialog>
  );
}

function DialogItem({ state }: { state: DialogState }) {
  switch (state.kind) {
    case "confirm":
      return <ConfirmItem state={state} />;
    case "form":
      return <FormItem state={state} />;
    case "custom":
      return <CustomItem state={state} />;
    default:
      return null;
  }
}

/**
 * Mount once in the app root (e.g. `withApp` next to `<Toaster />`). Renders the
 * dialog stack and also wires the legacy `confirm()` helper through `dialog`.
 */
export function TablefyDialogs() {
  const [dialogs, setDialogs] = useState<DialogState[]>(getDialogs());

  useEffect(() => subscribeDialogs(setDialogs), []);

  useEffect(() => {
    registerConfirm((options) => dialog.confirm(options));
    return () => registerConfirm(null);
  }, []);

  return (
    <>
      {dialogs.map((state) => (
        <DialogItem key={state.id} state={state} />
      ))}
    </>
  );
}
