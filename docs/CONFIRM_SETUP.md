# ConfirmProvider Setup Guide

## Problem: Browser Confirmation statt shadcn Dialog

Wenn du den Browser-Standard-Confirmation-Dialog siehst statt des schönen shadcn Dialogs, liegt das daran, dass der `ConfirmProvider` noch nicht eingebunden ist.

## Lösung: ConfirmProvider einbinden

### 1. Provider in deiner App einbinden

**Für Laravel/Inertia:**

Öffne deine Root-Layout-Komponente (z.B. `resources/js/Layouts/AppLayout.tsx` oder `resources/js/app.tsx`):

```tsx
import { ConfirmProvider } from "@nccirtu/tablefy";

export default function AppLayout({ children }) {
  return (
    <ConfirmProvider>
      {/* Deine App */}
      {children}
    </ConfirmProvider>
  );
}
```

**Für Next.js:**

In `app/layout.tsx` oder `pages/_app.tsx`:

```tsx
import { ConfirmProvider } from "@nccirtu/tablefy";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ConfirmProvider>{children}</ConfirmProvider>
      </body>
    </html>
  );
}
```

### 2. confirm() in Actions verwenden

```tsx
import { ActionsColumn, confirm } from "@nccirtu/tablefy";

const columns = [
  ActionsColumn.make<Project>()
    .action({
      label: "Löschen",
      variant: "destructive",
      onClick: async (project) => {
        const confirmed = await confirm({
          title: "Projekt löschen?",
          description: `Möchtest du "${project.name}" wirklich löschen?`,
          confirmLabel: "Ja, löschen",
          cancelLabel: "Abbrechen",
          variant: "destructive",
        });

        if (confirmed) {
          // Lösch-Logik hier
          router.delete(`/projects/${project.id}`);
        }
      },
    })
    .build(),
];
```

## Vollständiges Laravel/Inertia Beispiel

### 1. App Layout (`resources/js/Layouts/AppLayout.tsx`)

```tsx
import { Head } from "@inertiajs/react";
import { ConfirmProvider } from "@nccirtu/tablefy";
import { Toaster } from "@/components/ui/toaster";

export default function AppLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <>
      <Head title={title} />
      <ConfirmProvider>
        <div className="min-h-screen bg-background">
          <nav>{/* Deine Navigation */}</nav>
          <main className="container mx-auto py-6">{children}</main>
        </div>
        <Toaster />
      </ConfirmProvider>
    </>
  );
}
```

### 2. Projects Page (`resources/js/Pages/Projects/Index.tsx`)

```tsx
import {
  DataTable,
  ActionsColumn,
  confirm,
  TextColumn,
} from "@nccirtu/tablefy";
import { router } from "@inertiajs/react";
import { toast } from "@/hooks/use-toast";
import AppLayout from "@/Layouts/AppLayout";

interface Project {
  id: number;
  name: string;
  status: string;
}

export default function ProjectsIndex({ projects }: { projects: Project[] }) {
  const columns = [
    TextColumn.make<Project>("name").label("Name").sortable(),
    TextColumn.make<Project>("status").label("Status"),

    ActionsColumn.make<Project>()
      .action({
        label: "Bearbeiten",
        onClick: (project) => router.visit(`/projects/${project.id}/edit`),
      })
      .action({
        label: "Löschen",
        variant: "destructive",
        separator: true,
        onClick: async (project) => {
          const confirmed = await confirm({
            title: "Projekt löschen?",
            description: `Möchtest du das Projekt "${project.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
            confirmLabel: "Ja, löschen",
            cancelLabel: "Abbrechen",
            variant: "destructive",
          });

          if (confirmed) {
            router.delete(`/projects/${project.id}`, {
              onSuccess: () => {
                toast({
                  title: "Projekt gelöscht",
                  description: `${project.name} wurde erfolgreich gelöscht.`,
                });
              },
              onError: () => {
                toast({
                  title: "Fehler",
                  description: "Das Projekt konnte nicht gelöscht werden.",
                  variant: "destructive",
                });
              },
            });
          }
        },
      })
      .build(),
  ];

  return (
    <AppLayout title="Projekte">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Projekte</h1>
        <DataTable data={projects} columns={columns} />
      </div>
    </AppLayout>
  );
}
```

## Troubleshooting

### "ConfirmProvider is not mounted" Fehler

Dieser Fehler bedeutet, dass `ConfirmProvider` nicht in deiner App eingebunden ist. Stelle sicher, dass:

1. ✅ `ConfirmProvider` in deinem Root-Layout eingebunden ist
2. ✅ Der Provider **über** allen Komponenten steht, die `confirm()` verwenden
3. ✅ Du die neueste Version von `@nccirtu/tablefy` installiert hast

### Browser Confirmation statt shadcn Dialog

Wenn du immer noch den Browser-Dialog siehst:

1. ✅ Überprüfe, ob `ConfirmProvider` korrekt eingebunden ist
2. ✅ Stelle sicher, dass du `confirm()` von `@nccirtu/tablefy` importierst
3. ✅ Prüfe die Browser-Konsole auf Fehler
4. ✅ Stelle sicher, dass shadcn/ui Dialog Component installiert ist:
   ```bash
   npx shadcn@latest add dialog
   ```

### Dialog wird nicht angezeigt

1. ✅ Überprüfe, ob alle shadcn/ui Dependencies installiert sind
2. ✅ Stelle sicher, dass Tailwind CSS korrekt konfiguriert ist
3. ✅ Prüfe, ob `@/components/ui/dialog` in deinem Projekt existiert

## Wichtige Hinweise

- Der `ConfirmProvider` muss **einmal** in deiner App eingebunden werden
- Du kannst `confirm()` in **allen** Komponenten verwenden, die innerhalb des Providers sind
- Der Dialog ist automatisch accessible und keyboard-navigierbar
- Multiple `confirm()` Aufrufe werden in einer Queue verarbeitet

## Weitere Beispiele

### Mit Custom Styling

```tsx
const confirmed = await confirm({
  title: "Unwiderrufliche Aktion",
  description:
    "Diese Aktion kann nicht rückgängig gemacht werden. Bist du sicher?",
  confirmLabel: "Ja, fortfahren",
  cancelLabel: "Nein, abbrechen",
  variant: "destructive",
});
```

### Ohne Beschreibung

```tsx
const confirmed = await confirm({
  title: "Wirklich löschen?",
  variant: "destructive",
});
```

### Standard Confirmation

```tsx
const confirmed = await confirm({
  title: "Änderungen speichern?",
  description: "Möchtest du die Änderungen speichern?",
  confirmLabel: "Speichern",
  cancelLabel: "Verwerfen",
});
```
