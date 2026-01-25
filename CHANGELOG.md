# Changelog

All notable changes to this project will be documented in this file.

## [0.7.0] - 2026-01-26

### Added

#### Custom Render Functions for ActionsColumn

- **`render` function** in `ActionItem` - Create complex UI elements directly in actions dropdown
- Supports Dialog triggers, forms, custom layouts, and any React component
- Full React hooks support within render functions
- `label` is now optional when using `render`

```tsx
ActionsColumn.make<Project>().action({
  render: (project) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <ProjectForm project={project} />
      </DialogContent>
    </Dialog>
  ),
});
```

#### Confirm Helper System

- **`ConfirmProvider`** - Provider component for confirmation dialogs
- **`confirm(options)`** - Promise-based confirmation API
- Built-in modal UI with customizable title, description, and buttons
- Support for destructive and default variants
- Queue system for multiple confirmation requests

```tsx
// Setup
<ConfirmProvider>
  <App />
</ConfirmProvider>;

// Usage
const confirmed = await confirm({
  title: "Delete Project?",
  description: "This action cannot be undone.",
  variant: "destructive",
});
```

#### New Exports

- `ActionItem` type export for custom action definitions
- `ConfirmProvider` component export
- `confirm` function export
- `ConfirmOptions` type export

### Changed

- `ActionItem.label` is now optional (was required)
- Actions with `render` function take priority over standard menu items

### Documentation

- Added comprehensive [Actions Column Guide](./docs/ACTIONS_COLUMN.md)
- Updated README with new features
- Added migration guide for v0.6.x users

### Backwards Compatibility

✅ **Fully backwards compatible** - All existing code continues to work without changes. New features are opt-in.

---

## [0.6.6] - 2026-01-25

### Fixed

- **InputColumn** - Added local state management for proper typing functionality
- **SelectColumn** - Added local state management for proper value updates
- Both columns now sync local state with table data via useEffect

---

## [0.6.5] - 2026-01-25

### Changed

- **InputColumn** - Refactored to use Builder Pattern with BaseColumn
- **SelectColumn** - Refactored to use Builder Pattern with BaseColumn
- Consistent API across all column types
- Type-safe callbacks with generics

### Added

- New methods for InputColumn: `.onSave()`, `.onChange()`, `.email()`, `.number()`, `.password()`, `.url()`
- New methods for SelectColumn: `.onValueChange()`, `.options()`, `.disabled()`
- Comprehensive documentation in `docs/EDITABLE_COLUMNS.md`

---

## [0.6.3] - Earlier

### Added

- Initial release with core table functionality
- 12+ specialized column types
- Search and filtering
- Sorting and pagination
- Empty states
- Type-safe API
