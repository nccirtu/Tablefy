// Example: How to use FormSchema in a Laravel/Inertia project

import {
  FormSchema,
  TextInput,
  Textarea,
  Select,
  Checkbox,
  SectionBuilder,
  Form,
} from "@nccirtu/tablefy";
import { useForm } from "@inertiajs/react";
import { router } from "@inertiajs/react";

// Define your data type
interface Project {
  name: string;
  description: string;
  priority: "low" | "medium" | "high";
  deadline: string;
  isPublic: boolean;
  notifications: boolean;
}

// Create the form schema
const projectFormSchema = FormSchema.make<Project>()
  .title("Create Project")
  .description("Fill in the details to create a new project")
  .bordered()
  .spacing("normal")

  .fields(
    TextInput.make<Project>("name")
      .label("Project Name")
      .placeholder("Enter project name...")
      .required()
      .helperText("Choose a unique name for your project")
      .maxLength(100),

    Textarea.make<Project>("description")
      .label("Description")
      .placeholder("Describe your project...")
      .rows(4)
      .maxLength(500),

    Select.make<Project>("priority")
      .label("Priority")
      .placeholder("Select priority...")
      .options([
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ])
      .required()
      .helperText("Set the project priority level"),

    TextInput.make<Project>("deadline")
      .label("Deadline")
      .placeholder("YYYY-MM-DD")
      .helperText("Project completion deadline"),

    Checkbox.make<Project>("isPublic")
      .label("Make this project public")
      .helperText("Public projects are visible to everyone"),

    Checkbox.make<Project>("notifications")
      .label("Enable notifications")
      .helperText("Receive email notifications for project updates")
      .default(true),
  )

  .sections(
    SectionBuilder.make<Project>("Basic Information")
      .description("General project details")
      .fields(["name", "description"])
      .columns(1),

    SectionBuilder.make<Project>("Settings")
      .description("Configure project settings")
      .fields(["priority", "deadline", "isPublic", "notifications"])
      .columns(2)
      .collapsible(),
  )

  .actions((builder) =>
    builder.submit({ label: "Create Project" }).cancel({
      label: "Cancel",
      onClick: () => router.visit("/projects"),
    }),
  )

  .build();

// Usage in a component
export default function CreateProject() {
  const form = useForm<Project>({
    name: "",
    description: "",
    priority: "medium",
    deadline: "",
    isPublic: false,
    notifications: true,
  });

  const handleSubmit = () => {
    form.post("/projects", {
      onSuccess: () => {
        router.visit("/projects");
      },
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Form
        schema={projectFormSchema}
        data={form.data}
        errors={form.errors}
        onChange={(field, value) => form.setData(field, value)}
        onSubmit={handleSubmit}
        processing={form.processing}
      />
    </div>
  );
}

// Edit Form Example
const projectEditFormSchema = FormSchema.make<Project>()
  .title((data) => `Edit ${data.name}`)
  .description("Update project details")
  .bordered()

  .fields(
    TextInput.make<Project>("name").label("Project Name").required(),

    Textarea.make<Project>("description").label("Description").rows(4),

    Select.make<Project>("priority")
      .label("Priority")
      .options([
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ]),
  )

  .actions((builder) =>
    builder
      .submit({ label: "Update Project" })
      .cancel({ label: "Cancel" })
      .custom({
        label: "Delete",
        variant: "destructive",
        onClick: async () => {
          if (confirm("Are you sure?")) {
            // Delete logic
          }
        },
      }),
  )

  .build();

export function EditProject({ project }: { project: Project }) {
  const form = useForm<Project>(project);

  const handleSubmit = () => {
    form.put(`/projects/${project.id}`, {
      onSuccess: () => {
        router.visit("/projects");
      },
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Form
        schema={projectEditFormSchema}
        data={form.data}
        errors={form.errors}
        onChange={(field, value) => form.setData(field, value)}
        onSubmit={handleSubmit}
        processing={form.processing}
      />
    </div>
  );
}
