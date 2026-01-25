import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const SHADCN_COMPONENTS = [
  "button",
  "table",
  "checkbox",
  "dropdown-menu",
  "input",
  "select",
  "badge",
  "progress",
  "tooltip",
] as const;

export const TABLEFY_COMPONENTS = {
  "data-table": {
    files: [
      "tablefy/data-table.tsx",
      "tablefy/data-table-empty.tsx",
      "tablefy/data-table-header.tsx",
      "tablefy/data-table-pagination.tsx",
      "tablefy/data-table-schema.tsx",
    ],
    description: "Main DataTable component with pagination, search, and more",
  },
  "avatar-list": {
    files: ["tablefy/avatar-list.tsx"],
    description: "Avatar list component for displaying user groups",
  },
} as const;

export type ShadcnComponent = (typeof SHADCN_COMPONENTS)[number];
export type TablefyComponent = keyof typeof TABLEFY_COMPONENTS;

/**
 * Check if a file or directory exists
 */
export function pathExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Get the project root directory
 */
export function getProjectRoot(): string {
  return process.cwd();
}

/**
 * Check if shadcn is initialized in the project
 */
export function isShadcnInitialized(): boolean {
  const root = getProjectRoot();
  
  // Check for components.json (shadcn config file)
  if (pathExists(path.join(root, "components.json"))) {
    return true;
  }
  
  // Check for common shadcn component paths
  const possiblePaths = [
    path.join(root, "components", "ui"),
    path.join(root, "src", "components", "ui"),
    path.join(root, "app", "components", "ui"),
    path.join(root, "resources", "js", "components", "ui"),
  ];
  
  return possiblePaths.some((p) => pathExists(p));
}

/**
 * Get the components directory path
 */
export function getComponentsDir(customPath?: string): string {
  const root = getProjectRoot();
  
  if (customPath) {
    return path.join(root, customPath);
  }
  
  // Try to read from components.json
  const configPath = path.join(root, "components.json");
  if (pathExists(configPath)) {
    try {
      const config = fs.readJsonSync(configPath);
      if (config.aliases?.components) {
        // Convert alias like "@/components" to actual path
        const alias = config.aliases.components;
        if (alias.startsWith("@/")) {
          return path.join(root, "src", alias.slice(2));
        }
        return path.join(root, alias);
      }
    } catch {
      // Ignore errors, fall through to defaults
    }
  }
  
  // Check common paths
  const possiblePaths = [
    path.join(root, "src", "components"),
    path.join(root, "components"),
    path.join(root, "app", "components"),
    path.join(root, "resources", "js", "components"),
  ];
  
  for (const p of possiblePaths) {
    if (pathExists(p)) {
      return p;
    }
  }
  
  // Default to src/components
  return path.join(root, "src", "components");
}

/**
 * Check which shadcn components are already installed
 */
export function getInstalledShadcnComponents(componentsDir: string): ShadcnComponent[] {
  const uiDir = path.join(componentsDir, "ui");
  
  if (!pathExists(uiDir)) {
    return [];
  }
  
  const installed: ShadcnComponent[] = [];
  
  for (const component of SHADCN_COMPONENTS) {
    const componentPath = path.join(uiDir, `${component}.tsx`);
    if (pathExists(componentPath)) {
      installed.push(component);
    }
  }
  
  return installed;
}

/**
 * Get missing shadcn components
 */
export function getMissingShadcnComponents(componentsDir: string): ShadcnComponent[] {
  const installed = getInstalledShadcnComponents(componentsDir);
  return SHADCN_COMPONENTS.filter((c) => !installed.includes(c));
}

/**
 * Install shadcn components using the shadcn CLI
 */
export function installShadcnComponents(components: ShadcnComponent[]): boolean {
  if (components.length === 0) {
    return true;
  }
  
  console.log(chalk.blue("\n📦 Installing shadcn/ui components...\n"));
  
  try {
    const componentList = components.join(" ");
    execSync(`npx shadcn@latest add ${componentList} -y`, {
      stdio: "inherit",
      cwd: getProjectRoot(),
    });
    return true;
  } catch (error) {
    console.error(chalk.red("\n❌ Failed to install shadcn components"));
    console.error(chalk.yellow("Please install them manually:"));
    console.error(chalk.cyan(`  npx shadcn@latest add ${components.join(" ")}`));
    return false;
  }
}

