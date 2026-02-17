/**
 * Creates a precognition onBlur handler for a form field.
 * Requires Laravel Precognition middleware on the backend
 * and @inertiajs/react with precognition support.
 */
export function createPrecognitionBlur(
  form: any,
  fieldName: string,
): (() => void) | undefined {
  if (typeof form?.validate === "function") {
    return () => form.validate(fieldName);
  }
  return undefined;
}
