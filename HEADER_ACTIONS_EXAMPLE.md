# Header Actions - Neue Fluent API

## Übersicht

Die neue `HeaderActions` Klasse bietet eine fluent API ähnlich wie `ActionsColumn`, um Header Actions zu erstellen.

## Verwendung

### Einzelne Action

```tsx
import { HeaderActions, HeaderActionGroup } from '@nccirtu/tablefy';

// Einzelne Action
const action = HeaderActions.make<MyData>()
  .label('Neue Reklamation')
  .icon(<Plus />)
  .variant('default')
  .action({
    render: () => (
      <CreateReclamationDialog
        companySlug={companySlug}
        facilities={facilities}
      />
    ),
  })
  .build();

// In der Komponente rendern
<HeaderActionGroup actions={action} />
```

### Mehrere Actions in einer Gruppe

```tsx
const actions = [
  HeaderActions.make<PortalReclamation>()
    .label('Neue Reklamation')
    .action({
      render: () => (
        <CreateReclamationDialog
          companySlug={options.companySlug}
          facilities={options.facilities}
          rooms={options.rooms}
          reclamationCategories={options.reclamationCategories}
        />
      ),
    })
    .build(),
  
  HeaderActions.make<PortalReclamation>()
    .label('Exportieren')
    .icon(<Download />)
    .variant('outline')
    .action({
      onClick: () => exportData(),
    })
    .build(),
];

// Flatten das Array
const flatActions = actions.flat();

// In der Komponente rendern
<HeaderActionGroup 
  actions={flatActions} 
  label="Aktionen"
  variant="outline"
/>
```

### Mit Bulk Actions

```tsx
const bulkAction = HeaderActions.make<User>()
  .label('Ausgewählte löschen')
  .icon(<Trash />)
  .variant('destructive')
  .action({
    bulk: true,
    bulkOnClick: (selectedRows) => {
      console.log('Deleting:', selectedRows);
    },
  })
  .build();

<HeaderActionGroup 
  actions={bulkAction}
  selectedRows={table.getSelectedRowModel().rows.map(r => r.original)}
/>
```

### Shortcut Methoden

```tsx
// Create Action
HeaderActions.make<MyData>()
  .create({
    label: 'Neu erstellen',
    icon: <Plus />,
    onClick: () => openDialog(),
  })
  .build();

// Export Action
HeaderActions.make<MyData>()
  .export({
    label: 'Exportieren',
    icon: <Download />,
    onClick: () => exportData(),
  })
  .build();

// Bulk Delete
HeaderActions.make<MyData>()
  .bulkDelete({
    label: 'Löschen',
    icon: <Trash />,
    onDelete: (rows) => deleteRows(rows),
  })
  .build();
```

## API Referenz

### HeaderActions Methoden

- `make<TData>()` - Erstellt eine neue Instanz
- `label(label: string)` - Setzt das Label
- `icon(icon: ReactNode)` - Setzt das Icon
- `variant(variant)` - Setzt die Button-Variante
- `size(size)` - Setzt die Button-Größe
- `disabled(disabled)` - Deaktiviert die Action
- `hidden(hidden)` - Versteckt die Action
- `action(action)` - Fügt eine Action hinzu
- `onClick(handler)` - Setzt den Click-Handler
- `href(url)` - Setzt einen Link
- `bulk(handler)` - Macht die Action zu einer Bulk-Action
- `build()` - Gibt die Actions zurück

### HeaderActionGroup Props

```tsx
interface HeaderActionGroupProps<TData> {
  actions: HeaderActionItem<TData>[];
  selectedRows?: TData[];
  label?: string;
  icon?: ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
}
```

## Unterschied zur alten API

### Alt (mit TableSchema)

```tsx
TableSchema.make<MyData>()
  .headerActions((b) =>
    b
      .create({
        label: 'Neu',
        onClick: () => {},
      })
      .export({
        label: 'Export',
        onClick: () => {},
      })
  )
```

### Neu (mit HeaderActions)

```tsx
const actions = [
  HeaderActions.make<MyData>()
    .create({
      label: 'Neu',
      onClick: () => {},
    })
    .build(),
  HeaderActions.make<MyData>()
    .export({
      label: 'Export',
      onClick: () => {},
    })
    .build(),
].flat();

<HeaderActionGroup actions={actions} />
```

## Vorteile

1. **Flexibler**: Jede Action kann individuell konfiguriert werden
2. **Wiederverwendbar**: Actions können als Variablen gespeichert und wiederverwendet werden
3. **Type-Safe**: Vollständige TypeScript-Unterstützung
4. **Custom Render**: Unterstützt `render` für komplexe UI-Komponenten
5. **Gruppierung**: Mehrere Actions werden automatisch in einem Dropdown gruppiert