/**
 * Get the Tablefy templates directory
 */
export function getTemplatesDir(): string {
  // When running from npm package
  const npmPath = path.join(__dirname, "..", "templates");
  if (pathExists(npmPath)) {
    return npmPath;
  }
  
  // When running locally during development
  const devPath = path.join(__dirname, "..", "..", "cli", "templates");
  if (pathExists(devPath)) {
    return devPath;
  }
  
  throw new Error("Could not find Tablefy templates directory");
}

/**
 * Copy Tablefy components to the user's project
 */
export async function copyTablefyComponents(
  componentsDir: string,
  components: TablefyComponent[] = Object.keys(TABLEFY_COMPONENTS) as TablefyComponent[]
): Promise<boolean> {
  const templatesDir = getTemplatesDir();
  
  console.log(chalk.blue("\n📦 Installing Tablefy components...\n"));
  
  try {
    for (const component of components) {
      const componentConfig = TABLEFY_COMPONENTS[component];
      
      for (const file of componentConfig.files) {
        const sourcePath = path.join(templatesDir, file);
        const destPath = path.join(componentsDir, file);
        
        // Ensure directory exists
        await fs.ensureDir(path.dirname(destPath));
        
        // Copy file
        await fs.copy(sourcePath, destPath, { overwrite: true });
        
        console.log(chalk.green(`  ✓ ${file}`));
      }
    }
    
    return true;
  } catch (error) {
    console.error(chalk.red("\n❌ Failed to copy Tablefy components"));
    console.error(error);
    return false;
  }
}

/**
 * Check if required peer dependencies are installed
 */
export function checkPeerDependencies(): { missing: string[]; installed: string[] } {
  const root = getProjectRoot();
  const packageJsonPath = path.join(root, "package.json");
  
  const required = [
    "@tanstack/react-table",
    "lucide-react",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
  ];
  
  const missing: string[] = [];
  const installed: string[] = [];
  
  if (!pathExists(packageJsonPath)) {
    return { missing: required, installed: [] };
  }
  
  try {
    const packageJson = fs.readJsonSync(packageJsonPath);
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    
    for (const dep of required) {
      if (deps[dep]) {
        installed.push(dep);
      } else {
        missing.push(dep);
      }
    }
  } catch {
    return { missing: required, installed: [] };
  }
  
  return { missing, installed };
}

/**
 * Install peer dependencies
 */
export function installPeerDependencies(dependencies: string[]): boolean {
  if (dependencies.length === 0) {
    return true;
  }
  
  console.log(chalk.blue("\n📦 Installing peer dependencies...\n"));
  
  try {
    const depList = dependencies.join(" ");
    
    // Detect package manager
    const root = getProjectRoot();
    let cmd = "npm install";
    
    if (pathExists(path.join(root, "pnpm-lock.yaml"))) {
      cmd = "pnpm add";
    } else if (pathExists(path.join(root, "yarn.lock"))) {
      cmd = "yarn add";
    } else if (pathExists(path.join(root, "bun.lockb"))) {
      cmd = "bun add";
    }
    
    execSync(`${cmd} ${depList}`, {
      stdio: "inherit",
      cwd: root,
    });
    
    return true;
  } catch (error) {
    console.error(chalk.red("\n❌ Failed to install dependencies"));
    console.error(chalk.yellow("Please install them manually:"));
    console.error(chalk.cyan(`  npm install ${dependencies.join(" ")}`));
    return false;
  }
}

/**
 * Display a success message
 */
export function showSuccess(message: string): void {
  console.log(chalk.green(`\n✅ ${message}\n`));
}

/**
 * Display an error message
 */
export function showError(message: string): void {
  console.log(chalk.red(`\n❌ ${message}\n`));
}

/**
 * Display an info message
 */
export function showInfo(message: string): void {
  console.log(chalk.blue(`\nℹ️  ${message}\n`));
}

/**
 * Display a warning message
 */
export function showWarning(message: string): void {
  console.log(chalk.yellow(`\n⚠️  ${message}\n`));
}
