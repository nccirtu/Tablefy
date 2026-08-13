"use client";
import React, { ReactNode, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { WizardStepConfig } from "../types/layout";
import { BuiltField } from "../types/form";
import { FormBody } from "./form-body";

export interface WizardRendererProps<TData extends Record<string, any>> {
  steps: WizardStepConfig<TData>[];
  fields: BuiltField<TData>[];
  data: TData;
  errors: Partial<Record<keyof TData, string>>;
  onChange: (field: keyof TData, value: any) => void;
  onBlur?: (field: string) => void;
  isFieldVisible: (field: BuiltField<TData>) => boolean;
  isFieldDisabled: (field: BuiltField<TData>) => boolean;
  columns?: number;
  onSubmit: () => void;
  processing?: boolean;
}

export function WizardRenderer<TData extends Record<string, any>>({
  steps,
  fields,
  data,
  errors,
  onChange,
  onBlur,
  isFieldVisible,
  isFieldDisabled,
  columns,
  onSubmit,
  processing = false,
}: WizardRendererProps<TData>): ReactNode {
  const [currentStep, setCurrentStep] = useState(0);

  const currentStepConfig = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  const canProceed = currentStepConfig?.canProceed
    ? currentStepConfig.canProceed(data)
    : true;

  const handleNext = useCallback(async () => {
    if (currentStepConfig?.beforeNext) {
      const canContinue = await currentStepConfig.beforeNext(data);
      if (!canContinue) return;
    }
    if (isLastStep) {
      onSubmit();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  }, [currentStep, currentStepConfig, data, isLastStep, onSubmit, steps.length]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="rounded-lg bg-muted/50 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Step: {currentStep + 1} of {steps.length}
        </p>
        <div className="mt-1 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {currentStepConfig?.label}
            </h3>
            {currentStepConfig?.description && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {currentStepConfig.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-40 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div>
        <FormBody
          items={currentStepConfig?.items ?? []}
          columns={columns}
          fields={fields}
          data={data}
          errors={errors}
          onChange={onChange}
          onBlur={onBlur}
          isFieldVisible={isFieldVisible}
          isFieldDisabled={isFieldDisabled}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          Previous
        </Button>
        <Button
          type={isLastStep ? "submit" : "button"}
          onClick={handleNext}
          disabled={!canProceed || (isLastStep && processing)}
        >
          {isLastStep
            ? processing
              ? "Processing..."
              : "Submit"
            : "Next"}
        </Button>
      </div>
    </div>
  );
}
