# FormSchema - Complete Fields Reference

This document provides a complete reference of all 20 field types available in FormSchema with all their options and attributes.

## Legend
- ✅ = Required
- 🔧 = Field-specific method
- 🔄 = Inherited from BaseField (available on ALL fields)

---

## Base Field Methods (Available on ALL Fields)

Every field inherits these methods from `BaseField`:

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.label(string)` | 🔄 | Optional | Field label text |
| `.placeholder(string)` | 🔄 | Optional | Placeholder text |
| `.helperText(string \| function)` | 🔄 | Optional | Helper text below field |
| `.required(boolean)` | 🔄 | Optional | Mark field as required |
| `.disabled(boolean \| function)` | 🔄 | Optional | Disable field |
| `.readonly(boolean \| function)` | 🔄 | Optional | Make field read-only |
| `.hidden(boolean \| function)` | 🔄 | Optional | Hide field |
| `.default(value)` | 🔄 | Optional | Default value |
| `.columnSpan(number)` | 🔄 | Optional | Grid column span |
| `.rules(string[])` | 🔄 | Optional | Validation rules |
| `.dependsOn(field, condition)` | 🔄 | Optional | Conditional display |

---

## 1. TextInput

**Usage:** `TextInput.make<TData>("fieldName")`

**Value Type:** `string`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.email()` | 🔧 | Optional | Set type to email |
| `.url()` | �� | Optional | Set type to URL |
| `.password()` | 🔧 | Optional | Set type to password |
| `.minLength(number)` | 🔧 | Optional | Minimum length |
| `.maxLength(number)` | 🔧 | Optional | Maximum length |
| `.pattern(string)` | 🔧 | Optional | Regex pattern |
| `.autoComplete(string)` | 🔧 | Optional | Autocomplete attribute |

### Example

```tsx
TextInput.make<Project>("name")
  .label("Project Name")
  .placeholder("Enter name...")
  .required()
  .minLength(3)
  .maxLength(100)
  .helperText("Choose a unique name")
```

---

## 2. Textarea

**Usage:** `Textarea.make<TData>("fieldName")`

**Value Type:** `string`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.rows(number)` | 🔧 | Optional | Number of rows (default: 3) |
| `.minLength(number)` | 🔧 | Optional | Minimum length |
| `.maxLength(number)` | 🔧 | Optional | Maximum length (shows counter) |
| `.noResize()` | 🔧 | Optional | Disable textarea resize |

### Example

```tsx
Textarea.make<Project>("description")
  .label("Description")
  .rows(4)
  .maxLength(500)
  .helperText("Describe your project")
```

---

## 3. Select

**Usage:** `Select.make<TData>("fieldName")`

**Value Type:** `string | number`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.options(SelectOption[])` | 🔧 | ✅ Required | Dropdown options |
| `.searchable()` | 🔧 | Optional | Enable search |
| `.clearable()` | 🔧 | Optional | Allow clearing selection |

### SelectOption Interface

```tsx
interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}
```

### Example

```tsx
Select.make<Project>("priority")
  .label("Priority")
  .options([
    { label: "Low", value: "low" },
    { label: "High", value: "high" },
  ])
  .required()
```

---

## 4. Checkbox

**Usage:** `Checkbox.make<TData>("fieldName")`

**Value Type:** `boolean`

### Methods

No field-specific methods. Uses only base methods.

### Example

```tsx
Checkbox.make<Project>("isPublic")
  .label("Make this project public")
  .helperText("Public projects are visible to everyone")
  .default(false)
```

---

## 5. Toggle

**Usage:** `Toggle.make<TData>("fieldName")`

**Value Type:** `boolean`

### Methods

No field-specific methods. Uses only base methods.

### Example

```tsx
Toggle.make<Project>("notifications")
  .label("Enable notifications")
  .helperText("Receive email updates")
  .default(true)
```

---

## 6. RadioGroup

**Usage:** `RadioGroup.make<TData>("fieldName")`

