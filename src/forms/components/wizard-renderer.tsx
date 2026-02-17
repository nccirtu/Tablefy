"use client";
import React, { ReactNode, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { WizardStepConfig } from "../types/layout";
import { BuiltField } from "../types/form";
import { FieldRenderer } from "./field-renderer";
import { SectionRenderer } from "./section-renderer";
import { GridLayout } from "./grid-layout";

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

  const stepFields = currentStepConfig?.fields
    ? fields.filter((f) => currentStepConfig.fields!.includes(f.name))
    : [];

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "flex-1",
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                    index < currentStep &&
                      "border-primary bg-primary text-primary-foreground",
                    index === currentStep &&
                      "border-primary text-primary",
                    index > currentStep &&
                      "border-muted-foreground/25 text-muted-foreground",
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="hidden sm:block">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      index <= currentStep
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-4 hidden h-0.5 flex-1 sm:block",
                    index < currentStep ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step content */}
      <div>
        {currentStepConfig?.sections ? (
          <div className="space-y-4">
            {currentStepConfig.sections.map((section) => (
              <SectionRenderer
                key={section.id}
                section={section}
                fields={fields}
                data={data}
                errors={errors}
                onChange={onChange}
                onBlur={onBlur}
                isFieldVisible={isFieldVisible}
                isFieldDisabled={isFieldDisabled}
              />
            ))}
          </div>
        ) : (
          <GridLayout columns={columns}>
            {stepFields.map((field) => {
              if (!isFieldVisible(field)) return null;
              return (
                <FieldRenderer
                  key={field.name}
                  field={field}
                  value={data[field.name as keyof TData]}
                  error={errors[field.name as keyof TData]}
                  disabled={isFieldDisabled(field)}
                  data={data}
                  onChange={(v) => onChange(field.name as keyof TData, v)}
                  onBlur={onBlur ? () => onBlur(field.name) : undefined}
                />
              );
            })}
          </GridLayout>
        )}
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
