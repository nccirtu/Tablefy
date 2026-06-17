import chalk from "chalk";
import prompts from "prompts";
import {
  getComponentsDir,
  copyTablefyComponents,
  showSuccess,
  showError,
  showInfo,
  TABLEFY_COMPONENTS,
  TablefyComponent,
} from "../utils/helpers";

interface AddOptions {
  components?: string;
  yes?: boolean;
}

export async function addCommand(
  componentNames: string[],
  options: AddOptions
): Promise<void> {
  const availableComponents = Object.keys(TABLEFY_COMPONENTS) as TablefyComponent[];

  // If no components specified, show selection prompt
  if (componentNames.length === 0) {
    const response = await prompts({
      type: "multiselect",
      name: "components",
      message: "Select components to add:",
      choices: availableComponents.map((name) => ({
        title: name,
        description: TABLEFY_COMPONENTS[name].description,
        value: name,
      })),
      min: 1,
    });

    if (!response.components || response.components.length === 0) {
      showInfo("No components selected.");
      process.exit(0);
    }

    componentNames = response.components;
  }

  // Validate component names
  const validComponents: TablefyComponent[] = [];
  const invalidComponents: string[] = [];

  for (const name of componentNames) {
    if (availableComponents.includes(name as TablefyComponent)) {
      validComponents.push(name as TablefyComponent);
    } else {
      invalidComponents.push(name);
    }
  }

  if (invalidComponents.length > 0) {
    console.log(chalk.yellow(`\n⚠️  Unknown components: ${invalidComponents.join(", ")}`));
    console.log(chalk.gray("Available components:"));
    availableComponents.forEach((comp) => {
      console.log(chalk.gray(`  - ${comp}: ${TABLEFY_COMPONENTS[comp].description}`));
    });
  }

  if (validComponents.length === 0) {
    showError("No valid components to install.");
    process.exit(1);
  }

  // Get components directory
  const componentsDir = getComponentsDir(options.components);
  console.log(chalk.gray(`\nUsing components directory: ${componentsDir}\n`));

  // Confirm installation
  if (!options.yes) {
    console.log(chalk.bold("Components to install:"));
    validComponents.forEach((comp) => {
      console.log(chalk.gray(`  - ${comp}`));
      TABLEFY_COMPONENTS[comp].files.forEach((file) => {
        console.log(chalk.gray(`      └─ ${file}`));
      });
    });

    const response = await prompts({
      type: "confirm",
      name: "confirm",
      message: "Proceed with installation?",
      initial: true,
    });

    if (!response.confirm) {
      showInfo("Installation cancelled.");
      process.exit(0);
    }
  }

  // Install components
  const success = await copyTablefyComponents(componentsDir, validComponents);

  if (success) {
    showSuccess(`Successfully installed: ${validComponents.join(", ")}`);
  } else {
    showError("Failed to install some components.");
    process.exit(1);
  }
}