**Value Type:** `string | number`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.options(RadioOption[])` | 🔧 | ✅ Required | Radio options |
| `.horizontal()` | 🔧 | Optional | Horizontal layout |

### RadioOption Interface

```tsx
interface RadioOption {
  label: string;
  value: string | number;
  description?: string;
  disabled?: boolean;
}
```

### Example

```tsx
RadioGroup.make<Project>("visibility")
  .label("Visibility")
  .options([
    { label: "Public", value: "public", description: "Everyone can see" },
    { label: "Private", value: "private", description: "Only you" },
  ])
  .horizontal()
```

---

## 7. NumberInput

**Usage:** `NumberInput.make<TData>("fieldName")`

**Value Type:** `number`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.min(number)` | 🔧 | Optional | Minimum value |
| `.max(number)` | 🔧 | Optional | Maximum value |
| `.step(number)` | �� | Optional | Step increment (default: 1) |
| `.showControls()` | 🔧 | Optional | Show +/- buttons |
| `.prefix(string)` | 🔧 | Optional | Prefix text (e.g., "$") |
| `.suffix(string)` | 🔧 | Optional | Suffix text (e.g., "kg") |

### Example

```tsx
NumberInput.make<Project>("budget")
  .label("Budget")
  .min(0)
  .max(1000000)
  .step(100)
  .prefix("$")
  .showControls()
```

---

## 8. DatePicker

**Usage:** `DatePicker.make<TData>("fieldName")`

**Value Type:** `Date | string`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.minDate(Date)` | 🔧 | Optional | Minimum selectable date |
| `.maxDate(Date)` | 🔧 | Optional | Maximum selectable date |
| `.disabledDates(Date[])` | 🔧 | Optional | Array of disabled dates |
| `.format(string)` | 🔧 | Optional | Date format string (default: "PPP") |

### Example

```tsx
DatePicker.make<Project>("deadline")
  .label("Deadline")
  .minDate(new Date())
  .format("dd/MM/yyyy")
  .required()
```

---

## 9. MultiSelect

**Usage:** `MultiSelect.make<TData>("fieldName")`

**Value Type:** `(string | number)[]`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.options(MultiSelectOption[])` | 🔧 | ✅ Required | Selection options |
| `.searchable(boolean)` | 🔧 | Optional | Enable search (default: true) |
| `.maxItems(number)` | 🔧 | Optional | Maximum selections |

### MultiSelectOption Interface

```tsx
interface MultiSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}
```

### Example

```tsx
MultiSelect.make<Project>("tags")
  .label("Tags")
  .options([
    { label: "Frontend", value: "frontend" },
    { label: "Backend", value: "backend" },
  ])
  .maxItems(5)
  .searchable()
```

---

## 10. Slider

**Usage:** `Slider.make<TData>("fieldName")`

**Value Type:** `number`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.min(number)` | 🔧 | Optional | Minimum value (default: 0) |
| `.max(number)` | 🔧 | Optional | Maximum value (default: 100) |
| `.step(number)` | 🔧 | Optional | Step increment (default: 1) |
| `.showValue(boolean)` | 🔧 | Optional | Show value (default: true) |
| `.formatValue(function)` | 🔧 | Optional | Custom value formatter |

### Example

```tsx
Slider.make<Project>("progress")
  .label("Progress")
  .min(0)
  .max(100)
  .step(5)
  .formatValue((val) => `${val}%`)
```

---

## 11. FileUpload

**Usage:** `FileUpload.make<TData>("fieldName")`

**Value Type:** `File | File[]`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.accept(string)` | 🔧 | Optional | Accepted file types |
| `.maxSize(number)` | 🔧 | Optional | Max file size in bytes |
| `.maxFiles(number)` | 🔧 | Optional | Max number of files |
| `.multiple()` | 🔧 | Optional | Allow multiple files |
| `.hidePreview()` | 🔧 | Optional | Hide file preview |

### Example

```tsx
FileUpload.make<Project>("documents")
  .label("Documents")
  .accept(".pdf,.doc,.docx")
  .maxSize(5 * 1024 * 1024) // 5MB
  .maxFiles(3)
  .multiple()
```

