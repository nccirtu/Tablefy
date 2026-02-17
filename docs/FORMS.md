# Forms Guide

Complete guide to building schema-driven forms with Tablefy. Tablefy Forms provides a fluent, chainable API for building type-safe React forms on top of shadcn/ui components.

## Table of Contents

- [Quick Start](#quick-start)
- [FormSchema Builder](#formschema-builder)
- [Field Types](#field-types)
  - [TextInput](#textinput)
  - [Textarea](#textarea)
  - [Select](#select)
  - [Checkbox](#checkbox)
  - [CheckboxGroup](#checkboxgroup)
  - [Toggle](#toggle)
  - [RadioGroup](#radiogroup)
  - [DatePicker](#datepicker)
  - [FileUpload](#fileupload)
  - [Repeater](#repeater)
  - [Hidden](#hidden)
- [Shared Field Methods](#shared-field-methods)
- [Layout](#layout)
  - [Grid Columns](#grid-columns)
  - [Sections](#sections)
  - [Tabs](#tabs)
  - [Wizard (Multi-Step)](#wizard-multi-step)
- [Actions](#actions)
- [Field Dependencies](#field-dependencies)
- [FormRenderer Component](#formrenderer-component)
- [Standalone Usage (without Inertia)](#standalone-usage-without-inertia)
- [Full Examples](#full-examples)

---

## Quick Start

```tsx
import { FormSchema, TextInput, Select, FormRenderer } from "@nccirtu/tablefy/forms";

type CreateUser = {
  name: string;
  email: string;
  role: string;
};

// 1. Define your form schema
const schema = FormSchema.make<CreateUser>()
  .title("Create User")
  .description("Add a new team member")
  .columns(2)
  .fields(
    TextInput.make<CreateUser>("name").label("Name").required(),
    TextInput.make<CreateUser>("email").label("Email").email().required(),
    Select.make<CreateUser>("role")
      .label("Role")
      .options([
        { value: "admin", label: "Admin" },
        { value: "editor", label: "Editor" },
        { value: "viewer", label: "Viewer" },
      ])
      .required()
      .columnSpan(2),
  )
  .actions((a) => a.submit({ label: "Create User" }).cancel({ label: "Cancel" }))
  .build();

// 2. Render it
function CreateUserPage() {
  const [data, setData] = useState<CreateUser>({ name: "", email: "", role: "" });
  const [errors, setErrors] = useState({});

  return (
    <FormRenderer
      schema={schema}
      data={data}
      errors={errors}
      onChange={(field, value) => setData((prev) => ({ ...prev, [field]: value }))}
      onSubmit={() => console.log("Submit:", data)}
    />
  );
}
```

---

## FormSchema Builder

The `FormSchema` builder is the entry point for defining your form. It mirrors the `TableSchema` pattern.

```tsx
import { FormSchema } from "@nccirtu/tablefy/forms";

const schema = FormSchema.make<MyFormData>()
  .title("Form Title")                        // string or (data) => string
  .description("Form description")            // string or (data) => string
  .columns(2)                                  // grid columns (1-4)
  .spacing("normal")                           // "compact" | "normal" | "relaxed"
  .bordered()                                  // wrap in Card
  .disabled(false)                             // boolean or (data) => boolean
  .fields(/* ...field builders */)             // field definitions
  .sections(/* ...section builders */)         // section layout
  .tabs(/* ...tab builders */)                 // tab layout
  .wizard(/* ...wizard step builders */)       // wizard layout
  .actions((a) => a.submit().cancel())         // form action buttons
  .actionsPosition("end")                      // "start" | "end" | "between" | "center"
  .build();                                    // returns { fields, config }
```

| Method | Type | Description |
|---|---|---|
| `title(title)` | `string \| (data) => string` | Form title, can be dynamic |
| `description(desc)` | `string \| (data) => string` | Form description |
| `columns(n)` | `number` | Grid columns (1-4), default 1 |
| `spacing(s)` | `"compact" \| "normal" \| "relaxed"` | Vertical spacing between fields |
| `bordered()` | `boolean` | Wrap form in a Card component |
| `disabled(d)` | `boolean \| (data) => boolean` | Disable all fields globally |
| `fields(...builders)` | `FieldBuilder[]` | Define form fields |
| `sections(...builders)` | `SectionBuilder[]` | Define section layout |
| `tabs(...builders)` | `TabBuilder[]` | Define tab layout |
| `wizard(...builders)` | `WizardStep[]` | Define wizard/multi-step layout |
| `actions(fn)` | `(ActionsBuilder) => ActionsBuilder` | Define form action buttons |
| `actionsPosition(pos)` | `string` | Position of action buttons |

---

## Field Types

### TextInput

Text input for single-line text, emails, passwords, URLs, etc.

**shadcn component:** `<Input>`

```tsx
import { TextInput } from "@nccirtu/tablefy/forms";

// Basic
TextInput.make<T>("name").label("Full Name").required()

// Email
TextInput.make<T>("email").label("Email Address").email().required()

// Password
TextInput.make<T>("password").label("Password").password().minLength(8)

// Number
TextInput.make<T>("age").label("Age").number().placeholder("Enter your age")

// URL
TextInput.make<T>("website").label("Website").url()

// Phone
TextInput.make<T>("phone").label("Phone").tel()

// With prefix/suffix
TextInput.make<T>("price").label("Price").number().prefix("$").suffix("USD")

// With max length
TextInput.make<T>("username").label("Username").maxLength(20)

// With autocomplete
TextInput.make<T>("address").label("Address").autocomplete("street-address")
```

| Method | Description |
|---|---|
| `type(t)` | Set input type: `"text"`, `"email"`, `"password"`, `"number"`, `"url"`, `"tel"` |
| `email()` | Shortcut for `.type("email")` |
| `password()` | Shortcut for `.type("password")` |
| `number()` | Shortcut for `.type("number")` |
| `url()` | Shortcut for `.type("url")` |
| `tel()` | Shortcut for `.type("tel")` |
| `minLength(n)` | Set minimum character length |
| `maxLength(n)` | Set maximum character length |
| `prefix(text)` | Add prefix text/element before input |
| `suffix(text)` | Add suffix text/element after input |
| `autocomplete(value)` | Set HTML autocomplete attribute |

---

### Textarea

Multi-line text input.

**shadcn component:** `<Textarea>`

```tsx
import { Textarea } from "@nccirtu/tablefy/forms";

// Basic
Textarea.make<T>("bio").label("Biography").rows(4)

// With character limits
Textarea.make<T>("description")
  .label("Description")
  .rows(6)
  .minLength(10)
  .maxLength(500)
  .placeholder("Describe your project...")

// Full width in a 2-column grid
Textarea.make<T>("notes").label("Notes").rows(4).columnSpan(2)
```

| Method | Description |
|---|---|
| `rows(n)` | Number of visible rows (default: 3) |
| `minLength(n)` | Minimum character length |
| `maxLength(n)` | Maximum character length |
| `autoResize()` | Enable auto-resizing based on content |

---

### Select

Dropdown select input with static or dynamic options.

**shadcn component:** `<Select>`

```tsx
import { Select } from "@nccirtu/tablefy/forms";

// Static options
Select.make<T>("country")
  .label("Country")
  .options([
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "de", label: "Germany" },
  ])
  .required()

// Dynamic options based on form data
Select.make<T>("city")
  .label("City")
  .options((data) => {
    if (data.country === "us") return [
      { value: "nyc", label: "New York" },
      { value: "la", label: "Los Angeles" },
    ];
    if (data.country === "uk") return [
      { value: "london", label: "London" },
      { value: "manchester", label: "Manchester" },
    ];
    return [];
  })
  .placeholder("Select a city...")

// With disabled options
Select.make<T>("plan")
  .label("Plan")
  .options([
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro" },
    { value: "enterprise", label: "Enterprise", disabled: true },
  ])

// Clearable
Select.make<T>("category")
  .label("Category")
  .options([/* ... */])
  .clearable()
```

| Method | Description |
|---|---|
| `options(opts)` | `SelectOption[]` or `(data) => SelectOption[]` |
| `multiple()` | Enable multi-select |
| `searchable()` | Enable option search |
| `clearable()` | Allow clearing the selection |
| `maxItems(n)` | Max items for multi-select |
| `loadOptions(fn)` | Async option loader: `(query) => Promise<SelectOption[]>` |

**SelectOption type:**

```tsx
type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};
```

---

### Checkbox

Single boolean checkbox.

**shadcn component:** `<Checkbox>`

```tsx
import { Checkbox } from "@nccirtu/tablefy/forms";

// Basic
Checkbox.make<T>("agree_terms")
  .label("I agree to the Terms of Service")
  .required()

// With helper text
Checkbox.make<T>("newsletter")
  .label("Subscribe to newsletter")
  .helperText("We'll send you weekly updates")
  .default(true)
```

The label is rendered inline next to the checkbox (not above it like other fields).

---

### CheckboxGroup

Multiple checkboxes for selecting multiple values from a list.

**shadcn component:** Multiple `<Checkbox>` components

```tsx
import { CheckboxGroup } from "@nccirtu/tablefy/forms";

// Basic
CheckboxGroup.make<T>("permissions")
  .label("Permissions")
  .options([
    { value: "read", label: "Read" },
    { value: "write", label: "Write" },
    { value: "delete", label: "Delete" },
    { value: "admin", label: "Admin" },
  ])

// Multi-column layout
CheckboxGroup.make<T>("features")
  .label("Features")
  .options([
    { value: "analytics", label: "Analytics" },
    { value: "reports", label: "Reports" },
    { value: "api", label: "API Access" },
    { value: "sso", label: "SSO" },
  ])
  .columns(2)
```

The field value is a `string[]` of selected option values.

| Method | Description |
|---|---|
| `options(opts)` | Array of `SelectOption[]` |
| `columns(n)` | Number of grid columns (1-4) for layout |

---

### Toggle

On/off switch for boolean values.

**shadcn component:** `<Switch>`

```tsx
import { Toggle } from "@nccirtu/tablefy/forms";

// Basic
Toggle.make<T>("is_active")
  .label("Active")

// With on/off labels
Toggle.make<T>("notifications")
  .label("Email Notifications")
  .onLabel("Enabled")
  .offLabel("Disabled")

// Default on
Toggle.make<T>("is_public")
  .label("Public Profile")
  .default(true)
  .helperText("When enabled, your profile is visible to everyone")
```

| Method | Description |
|---|---|
| `onLabel(text)` | Label shown when toggle is on |
| `offLabel(text)` | Label shown when toggle is off |

---

### RadioGroup

Radio button group for selecting one option from a list.

**shadcn component:** `<RadioGroup>`

```tsx
import { RadioGroup } from "@nccirtu/tablefy/forms";

// Vertical (default)
RadioGroup.make<T>("priority")
  .label("Priority")
  .options([
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ])
  .required()

// Horizontal
RadioGroup.make<T>("size")
  .label("Size")
  .options([
    { value: "s", label: "Small" },
    { value: "m", label: "Medium" },
    { value: "l", label: "Large" },
    { value: "xl", label: "Extra Large" },
  ])
  .horizontal()
```

| Method | Description |
|---|---|
| `options(opts)` | Array of `SelectOption[]` |
| `orientation(o)` | `"horizontal"` or `"vertical"` |
| `horizontal()` | Shortcut for `.orientation("horizontal")` |
| `vertical()` | Shortcut for `.orientation("vertical")` |

---

### DatePicker

Date picker with calendar popup.

**shadcn components:** `<Popover>` + `<Calendar>`

```tsx
import { DatePicker } from "@nccirtu/tablefy/forms";

// Basic
DatePicker.make<T>("birthday")
  .label("Date of Birth")

// With constraints
DatePicker.make<T>("start_date")
  .label("Start Date")
  .minDate(new Date())
  .placeholder("Pick a start date")

// Dynamic constraints based on other fields
DatePicker.make<T>("end_date")
  .label("End Date")
  .minDate((data) => new Date(data.start_date))
  .placeholder("Pick an end date")

// With custom locale
DatePicker.make<T>("event_date")
  .label("Event Date")
  .locale("de-DE")
```

The field value is stored as an ISO date string (`"2024-01-15"`).

| Method | Description |
|---|---|
| `minDate(date)` | `Date` or `(data) => Date` - minimum selectable date |
| `maxDate(date)` | `Date` or `(data) => Date` - maximum selectable date |
| `format(fmt)` | Date format string (default: `"PPP"`) |
| `includeTime()` | Include time picker |
| `locale(loc)` | Locale for date formatting (default: `"en-US"`) |

---

### FileUpload

File upload with drag-and-drop support.

**Custom component** with drag zone

```tsx
import { FileUpload } from "@nccirtu/tablefy/forms";

// Single file
FileUpload.make<T>("avatar")
  .label("Profile Photo")
  .image()
  .maxSize(5 * 1024 * 1024) // 5MB

// Multiple files
FileUpload.make<T>("documents")
  .label("Documents")
  .multiple()
  .maxFiles(5)
  .accept("application/pdf,.doc,.docx")

// PDF only
FileUpload.make<T>("contract")
  .label("Contract")
  .pdf()
  .maxSize(10 * 1024 * 1024) // 10MB

// Image with preview
FileUpload.make<T>("gallery")
  .label("Gallery Images")
  .image()
  .multiple()
  .maxFiles(10)
  .preview()
```

| Method | Description |
|---|---|
| `accept(mime)` | Accepted file types (e.g., `"image/*"`, `"application/pdf"`) |
| `maxSize(bytes)` | Maximum file size in bytes |
| `multiple()` | Allow multiple file uploads |
| `maxFiles(n)` | Maximum number of files |
| `preview()` | Show file preview (default: true) |
| `image()` | Shortcut for `.accept("image/*")` |
| `pdf()` | Shortcut for `.accept("application/pdf")` |

---

### Repeater

Dynamic list of repeatable field groups. Perfect for phone numbers, addresses, line items, etc.

**Custom component** with add/remove controls

```tsx
import { Repeater, TextInput, Select } from "@nccirtu/tablefy/forms";

// Simple repeater
Repeater.make<T>("phone_numbers")
  .label("Phone Numbers")
  .fields(
    TextInput.make("number").label("Number").tel(),
    Select.make("type")
      .label("Type")
      .options([
        { value: "mobile", label: "Mobile" },
        { value: "home", label: "Home" },
        { value: "work", label: "Work" },
      ]),
  )
  .minItems(1)
  .maxItems(5)
  .addLabel("Add Phone Number")

// Order line items
Repeater.make<T>("items")
  .label("Order Items")
  .fields(
    TextInput.make("product").label("Product").required(),
    TextInput.make("quantity").label("Qty").number(),
    TextInput.make("price").label("Price").number().prefix("$"),
  )
  .minItems(1)
  .maxItems(20)
  .orderable()
  .addLabel("Add Item")
```

The field value is an array of objects, e.g., `[{ number: "...", type: "mobile" }, ...]`.

| Method | Description |
|---|---|
| `fields(...builders)` | Define the fields for each repeated item |
| `minItems(n)` | Minimum number of items (default: 0) |
| `maxItems(n)` | Maximum number of items (default: Infinity) |
| `addLabel(text)` | Label for the "Add" button (default: "Add item") |
| `collapsible()` | Make items collapsible |
| `orderable()` | Allow drag-to-reorder items |

---

### Hidden

Hidden input field for passing values that shouldn't be visible.

```tsx
import { Hidden } from "@nccirtu/tablefy/forms";

Hidden.make<T>("id").default(userId)
Hidden.make<T>("type").default("user")
```

No methods beyond the [shared field methods](#shared-field-methods).

---

## Shared Field Methods

All field types inherit these methods from `BaseField`:

| Method | Type | Description |
|---|---|---|
| `label(text)` | `string` | Field label displayed above the input |
| `placeholder(text)` | `string` | Placeholder text inside the input |
| `helperText(text)` | `string` | Help text displayed below the field |
| `required()` | `boolean` | Mark field as required (adds validation rule) |
| `disabled(d)` | `boolean \| (data) => boolean` | Disable the field, can be conditional |
| `readOnly()` | `boolean` | Make the field read-only |
| `hidden(h)` | `boolean \| (data) => boolean` | Hide the field, can be conditional |
| `default(value)` | `any` | Set default value |
| `columnSpan(n)` | `number` | Span across n grid columns |
| `className(cls)` | `string` | Add custom CSS class |
| `rules(rules)` | `ValidationRule[]` | Add validation rules |
| `zodSchema(schema)` | `ZodSchema` | Attach a Zod schema for validation |
| `dependsOn(field, condition, effect)` | — | Define field dependencies |
| `reactive()` | `boolean` | Mark field as reactive |

---

## Layout

### Grid Columns

Control how fields are arranged in a grid:

```tsx
FormSchema.make<T>()
  .columns(2)  // 2-column grid
  .fields(
    TextInput.make("first_name").label("First Name"),   // col 1
    TextInput.make("last_name").label("Last Name"),     // col 2
    Textarea.make("bio").label("Bio").columnSpan(2),    // spans both columns
  )
  .build();
```

`columnSpan()` lets individual fields span multiple columns within the grid.

---

### Sections

Group fields into collapsible card sections:

```tsx
import { FormSchema, TextInput, SectionBuilder } from "@nccirtu/tablefy/forms";
import { User, MapPin } from "lucide-react";

const schema = FormSchema.make<T>()
  .fields(
    TextInput.make("name").label("Name").required(),
    TextInput.make("email").label("Email").email().required(),
    TextInput.make("phone").label("Phone").tel(),
    TextInput.make("street").label("Street"),
    TextInput.make("city").label("City"),
    TextInput.make("zip").label("ZIP Code"),
  )
  .sections(
    SectionBuilder.make<T>("Personal Information")
      .description("Your basic info")
      .icon(<User className="h-5 w-5" />)
      .fields(["name", "email", "phone"])
      .columns(2),

    SectionBuilder.make<T>("Address")
      .icon(<MapPin className="h-5 w-5" />)
      .fields(["street", "city", "zip"])
      .columns(3)
      .collapsible()
      .collapsed(),  // starts collapsed
  )
  .actions((a) => a.submit({ label: "Save" }))
  .build();
```

**SectionBuilder methods:**

| Method | Description |
|---|---|
| `id(id)` | Custom section ID (auto-generated from title) |
| `description(text)` | Section description shown below title |
| `icon(element)` | React element shown next to title |
| `fields(names)` | Array of field names in this section |
| `columns(n)` | Grid columns within this section |
| `collapsible()` | Make section collapsible |
| `collapsed()` | Start section collapsed (implies collapsible) |
| `hidden(fn)` | `(data) => boolean` - conditionally hide section |

---

### Tabs

Organize fields into tabs:

```tsx
import { FormSchema, TextInput, Select, TabBuilder } from "@nccirtu/tablefy/forms";
import { User, Settings, Bell } from "lucide-react";

const schema = FormSchema.make<T>()
  .fields(
    TextInput.make("name").label("Name"),
    TextInput.make("email").label("Email"),
    Select.make("language").label("Language").options([/* ... */]),
    Select.make("timezone").label("Timezone").options([/* ... */]),
    Toggle.make("email_notifications").label("Email Notifications"),
    Toggle.make("push_notifications").label("Push Notifications"),
  )
  .tabs(
    TabBuilder.make<T>("Profile")
      .icon(<User className="h-4 w-4" />)
      .fields(["name", "email"]),

    TabBuilder.make<T>("Settings")
      .icon(<Settings className="h-4 w-4" />)
      .fields(["language", "timezone"]),

    TabBuilder.make<T>("Notifications")
      .icon(<Bell className="h-4 w-4" />)
      .fields(["email_notifications", "push_notifications"])
      .badge(3),  // show badge count
  )
  .actions((a) => a.submit({ label: "Save Changes" }))
  .build();
```

**TabBuilder methods:**

| Method | Description |
|---|---|
| `id(id)` | Custom tab ID (auto-generated from label) |
| `icon(element)` | Icon element shown in tab |
| `fields(names)` | Array of field names in this tab |
| `sections(...builders)` | Nest sections within this tab |
| `badge(value)` | `string \| number \| (data) => string \| number` |
| `disabled(fn)` | `(data) => boolean` - conditionally disable tab |

Tabs can contain nested sections:

```tsx
TabBuilder.make<T>("Profile")
  .sections(
    SectionBuilder.make<T>("Basic").fields(["name", "email"]).columns(2),
    SectionBuilder.make<T>("Bio").fields(["bio"]),
  )
```

---

### Wizard (Multi-Step)

Create multi-step forms with step validation:

```tsx
import { FormSchema, TextInput, WizardStep } from "@nccirtu/tablefy/forms";

const schema = FormSchema.make<CreateUser>()
  .fields(
    TextInput.make("email").label("Email").email().required(),
    TextInput.make("password").label("Password").password().minLength(8).required(),
    TextInput.make("name").label("Full Name").required(),
    TextInput.make("company").label("Company"),
    TextInput.make("phone").label("Phone").tel(),
  )
  .wizard(
    WizardStep.make<CreateUser>("Account")
      .description("Set up your account credentials")
      .fields(["email", "password"])
      .canProceed((data) => !!data.email && !!data.password),

    WizardStep.make<CreateUser>("Profile")
      .description("Tell us about yourself")
      .fields(["name", "company"])
      .canProceed((data) => !!data.name)
      .beforeNext(async (data) => {
        // Validate on server before proceeding
        const res = await fetch("/api/validate-profile", {
          method: "POST",
          body: JSON.stringify({ name: data.name }),
        });
        return res.ok;
      }),

    WizardStep.make<CreateUser>("Contact")
      .description("How can we reach you?")
      .fields(["phone"]),
  )
  .build();
```

The wizard renders step indicators (numbered circles), Previous/Next navigation buttons, and a Submit button on the last step. The submit button on the last step triggers `onSubmit`.

**WizardStep methods:**

| Method | Description |
|---|---|
| `id(id)` | Custom step ID (auto-generated from label) |
| `description(text)` | Step description |
| `icon(element)` | Step icon |
| `fields(names)` | Array of field names in this step |
| `sections(...builders)` | Nest sections within this step |
| `canProceed(fn)` | `(data) => boolean` - gates the "Next" button |
| `beforeNext(fn)` | `(data) => Promise<boolean> \| boolean` - async validation before proceeding |

---

## Actions

Define form action buttons using the `ActionsBuilder`:

```tsx
FormSchema.make<T>()
  .fields(/* ... */)
  .actions((a) =>
    a
      .submit({ label: "Save", variant: "default" })
      .cancel({ label: "Cancel", href: "/users" })
      .custom({
        label: "Save as Draft",
        variant: "secondary",
        onClick: () => saveDraft(),
      })
  )
  .actionsPosition("between")  // "start" | "end" | "between" | "center"
  .build();
```

**Action types:**

| Method | Props | Description |
|---|---|---|
| `submit(opts)` | `label`, `variant`, `icon`, `disabled` | Submit button (`<button type="submit">`) |
| `cancel(opts)` | `label`, `variant`, `href`, `icon` | Cancel button, optionally with href |
| `custom(opts)` | `label`, `variant`, `onClick`, `icon`, `disabled` | Custom action button |

**`disabled` on actions** can be a boolean or a function `(data, processing) => boolean`.

Cancel buttons with `href` render as links using `<a>`. Cancel buttons without `href` render as regular buttons.

---

## Field Dependencies

Make fields react to other field values using `dependsOn()`:

```tsx
// Show field only when condition is met
Select.make<T>("state")
  .label("State")
  .options([/* ... */])
  .dependsOn("country", (value) => value === "us", "show")

// Hide field when condition is met
TextInput.make<T>("other_reason")
  .label("Other Reason")
  .dependsOn("reason", (value) => value !== "other", "hide")

// Enable/disable based on another field
TextInput.make<T>("custom_domain")
  .label("Custom Domain")
  .dependsOn("plan", (value) => value === "pro" || value === "enterprise", "enable")

// Disable when condition is true
TextInput.make<T>("billing_email")
  .label("Billing Email")
  .dependsOn("same_as_contact", (value) => value === true, "disable")
```

**Dependency effects:**

| Effect | Description |
|---|---|
| `"show"` | Show field when condition is true, hide when false |
| `"hide"` | Hide field when condition is true, show when false |
| `"enable"` | Enable field when condition is true, disable when false |
| `"disable"` | Disable field when condition is true, enable when false |

Multiple dependencies can be chained:

```tsx
TextInput.make<T>("shipping_address")
  .label("Shipping Address")
  .dependsOn("needs_shipping", (v) => v === true, "show")
  .dependsOn("use_billing_address", (v) => v === true, "disable")
```

---

## FormRenderer Component

The `FormRenderer` component renders a built form schema.

```tsx
import { FormRenderer } from "@nccirtu/tablefy/forms";

<FormRenderer
  schema={schema}          // FormBuildResult from .build()
  data={data}              // Current form values
  errors={errors}          // Validation errors { fieldName: "message" }
  onChange={onChange}       // (field, value) => void
  onSubmit={onSubmit}      // () => void
  processing={false}       // Shows "Processing..." on submit button
  disabled={false}         // Disables all fields globally
  className="max-w-2xl"    // Additional CSS class on the form
  onBlur={handleBlur}      // (fieldName) => void - for precognition
/>
```

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `schema` | `FormBuildResult<TData>` | Yes | Built schema from `FormSchema.build()` |
| `data` | `TData` | Yes | Current form data |
| `errors` | `Partial<Record<keyof TData, string>>` | Yes | Validation errors |
| `onChange` | `(field: keyof TData, value: any) => void` | Yes | Change handler |
| `onSubmit` | `() => void` | Yes | Submit handler |
| `processing` | `boolean` | No | Processing state |
| `disabled` | `boolean` | No | Globally disable all fields |
| `className` | `string` | No | Additional CSS class |
| `onBlur` | `(field: string) => void` | No | Blur handler (for precognition) |

---

## Standalone Usage (without Inertia)

You can use Tablefy Forms without Inertia.js using plain React state:

```tsx
import { useState } from "react";
import { FormSchema, TextInput, Textarea, Select, FormRenderer } from "@nccirtu/tablefy/forms";

type FeedbackForm = {
  name: string;
  email: string;
  type: string;
  message: string;
};

const schema = FormSchema.make<FeedbackForm>()
  .title("Send Feedback")
  .columns(2)
  .bordered()
  .fields(
    TextInput.make<FeedbackForm>("name").label("Name").required(),
    TextInput.make<FeedbackForm>("email").label("Email").email().required(),
    Select.make<FeedbackForm>("type")
      .label("Feedback Type")
      .options([
        { value: "bug", label: "Bug Report" },
        { value: "feature", label: "Feature Request" },
        { value: "other", label: "Other" },
      ])
      .required()
      .columnSpan(2),
    Textarea.make<FeedbackForm>("message")
      .label("Message")
      .rows(5)
      .required()
      .columnSpan(2),
  )
  .actions((a) => a.submit({ label: "Send Feedback" }))
  .build();

export default function FeedbackPage() {
  const [data, setData] = useState<FeedbackForm>({
    name: "",
    email: "",
    type: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FeedbackForm, string>>>({});
  const [processing, setProcessing] = useState(false);

  const handleChange = (field: keyof FeedbackForm, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const { errors } = await res.json();
        setErrors(errors);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <FormRenderer
      schema={schema}
      data={data}
      errors={errors}
      onChange={handleChange}
      onSubmit={handleSubmit}
      processing={processing}
    />
  );
}
```

---

## Full Examples

### User Registration with Wizard

```tsx
import {
  FormSchema,
  TextInput,
  Select,
  Checkbox,
  DatePicker,
  Toggle,
  FileUpload,
  WizardStep,
  FormRenderer,
} from "@nccirtu/tablefy/forms";

type RegisterUser = {
  email: string;
  password: string;
  password_confirmation: string;
  name: string;
  avatar: File | null;
  birthday: string;
  role: string;
  newsletter: boolean;
  agree_terms: boolean;
};

const schema = FormSchema.make<RegisterUser>()
  .title("Create Account")
  .fields(
    TextInput.make("email").label("Email").email().required(),
    TextInput.make("password").label("Password").password().minLength(8).required(),
    TextInput.make("password_confirmation").label("Confirm Password").password().required(),
    TextInput.make("name").label("Full Name").required(),
    FileUpload.make("avatar").label("Profile Photo").image().maxSize(2 * 1024 * 1024),
    DatePicker.make("birthday").label("Date of Birth").maxDate(new Date()),
    Select.make("role")
      .label("I am a...")
      .options([
        { value: "developer", label: "Developer" },
        { value: "designer", label: "Designer" },
        { value: "manager", label: "Manager" },
        { value: "other", label: "Other" },
      ]),
    Toggle.make("newsletter").label("Newsletter").onLabel("Subscribed").offLabel("Not subscribed"),
    Checkbox.make("agree_terms").label("I agree to the Terms of Service").required(),
  )
  .wizard(
    WizardStep.make<RegisterUser>("Account")
      .description("Set up your login credentials")
      .fields(["email", "password", "password_confirmation"])
      .canProceed((d) => !!d.email && !!d.password && d.password === d.password_confirmation),

    WizardStep.make<RegisterUser>("Profile")
      .description("Tell us about yourself")
      .fields(["name", "avatar", "birthday", "role"])
      .canProceed((d) => !!d.name),

    WizardStep.make<RegisterUser>("Preferences")
      .description("Final settings")
      .fields(["newsletter", "agree_terms"]),
  )
  .build();
```

### Settings Page with Tabs and Sections

```tsx
import {
  FormSchema,
  TextInput,
  Textarea,
  Select,
  Toggle,
  TabBuilder,
  SectionBuilder,
  FormRenderer,
} from "@nccirtu/tablefy/forms";
import { User, Bell, Shield } from "lucide-react";

type UserSettings = {
  name: string;
  email: string;
  bio: string;
  language: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  two_factor: boolean;
  current_password: string;
  new_password: string;
};

const schema = FormSchema.make<UserSettings>()
  .title("Account Settings")
  .fields(
    TextInput.make("name").label("Display Name").required(),
    TextInput.make("email").label("Email").email().required(),
    Textarea.make("bio").label("Bio").rows(3).maxLength(300),
    Select.make("language")
      .label("Language")
      .options([
        { value: "en", label: "English" },
        { value: "de", label: "Deutsch" },
        { value: "fr", label: "Francais" },
      ]),
    Select.make("timezone")
      .label("Timezone")
      .options([
        { value: "utc", label: "UTC" },
        { value: "est", label: "Eastern Time" },
        { value: "pst", label: "Pacific Time" },
        { value: "cet", label: "Central European Time" },
      ]),
    Toggle.make("email_notifications").label("Email Notifications").onLabel("On").offLabel("Off"),
    Toggle.make("push_notifications").label("Push Notifications").onLabel("On").offLabel("Off"),
    Toggle.make("marketing_emails").label("Marketing Emails").onLabel("On").offLabel("Off"),
    Toggle.make("two_factor").label("Two-Factor Authentication"),
    TextInput.make("current_password").label("Current Password").password(),
    TextInput.make("new_password").label("New Password").password().minLength(8),
  )
  .tabs(
    TabBuilder.make<UserSettings>("Profile")
      .icon(<User className="h-4 w-4" />)
      .sections(
        SectionBuilder.make<UserSettings>("Personal Info")
          .fields(["name", "email", "bio"])
          .columns(2),
        SectionBuilder.make<UserSettings>("Preferences")
          .fields(["language", "timezone"])
          .columns(2),
      ),

    TabBuilder.make<UserSettings>("Notifications")
      .icon(<Bell className="h-4 w-4" />)
      .fields(["email_notifications", "push_notifications", "marketing_emails"]),

    TabBuilder.make<UserSettings>("Security")
      .icon(<Shield className="h-4 w-4" />)
      .sections(
        SectionBuilder.make<UserSettings>("Two-Factor")
          .fields(["two_factor"]),
        SectionBuilder.make<UserSettings>("Change Password")
          .fields(["current_password", "new_password"])
          .columns(2),
      ),
  )
  .actions((a) => a.submit({ label: "Save Changes" }).cancel({ label: "Discard" }))
  .build();
```

### E-Commerce Product Form with Dependencies

```tsx
import {
  FormSchema,
  TextInput,
  Textarea,
  Select,
  Toggle,
  FileUpload,
  Repeater,
  SectionBuilder,
  FormRenderer,
} from "@nccirtu/tablefy/forms";

type Product = {
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_price: string;
  sku: string;
  category: string;
  images: File[];
  is_digital: boolean;
  download_url: string;
  weight: string;
  has_variants: boolean;
  variants: Array<{ name: string; sku: string; price: string }>;
};

const schema = FormSchema.make<Product>()
  .title("Create Product")
  .fields(
    TextInput.make("name").label("Product Name").required().placeholder("e.g., Awesome T-Shirt"),
    TextInput.make("slug").label("URL Slug").placeholder("awesome-t-shirt"),
    Textarea.make("description").label("Description").rows(4),
    TextInput.make("price").label("Price").number().prefix("$").required(),
    TextInput.make("compare_price").label("Compare at Price").number().prefix("$"),
    TextInput.make("sku").label("SKU").placeholder("e.g., SKU-001"),
    Select.make("category")
      .label("Category")
      .options([
        { value: "clothing", label: "Clothing" },
        { value: "electronics", label: "Electronics" },
        { value: "books", label: "Books" },
        { value: "digital", label: "Digital Products" },
      ])
      .required(),
    FileUpload.make("images")
      .label("Product Images")
      .image()
      .multiple()
      .maxFiles(8)
      .maxSize(5 * 1024 * 1024),
    Toggle.make("is_digital").label("Digital Product").onLabel("Digital").offLabel("Physical"),

    // Only shown for digital products
    TextInput.make("download_url")
      .label("Download URL")
      .url()
      .dependsOn("is_digital", (v) => v === true, "show"),

    // Only shown for physical products
    TextInput.make("weight")
      .label("Weight (kg)")
      .number()
      .dependsOn("is_digital", (v) => v === true, "hide"),

    Toggle.make("has_variants").label("Has Variants"),

    // Only shown when has_variants is true
    Repeater.make("variants")
      .label("Variants")
      .fields(
        TextInput.make("name").label("Variant Name").required(),
        TextInput.make("sku").label("Variant SKU"),
        TextInput.make("price").label("Price").number().prefix("$"),
      )
      .minItems(1)
      .maxItems(10)
      .addLabel("Add Variant")
      .dependsOn("has_variants", (v) => v === true, "show"),
  )
  .sections(
    SectionBuilder.make<Product>("Basic Information")
      .fields(["name", "slug", "description", "category"])
      .columns(2),
    SectionBuilder.make<Product>("Pricing")
      .fields(["price", "compare_price", "sku"])
      .columns(3),
    SectionBuilder.make<Product>("Media")
      .fields(["images"]),
    SectionBuilder.make<Product>("Shipping & Delivery")
      .fields(["is_digital", "download_url", "weight"])
      .collapsible(),
    SectionBuilder.make<Product>("Variants")
      .fields(["has_variants", "variants"])
      .collapsible(),
  )
  .actions((a) =>
    a
      .submit({ label: "Create Product" })
      .cancel({ label: "Cancel", href: "/products" })
  )
  .build();
```

---

## Next Steps

- [Inertia Integration](./INERTIA.md) - Use forms with Laravel + Inertia.js
- [Data Tables](./USAGE.md) - Build schema-driven data tables
- [Installation](./INSTALLATION.md) - Setup guide
