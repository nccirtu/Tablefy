# FormSchema Design Document

## Vision

Ein deklaratives Form-Builder-System für Laravel/Inertia, inspiriert von Filament Forms, das:

- Ähnliche API wie TableSchema verwendet
- Nahtlos mit Inertia's `<Form>` Component und wayfinder integriert
- Alle shadcn/ui Form Components nutzt
- Type-safe mit TypeScript ist
- Validierung unterstützt
- Create & Edit Forms mit einer API handhabt

## API Design

### Basic Usage

```tsx
import { FormSchema } from "@nccirtu/tablefy";
import { useForm } from "@inertiajs/react";

const projectForm = FormSchema.make<Project>()
  .title("Create Project")
  .description("Fill in the details to create a new project")
  .fields(
    TextInput.make("name")
      .label("Project Name")
      .placeholder("Enter project name...")
      .required()
      .helperText("Choose a unique name for your project"),

    Textarea.make("description").label("Description").rows(4).maxLength(500),

    Select.make("priority")
      .label("Priority")
      .options([
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ])
      .default("medium"),

    DatePicker.make("deadline").label("Deadline").minDate(new Date()),

    Checkbox.make("isPublic")
      .label("Make this project public")
      .helperText("Public projects are visible to everyone"),

    Toggle.make("notifications").label("Enable notifications").default(true),
  )
  .sections(
    Section.make("Basic Information")
      .description("General project details")
      .fields(["name", "description"]),

    Section.make("Settings")
      .fields(["priority", "deadline", "isPublic", "notifications"])
      .collapsible(),
  )
  .actions((builder) =>
    builder
      .submit({ label: "Create Project" })
      .cancel({ label: "Cancel", href: "/projects" }),
  );

// In Component
export default function CreateProject() {
  const form = useForm<Project>({
    name: "",
    description: "",
    priority: "medium",
    deadline: null,
    isPublic: false,
    notifications: true,
  });

  return (
    <Form
      schema={projectForm}
      form={form}
      onSubmit={() => form.post("/projects")}
    />
  );
}
```

### Edit Form

```tsx
const projectEditForm = FormSchema.make<Project>()
  .title((data) => `Edit ${data.name}`)
  .fields(/* same fields */)
  .fillWith((data) => ({
    name: data.name,
    description: data.description,
    // ...
  }));

export default function EditProject({ project }: { project: Project }) {
  const form = useForm<Project>(project);

  return (
    <Form
      schema={projectEditForm}
      form={form}
      data={project}
      onSubmit={() => form.put(`/projects/${project.id}`)}
    />
  );
}
```

## Field Types

### Text Inputs

- `TextInput` - Standard text input
- `Textarea` - Multi-line text
- `PasswordInput` - Password field with visibility toggle
- `EmailInput` - Email with validation
- `UrlInput` - URL with validation
- `NumberInput` - Number with step controls

### Selection

- `Select` - Dropdown select
- `MultiSelect` - Multiple selection
- `RadioGroup` - Radio buttons
- `Combobox` - Searchable select
- `TagsInput` - Multiple tags

### Boolean

- `Checkbox` - Single checkbox
- `CheckboxGroup` - Multiple checkboxes
- `Toggle` - Switch toggle

### Date & Time

- `DatePicker` - Date selection
- `DateRangePicker` - Date range
- `TimePicker` - Time selection
- `DateTimePicker` - Date and time

### File Upload

- `FileUpload` - Single file
- `MultiFileUpload` - Multiple files
- `ImageUpload` - Image with preview

### Rich Content

- `RichTextEditor` - WYSIWYG editor
- `MarkdownEditor` - Markdown with preview
- `CodeEditor` - Code with syntax highlighting

### Special

- `ColorPicker` - Color selection
- `Slider` - Range slider
- `Rating` - Star rating
- `Hidden` - Hidden field

## Field Configuration

Every field supports:

```tsx
Field.make("fieldName")
  .label("Label")
  .placeholder("Placeholder...")
  .helperText("Helper text below field")
  .required()
  .disabled()
  .readonly()
  .default(value)
  .rules(["required", "min:3", "max:255"])
  .reactive() // Re-render on change
  .dependsOn("otherField", (value) => value === "something")
  .hidden((data) => data.someCondition)
  .columnSpan(2); // Grid layout
```

## Layout & Organization

### Sections

