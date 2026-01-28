"use client";
import { useState, useEffect, ReactNode } from "react";
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
import { registerConfirm } from "./confirm";
import { ConfirmOptions } from "./types";

interface ConfirmRequest {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

interface ConfirmProviderProps {
  children: ReactNode;
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [queue, setQueue] = useState<ConfirmRequest[]>([]);
  const currentRequest = queue[0];

  useEffect(() => {
    registerConfirm(async (options: ConfirmOptions) => {
      return new Promise<boolean>((resolve) => {
        setQueue((q) => [...q, { options, resolve }]);
      });
    });

    return () => {
      registerConfirm(null);
    };
  }, []);

  const handleConfirm = () => {
    if (currentRequest) {
      currentRequest.resolve(true);
      setQueue((q) => q.slice(1));
    }
  };

  const handleCancel = () => {
    if (currentRequest) {
      currentRequest.resolve(false);
      setQueue((q) => q.slice(1));
    }
  };

  const {
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant,
    icon,
    image,
  } = currentRequest?.options || {};

  return (
    <>
      {children}
      <AlertDialog
        open={!!currentRequest}
        onOpenChange={(open: boolean) => !open && handleCancel()}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            {image && (
              <div className="mb-4 flex justify-center">
                <img
                  src={image}
                  alt="Confirmation"
                  className="h-24 w-24 object-contain"
                />
              </div>
            )}
            {icon && !image && (
              <div className="mb-4 flex justify-center text-6xl">{icon}</div>
            )}

            <AlertDialogTitle className="text-center">
              {title || "Bestätigung erforderlich"}
            </AlertDialogTitle>
            {description && (
              <AlertDialogDescription className="text-center">
                {description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel onClick={handleCancel}>
              {cancelLabel || "Abbrechen"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {confirmLabel || "Bestätigen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