---

## 12. ColorPicker

**Usage:** `ColorPicker.make<TData>("fieldName")`

**Value Type:** `string`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.presetColors(string[])` | 🔧 | Optional | Array of preset colors |
| `.hideInput()` | 🔧 | Optional | Hide custom input |
| `.format(string)` | 🔧 | Optional | Color format: "hex", "rgb", "hsl" |

### Example

```tsx
ColorPicker.make<Project>("brandColor")
  .label("Brand Color")
  .presetColors(["#ff0000", "#00ff00", "#0000ff"])
  .format("hex")
```

---

## 13. Hidden

**Usage:** `Hidden.make<TData, TValue>("fieldName")`

**Value Type:** `any`

### Methods

No field-specific methods. Uses only base methods.

### Example

```tsx
Hidden.make<Project, string>("userId")
  .default(currentUser.id)
```

---

## 14. TagsInput

**Usage:** `TagsInput.make<TData>("fieldName")`

**Value Type:** `string[]`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.maxTags(number)` | 🔧 | Optional | Maximum number of tags |
| `.allowDuplicates()` | �� | Optional | Allow duplicate tags |
| `.separator(string)` | 🔧 | Optional | Tag separator (default: ",") |
| `.suggestions(string[])` | 🔧 | Optional | Suggested tags |

### Example

```tsx
TagsInput.make<Project>("keywords")
  .label("Keywords")
  .maxTags(10)
  .suggestions(["react", "typescript", "nodejs"])
  .helperText("Press Enter to add")
```

---

## 15. Combobox

**Usage:** `Combobox.make<TData>("fieldName")`

**Value Type:** `string | number`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.options(ComboboxOption[])` | 🔧 | ✅ Required | Combobox options |
| `.searchPlaceholder(string)` | 🔧 | Optional | Search placeholder |
| `.emptyText(string)` | 🔧 | Optional | Empty state text |
| `.allowCustom()` | 🔧 | Optional | Allow custom values |

### ComboboxOption Interface

```tsx
interface ComboboxOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}
```

### Example

```tsx
Combobox.make<Project>("framework")
  .label("Framework")
  .options([
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
  ])
  .allowCustom()
  .searchPlaceholder("Search frameworks...")
```

---

## 16. ImageUpload

**Usage:** `ImageUpload.make<TData>("fieldName")`

**Value Type:** `File | File[] | string | string[]`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.maxSize(number)` | 🔧 | Optional | Max file size in bytes |
| `.maxImages(number)` | 🔧 | Optional | Max number of images |
| `.multiple()` | 🔧 | Optional | Allow multiple images |
| `.aspectRatio(string)` | 🔧 | Optional | Preview aspect ratio (e.g., "16/9") |
| `.hidePreview()` | 🔧 | Optional | Hide image preview |

### Example

```tsx
ImageUpload.make<Project>("screenshots")
  .label("Screenshots")
  .maxSize(2 * 1024 * 1024) // 2MB
  .maxImages(5)
  .aspectRatio("16/9")
  .multiple()
```

---

## 17. CheckboxGroup

**Usage:** `CheckboxGroup.make<TData>("fieldName")`

**Value Type:** `(string | number)[]`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.options(CheckboxGroupOption[])` | 🔧 | ✅ Required | Checkbox options |
| `.horizontal()` | 🔧 | Optional | Horizontal layout |
| `.columns(number)` | �� | Optional | Grid columns |

### CheckboxGroupOption Interface

```tsx
interface CheckboxGroupOption {
  label: string;
  value: string | number;
  description?: string;
  disabled?: boolean;
}
```

### Example

```tsx
CheckboxGroup.make<Project>("features")
  .label("Features")
  .options([
    { label: "API", value: "api", description: "REST API" },
    { label: "Auth", value: "auth", description: "Authentication" },
  ])
  .columns(2)
```

---

## 18. TimePicker

**Usage:** `TimePicker.make<TData>("fieldName")`

**Value Type:** `string`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.format12h()` | 🔧 | Optional | Use 12-hour format |
| `.step(number)` | 🔧 | Optional | Minutes step (default: 15) |

