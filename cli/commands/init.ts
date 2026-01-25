import chalk from "chalk";
import prompts from "prompts";
import {
  isShadcnInitialized,
  getComponentsDir,
  getMissingShadcnComponents,
  installShadcnComponents,
  copyTablefyComponents,
  checkPeerDependencies,
  installPeerDependencies,
  showSuccess,
  showError,
  showInfo,
  showWarning,
  TABLEFY_COMPONENTS,
  TablefyComponent,
} from "../utils/helpers";

interface InitOptions {
  yes?: boolean;
  skipShadcn?: boolean;
  components?: string;
}

export async function initCommand(options: InitOptions): Promise<void> {
  console.log(chalk.bold.blue("\n🚀 Tablefy Setup\n"));
  console.log(chalk.gray("Setting up Tablefy in your project...\n"));

  // Step 1: Check for shadcn initialization
  console.log(chalk.bold("Step 1: Checking shadcn/ui setup..."));
  
  if (!isShadcnInitialized()) {
    showWarning("shadcn/ui is not initialized in this project.");
    console.log(chalk.yellow("Please run the following command first:"));
    console.log(chalk.cyan("\n  npx shadcn@latest init\n"));
    
    if (!options.yes) {
      const response = await prompts({
        type: "confirm",
        name: "continue",
        message: "Do you want to continue anyway?",
        initial: false,
      });
      
      if (!response.continue) {
        showInfo("Setup cancelled. Please initialize shadcn/ui first.");
        process.exit(0);
      }
    }
  } else {
    console.log(chalk.green("  ✓ shadcn/ui is initialized"));
  }

  // Step 2: Determine components directory
  const componentsDir = getComponentsDir(options.components);
  console.log(chalk.gray(`  Using components directory: ${componentsDir}\n`));

  // Step 3: Check peer dependencies
  console.log(chalk.bold("Step 2: Checking peer dependencies..."));
  
  const { missing: missingDeps, installed: installedDeps } = checkPeerDependencies();
  
  if (installedDeps.length > 0) {
    console.log(chalk.green(`  ✓ ${installedDeps.length} dependencies already installed`));
  }
  
  if (missingDeps.length > 0) {
    console.log(chalk.yellow(`  ⚠ ${missingDeps.length} missing dependencies:`));
    missingDeps.forEach((dep) => console.log(chalk.gray(`    - ${dep}`)));
    
    let shouldInstall = options.yes;
    
    if (!shouldInstall) {
      const response = await prompts({
        type: "confirm",
        name: "install",
        message: "Install missing peer dependencies?",
        initial: true,
      });
      shouldInstall = response.install;
    }
    
    if (shouldInstall) {
      const success = installPeerDependencies(missingDeps);
      if (!success) {
        showError("Failed to install peer dependencies.");
        process.exit(1);
      }
    } else {
      showWarning("Skipping peer dependency installation.");
      console.log(chalk.yellow("Install them manually with:"));
      console.log(chalk.cyan(`  npm install ${missingDeps.join(" ")}\n`));
    }
  }

  // Step 4: Check shadcn components
  if (!options.skipShadcn) {
    console.log(chalk.bold("\nStep 3: Checking shadcn/ui components..."));
    
    const missingShadcn = getMissingShadcnComponents(componentsDir);
    
    if (missingShadcn.length === 0) {
      console.log(chalk.green("  ✓ All required shadcn/ui components are installed"));
    } else {
      console.log(chalk.yellow(`  ⚠ ${missingShadcn.length} missing shadcn/ui components:`));
      missingShadcn.forEach((comp) => console.log(chalk.gray(`    - ${comp}`)));
      
      let shouldInstall = options.yes;
      
      if (!shouldInstall) {
        const response = await prompts({
          type: "confirm",
          name: "install",
          message: "Install missing shadcn/ui components?",
          initial: true,
        });
        shouldInstall = response.install;
      }
      
      if (shouldInstall) {
        const success = installShadcnComponents(missingShadcn);
        if (!success) {
          showWarning("Some shadcn components may not have been installed.");
        }
      } else {
        showWarning("Skipping shadcn component installation.");
        console.log(chalk.yellow("Install them manually with:"));
        console.log(chalk.cyan(`  npx shadcn@latest add ${missingShadcn.join(" ")}\n`));
      }
    }
  }

  // Step 5: Install Tablefy components
  console.log(chalk.bold("\nStep 4: Installing Tablefy components..."));
  
  const allComponents = Object.keys(TABLEFY_COMPONENTS) as TablefyComponent[];
  
  console.log(chalk.gray("  Components to install:"));
  allComponents.forEach((comp) => {
    console.log(chalk.gray(`    - ${comp}: ${TABLEFY_COMPONENTS[comp].description}`));
  });
  
  let shouldInstallTablefy = options.yes;
  
  if (!shouldInstallTablefy) {
    const response = await prompts({
      type: "confirm",
      name: "install",
      message: "Install Tablefy components?",
      initial: true,
    });
    shouldInstallTablefy = response.install;
  }
  
  if (shouldInstallTablefy) {
    const success = await copyTablefyComponents(componentsDir, allComponents);
    if (!success) {
      showError("Failed to install Tablefy components.");
      process.exit(1);
    }
  } else {
    showInfo("Tablefy component installation skipped.");
    process.exit(0);
  }

  // Success!
  showSuccess("Tablefy has been successfully installed!");
  
  console.log(chalk.bold("Next steps:\n"));
  console.log(chalk.gray("1. Import and use Tablefy in your project:"));
  console.log(chalk.cyan(`
   import { DataTable, TableSchema } from "@nccirtu/tablefy";
   import { TextColumn, BadgeColumn } from "@nccirtu/tablefy/columns";
`));
  
  console.log(chalk.gray("2. Create your first table:"));
  console.log(chalk.cyan(`
   const { columns, config } = TableSchema.make<User>()
     .searchable()
     .paginated()
     .columns(
       TextColumn.make("name").label("Name").sortable(),
       BadgeColumn.make("status").label("Status")
     )
     .build();

   <DataTable data={users} columns={columns} config={config} />
`));
  
  console.log(chalk.gray("📚 Full documentation: https://github.com/nccirtu/Tablefy\n"));
}
