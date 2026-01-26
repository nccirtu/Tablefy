# FormSchema - Comprehensive Documentation

Complete guide for building type-safe forms with FormSchema in Laravel/Inertia projects.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Core Concepts](#core-concepts)
5. [FormSchema Builder](#formschema-builder)
6. [Form Component](#form-component)
7. [Sections & Layout](#sections--layout)
8. [Actions](#actions)
9. [Validation](#validation)
10. [Inertia Integration](#inertia-integration)
11. [Advanced Patterns](#advanced-patterns)
12. [Complete Examples](#complete-examples)

---

## Introduction

FormSchema is a declarative form builder for React/Inertia applications, inspired by Filament Forms. It provides:

- **20 field types** - From basic inputs to advanced components
- **Type-safe** - Full TypeScript support with generics
- **Declarative API** - Fluent builder pattern like TableSchema
- **Inertia integration** - Seamless with `useForm` hook
- **shadcn/ui** - Beautiful, accessible components
- **Validation** - Client & server-side validation
- **Conditional fields** - Show/hide based on other fields
- **Sections & Tabs** - Organize complex forms

---

## Installation

```bash
npm install @nccirtu/tablefy@latest
```

### Required Peer Dependencies

FormSchema uses shadcn/ui components. Install required components:

```bash
npx shadcn@latest add input label button select checkbox textarea
npx shadcn@latest add switch radio-group slider calendar popover
npx shadcn@latest add dialog card separator badge command
```

---

## Quick Start

### 1. Define Your Form Schema

```tsx
import { FormSchema, TextInput, Select, Checkbox } from "@nccirtu/tablefy";

interface Project {
  name: string;
  priority: "low" | "medium" | "high";
  isPublic: boolean;
}

const projectSchema = FormSchema.make<Project>()
  .title("Create Project")
  .fields(
    TextInput.make<Project>("name")
      .label("Project Name")
      .required(),
    
    Select.make<Project>("priority")
      .label("Priority")
      .options([
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ]),
    
    Checkbox.make<Project>("isPublic")
      .label("Make project public")
  )
  .actions(builder => 
    builder.submit({ label: "Create" }).cancel({ label: "Cancel" })
  )
  .build();
```

### 2. Use in Component

```tsx
import { Form } from "@nccirtu/tablefy";
import { useForm } from "@inertiajs/react";

export default function CreateProject() {
  const form = useForm<Project>({
    name: "",
    priority: "medium",
    isPublic: false,
  });

  return (
    <Form
      schema={projectSchema}
      data={form.data}
      errors={form.errors}
      onChange={(field, value) => form.setData(field, value)}
      onSubmit={() => form.post("/projects")}
      processing={form.processing}
    />
  );
}
```

---

## Core Concepts

### Type Safety

FormSchema uses TypeScript generics for full type safety:

```tsx
interface User {
  name: string;
  age: number;
  email: string;
}

// ✅ Type-safe - field names must match User interface
TextInput.make<User>("name")  // ✅ OK
TextInput.make<User>("invalid")  // ❌ TypeScript error

// ✅ Value types are inferred
NumberInput.make<User>("age")  // Returns number
Checkbox.make<User>("active")  // Returns boolean
```

### Builder Pattern

All fields and builders use a fluent API:

```tsx
TextInput.make<Project>("name")
  .label("Name")
  .placeholder("Enter name...")
  .required()
  .maxLength(100)
  .helperText("Choose a unique name")
```

### Conditional Rendering

Fields can be shown/hidden based on conditions:

```tsx
// Simple boolean
TextInput.make("field").hidden(true)

// Function based on data
TextInput.make("field").hidden((data) => data.type !== "custom")

// Depends on another field
TextInput.make("customValue")
  .dependsOn("type", (value) => value === "custom")
```

---

## FormSchema Builder

### Basic Configuration

```tsx
FormSchema.make<TData>()
  .title(string | (data) => string)
  .description(string | (data) => string)
  .bordered(boolean)
  .spacing("compact" | "normal" | "relaxed")
  .columns(number)
```

### Adding Fields

```tsx
FormSchema.make<Project>()
  .fields(
    TextInput.make("name"),
    Select.make("priority"),
    Checkbox.make("isPublic")
  )
```

### Build Method

Always call `.build()` at the end:

```tsx
const schema = FormSchema.make<Project>()
  .fields(...)
  .build();  // Returns FormConfig<Project>
```

---

## Form Component

### Props

```tsx
interface FormProps<TData> {
  schema: FormConfig<TData>;        // Built schema
  data: TData;                      // Current form data
  errors?: Partial<Record<keyof TData, string>>;  // Validation errors
  onChange: (field: keyof TData, value: any) => void;  // Field change handler
  onSubmit: () => void;             // Form submit handler
  processing?: boolean;             // Loading state
  className?: string;               // Additional CSS classes
}
```

### Basic Usage

```tsx
<Form
  schema={projectSchema}
  data={form.data}
  errors={form.errors}
  onChange={(field, value) => form.setData(field, value)}
  onSubmit={() => form.post("/projects")}
  processing={form.processing}
/>
```

### With Bordered Card

```tsx
FormSchema.make<Project>()
  .bordered()  // Wraps form in a Card component
  .fields(...)
```

---

## Sections & Layout

### Basic Sections

```tsx
import { SectionBuilder } from "@nccirtu/tablefy";

FormSchema.make<Project>()
  .fields(
    TextInput.make("name"),
    TextInput.make("description"),
    Select.make("priority"),
    DatePicker.make("deadline")
  )
  .sections(
    SectionBuilder.make("Basic Info")
      .description("General project details")
      .fields(["name", "description"]),
    
    SectionBuilder.make("Settings")
      .fields(["priority", "deadline"])
      .collapsible()
      .collapsed()
  )
```

### Section Options

```tsx
SectionBuilder.make("Title")
  .description(string)        // Section description
  .fields(string[])          // Field names in this section
  .collapsible(boolean)      // Can be collapsed
  .collapsed(boolean)        // Start collapsed
  .columns(number)           // Grid columns
```

### Grid Layout

```tsx
FormSchema.make<Project>()
  .columns(2)  // 2-column grid
  .fields(
    TextInput.make("firstName").columnSpan(1),
    TextInput.make("lastName").columnSpan(1),
    Textarea.make("bio").columnSpan(2)  // Full width
  )
```

---

## Actions

### Action Builder

```tsx
import { ActionsBuilder } from "@nccirtu/tablefy";

FormSchema.make<Project>()
  .actions((builder) =>
    builder
      .submit({ label: "Save", loading: form.processing })
      .cancel({ label: "Cancel", onClick: () => router.visit("/projects") })
      .custom({
        label: "Save & Continue",
        variant: "secondary",
        onClick: () => {
          form.post("/projects", {
            onSuccess: () => router.visit("/projects/continue")
          });
        }
      })
  )
```

### Action Types

```tsx
// Submit button
.submit({
  label: string,
  loading?: boolean,
  disabled?: boolean,
  icon?: ReactNode
})

// Cancel button
.cancel({
  label: string,
  href?: string,
  onClick?: () => void,
  icon?: ReactNode
})

// Custom button
.custom({
  label: string,
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost",
  onClick?: () => void,
  href?: string,
  icon?: ReactNode,
  loading?: boolean,
  disabled?: boolean
})
```

### Actions Position

```tsx
FormSchema.make<Project>()
  .actionsPosition("start" | "end" | "between" | "center")
```

---

## Validation

### Client-Side Validation

```tsx
TextInput.make("email")
  .required()
  .rules(["email", "required"])

NumberInput.make("age")
  .min(18)
  .max(100)
  .required()
```

### Server-Side Validation (Laravel)

```php
// Laravel Controller
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:100',
        'email' => 'required|email',
        'age' => 'required|integer|min:18|max:100',
    ]);
    
    // Errors automatically passed to Inertia
}
```

```tsx
// React Component - Errors automatically displayed
<Form
  schema={schema}
  data={form.data}
  errors={form.errors}  // Laravel validation errors
  onChange={...}
  onSubmit={() => form.post("/users")}
/>
```

---

## Inertia Integration

### Create Form

```tsx
import { useForm } from "@inertiajs/react";
import { Form, FormSchema, TextInput } from "@nccirtu/tablefy";

export default function CreateUser() {
  const form = useForm<User>({
    name: "",
    email: "",
    age: 18,
  });

  const schema = FormSchema.make<User>()
    .fields(
      TextInput.make("name").required(),
      TextInput.make("email").email().required(),
      NumberInput.make("age").min(18)
    )
    .build();

  return (
    <Form
      schema={schema}
      data={form.data}
      errors={form.errors}
      onChange={(field, value) => form.setData(field, value)}
      onSubmit={() => form.post(route("users.store"))}
      processing={form.processing}
    />
  );
}
```

### Edit Form

```tsx
export default function EditUser({ user }: { user: User }) {
  const form = useForm<User>(user);  // Pre-fill with existing data

  const schema = FormSchema.make<User>()
    .title(`Edit ${user.name}`)
    .fields(...)
    .build();

  return (
    <Form
      schema={schema}
      data={form.data}
      errors={form.errors}
      onChange={(field, value) => form.setData(field, value)}
      onSubmit={() => form.put(route("users.update", user.id))}
      processing={form.processing}
    />
  );
}
```

---

## Advanced Patterns

### Dynamic Title/Description

```tsx
FormSchema.make<Project>()
  .title((data) => data.id ? `Edit ${data.name}` : "Create Project")
  .description((data) => `Last updated: ${data.updatedAt}`)
```

### Conditional Fields

```tsx
FormSchema.make<Project>()
  .fields(
    Select.make("type")
      .options([
        { label: "Standard", value: "standard" },
        { label: "Custom", value: "custom" },
      ]),
    
    // Only show if type is "custom"
    TextInput.make("customValue")
      .dependsOn("type", (value) => value === "custom")
  )
```

### Dynamic Disabled State

```tsx
TextInput.make("name")
  .disabled((data) => data.status === "published")
  .helperText((data) => 
    data.status === "published" 
      ? "Cannot edit published projects" 
      : "Enter project name"
  )
```

### File Upload with Preview

```tsx
import { ImageUpload } from "@nccirtu/tablefy";

ImageUpload.make<Project>("screenshots")
  .label("Screenshots")
  .maxSize(2 * 1024 * 1024)  // 2MB
  .maxImages(5)
  .aspectRatio("16/9")
  .multiple()
  .helperText("Upload up to 5 screenshots (max 2MB each)")
```

---

## Complete Examples

### User Registration Form

```tsx
const registrationSchema = FormSchema.make<User>()
  .title("Create Account")
  .bordered()
  
  .fields(
    TextInput.make("name")
      .label("Full Name")
      .required()
      .minLength(2)
      .maxLength(100),
    
    TextInput.make("email")
      .label("Email Address")
      .email()
      .required(),
    
    TextInput.make("password")
      .label("Password")
      .password()
      .required()
      .minLength(8),
    
    Checkbox.make("terms")
      .label("I accept the terms and conditions")
      .required()
  )
  
  .actions(builder =>
    builder
      .submit({ label: "Create Account" })
      .cancel({ label: "Back to Login", href: "/login" })
  )
  
  .build();
```

### Project Management Form

```tsx
const projectSchema = FormSchema.make<Project>()
  .title("Project Details")
  .bordered()
  .spacing("relaxed")
  
  .fields(
    TextInput.make("name")
      .label("Project Name")
      .required()
      .maxLength(100),
    
    Textarea.make("description")
      .label("Description")
      .rows(4)
      .maxLength(500),
    
    Select.make("category")
      .label("Category")
      .options(categories)
      .required(),
    
    Select.make("priority")
      .label("Priority")
      .options([
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ]),
    
    DateRangePicker.make("duration")
      .label("Project Duration")
      .required(),
    
    MultiSelect.make("team")
      .label("Team Members")
      .options(users)
      .maxItems(10),
    
    TagsInput.make("tags")
      .label("Tags")
      .maxTags(5)
      .suggestions(["frontend", "backend", "design"]),
    
    Toggle.make("notifications")
      .label("Enable Notifications")
      .default(true),
    
    ImageUpload.make("cover")
      .label("Cover Image")
      .maxSize(5 * 1024 * 1024)
      .aspectRatio("16/9")
  )
  
  .sections(
    SectionBuilder.make("Basic Information")
      .fields(["name", "description", "category", "priority"]),
    
    SectionBuilder.make("Timeline & Team")
      .fields(["duration", "team"]),
    
    SectionBuilder.make("Additional")
      .fields(["tags", "notifications", "cover"])
      .collapsible()
  )
  
  .actions(builder =>
    builder
      .submit({ label: "Save Project" })
      .cancel({ label: "Cancel" })
  )
  
  .build();
```

---

## Best Practices

1. **Always use TypeScript** - Full type safety prevents errors
2. **Group related fields** - Use sections for better UX
3. **Provide helper text** - Guide users through the form
4. **Set appropriate validation** - Both client and server-side
5. **Use appropriate field types** - Don't use TextInput for everything
6. **Test with real data** - Ensure all fields work correctly
7. **Handle loading states** - Show processing indicator
8. **Provide clear error messages** - Help users fix issues
9. **Use conditional fields wisely** - Don't overcomplicate
10. **Keep forms focused** - Split complex forms into steps

---

## Troubleshooting

### Fields not updating

Make sure you're using the `onChange` handler correctly:

```tsx
onChange={(field, value) => form.setData(field, value)}
```

### Validation errors not showing

Ensure you're passing `errors` prop:

```tsx
<Form
  schema={schema}
  data={form.data}
  errors={form.errors}  // ← Important!
  onChange={...}
  onSubmit={...}
/>
```

### TypeScript errors

Make sure your interface matches your field names:

```tsx
interface User {
  name: string;  // Must match field name
}

TextInput.make<User>("name")  // ✅ OK
TextInput.make<User>("username")  // ❌ Error
```

---

## Next Steps

- See [FORM_FIELDS_REFERENCE.md](./FORM_FIELDS_REFERENCE.md) for complete field documentation
- Check out the [examples](./FORM_EXAMPLE.tsx) for more patterns
- Read about [TableSchema](./docs/USAGE.md) for data tables

---

**Package:** `@nccirtu/tablefy`  
**Version:** 0.7.x+  
**License:** MIT