### Example

```tsx
TimePicker.make<Project>("meetingTime")
  .label("Meeting Time")
  .format12h()
  .step(30)
```

---

## 19. DateRangePicker

**Usage:** `DateRangePicker.make<TData>("fieldName")`

**Value Type:** `{ from: Date | undefined; to: Date | undefined }`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.minDate(Date)` | 🔧 | Optional | Minimum selectable date |
| `.maxDate(Date)` | 🔧 | Optional | Maximum selectable date |
| `.format(string)` | 🔧 | Optional | Date format string |

### Example

```tsx
DateRangePicker.make<Project>("duration")
  .label("Project Duration")
  .minDate(new Date())
  .format("dd/MM/yyyy")
```

---

## 20. Rating

**Usage:** `Rating.make<TData>("fieldName")`

**Value Type:** `number`

### Methods

| Method | Type | Required | Description |
|--------|------|----------|-------------|
| `.max(number)` | 🔧 | Optional | Maximum rating (default: 5) |
| `.allowHalf()` | 🔧 | Optional | Allow half stars |
| `.hideValue()` | 🔧 | Optional | Hide value display |

### Example

```tsx
Rating.make<Project>("satisfaction")
  .label("Satisfaction")
  .max(5)
  .allowHalf()
```

---

## Complete Example with All Field Types

```tsx
const completeForm = FormSchema.make<FormData>()
  .title("Complete Form Example")
  .description("Showcasing all 20 field types")
  
  .fields(
    // Text Inputs
    TextInput.make("name").label("Name").required(),
    TextInput.make("email").label("Email").email().required(),
    Textarea.make("bio").label("Bio").rows(4).maxLength(500),
    NumberInput.make("age").label("Age").min(18).max(100),
    
    // Selection
    Select.make("country").label("Country").options([...]).required(),
    MultiSelect.make("skills").label("Skills").options([...]).maxItems(5),
    Combobox.make("city").label("City").options([...]).allowCustom(),
    RadioGroup.make("gender").label("Gender").options([...]),
    CheckboxGroup.make("interests").label("Interests").options([...]),
    
    // Boolean
    Checkbox.make("terms").label("Accept Terms").required(),
    Toggle.make("newsletter").label("Subscribe").default(true),
    
    // Dates & Time
    DatePicker.make("birthdate").label("Birthdate").required(),
    DateRangePicker.make("vacation").label("Vacation Dates"),
    TimePicker.make("preferredTime").label("Preferred Time").format12h(),
    
    // Files & Media
    FileUpload.make("resume").label("Resume").accept(".pdf").maxSize(5*1024*1024),
    ImageUpload.make("avatar").label("Avatar").maxSize(2*1024*1024),
    
    // Special
    Slider.make("experience").label("Experience").min(0).max(10),
    ColorPicker.make("favoriteColor").label("Favorite Color"),
    TagsInput.make("tags").label("Tags").maxTags(10),
    Rating.make("rating").label("Rating").max(5),
    
    // Hidden
    Hidden.make("userId").default(currentUser.id)
  )
  
  .sections(
    SectionBuilder.make("Personal Info").fields(["name", "email", "bio"]),
    SectionBuilder.make("Preferences").fields(["country", "city", "interests"])
  )
  
  .actions(builder => 
    builder.submit({ label: "Submit" }).cancel({ label: "Cancel" })
  );
```

---

## Tips & Best Practices

1. **Always use `.label()`** - Makes forms more accessible
2. **Use `.required()` with `.helperText()`** - Guide users
3. **Set reasonable `.maxLength()`** - Prevent data issues
4. **Use `.dependsOn()`** - For conditional fields
5. **Group related fields** - Use sections for organization
6. **Provide `.default()` values** - Better UX
7. **Use appropriate field types** - Don't use TextInput for everything
8. **Add validation `.rules()`** - Client-side validation
9. **Use `.disabled()` functions** - For dynamic states
10. **Test with real data** - Ensure all fields work as expected