```tsx
Section.make("Section Title")
  .description("Section description")
  .fields(["field1", "field2"])
  .collapsible()
  .collapsed()
  .columns(2); // Grid layout
```

### Tabs

```tsx
FormSchema.make().tabs(
  Tab.make("General").fields(["name", "description"]),

  Tab.make("Settings").fields(["priority", "deadline"]),

  Tab.make("Advanced").fields(["customOptions"]),
);
```

### Grid Layout

```tsx
FormSchema.make().columns(2).fields(
  TextInput.make("firstName").columnSpan(1),
  TextInput.make("lastName").columnSpan(1),
  Textarea.make("bio").columnSpan(2), // Full width
);
```

## Validation

### Client-side

```tsx
TextInput.make("email").email().required().rules(["email", "required"]);
```

### Server-side Integration

```tsx
// Inertia automatically handles Laravel validation errors
form.post("/projects", {
  onError: (errors) => {
    // Errors automatically shown in form fields
  },
});
```

## Actions

```tsx
FormSchema.make()
  .actions((builder) =>
    builder
      .submit({
        label: "Save",
        loading: form.processing,
        disabled: !form.isDirty,
      })
      .cancel({
        label: "Cancel",
        onClick: () => router.visit("/projects"),
      })
      .custom({
        label: "Save & Continue",
        onClick: () =>
          form.post("/projects", {
            onSuccess: () => router.visit("/projects/continue"),
          }),
      }),
  )
  .actionsPosition("end"); // start | end | between | center
```

## Inertia Integration

### With wayfinder

```tsx
import { useForm } from "@inertiajs/react";
import { Form } from "@nccirtu/tablefy";

export default function CreateProject() {
  const form = useForm<Project>({
    /* initial data */
  });

  return (
    <Form
      schema={projectForm}
      form={form}
      onSubmit={() => form.post(route("projects.store"))}
      // wayfinder automatically handles navigation
    />
  );
}
```

### Form State

```tsx
// Form component automatically handles:
- form.data (current values)
- form.errors (validation errors)
- form.processing (loading state)
- form.isDirty (has changes)
- form.setData() (update values)
- form.reset() (reset to initial)
```

## File Structure

```
src/
  forms/
    FormSchema.tsx          # Main schema builder
    Form.tsx                # Form component
    fields/
      base-field.tsx        # Base field class
      text-input.tsx
      textarea.tsx
      select.tsx
      checkbox.tsx
      date-picker.tsx
      file-upload.tsx
      # ... all field types
    builders/
      section.tsx
      tab.tsx
      actions.tsx
    types/
      form.ts
      field.ts
      validation.ts
    index.ts
```

## Example: Complete Form

```tsx
const projectForm = FormSchema.make<Project>()
  .title("Project Details")
  .description("Manage your project settings")

  .sections(
    Section.make("Basic Information")
      .columns(2)
      .fields(
        TextInput.make("name").label("Project Name").required().columnSpan(2),

        Select.make("category")
          .label("Category")
          .options(categories)
          .searchable(),

        Select.make("status")
          .label("Status")
          .options([
            { label: "Draft", value: "draft" },
            { label: "Active", value: "active" },
            { label: "Completed", value: "completed" },
          ]),

        Textarea.make("description").label("Description").rows(4).columnSpan(2),
      ),

    Section.make("Team & Collaboration").collapsible().fields(
      MultiSelect.make("members")
        .label("Team Members")
        .options(users)
        .searchable(),

      Toggle.make("allowComments")
        .label("Allow Comments")
        .helperText("Team members can comment on tasks"),
    ),

    Section.make("Dates & Deadlines")
      .columns(2)
      .fields(
        DatePicker.make("startDate").label("Start Date").required(),

        DatePicker.make("endDate")
          .label("End Date")
          .minDate((data) => data.startDate),
      ),
  )

  .actions((builder) =>
    builder
      .submit({ label: "Save Project" })
      .cancel({ label: "Cancel", href: "/projects" }),
  );
```

## Next Steps

1. ✅ Create feature branch
2. ⏳ Implement base FormSchema builder
3. ⏳ Create base Field class
4. ⏳ Implement core field types (TextInput, Select, Checkbox)
5. ⏳ Create Form component with Inertia integration
6. ⏳ Add Section and Tab builders
7. ⏳ Implement validation
8. ⏳ Add all remaining field types
9. ⏳ Create comprehensive documentation
10. ⏳ Test with real Laravel/Inertia project
