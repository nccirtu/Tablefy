"use client";
import { useState, useEffect, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

  return (
    <>
      {children}
      <Dialog
        open={!!currentRequest}
        onOpenChange={(open: boolean) => !open && handleCancel()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentRequest?.options.title || "Bestätigung erforderlich"}
            </DialogTitle>
            {currentRequest?.options.description && (
              <DialogDescription>
                {currentRequest.options.description}
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {currentRequest?.options.cancelLabel || "Abbrechen"}
            </Button>
            <Button
              variant={currentRequest?.options.variant || "default"}
              onClick={handleConfirm}
            >
              {currentRequest?.options.confirmLabel || "Bestätigen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
