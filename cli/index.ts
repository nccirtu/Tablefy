#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { initCommand } from "./commands/init";
import { addCommand } from "./commands/add";

const program = new Command();

program
  .name("tablefy")
  .description("CLI for setting up Tablefy in your project")
  .version("0.2.0");

program
  .command("init")
  .description("Initialize Tablefy in your project")
  .option("-y, --yes", "Skip confirmation prompts")
  .option("--skip-shadcn", "Skip shadcn/ui component installation")
  .option(
    "-c, --components <path>",
    "Path to components directory",
    "components"
  )
  .action(initCommand);

program
  .command("add")
  .description("Add specific Tablefy components")
  .argument("[components...]", "Components to add (e.g., data-table avatar-list)")
  .option(
    "-c, --components <path>",
    "Path to components directory",
    "components"
  )
  .option("-y, --yes", "Skip confirmation prompts")
  .action(addCommand);

program.parse();
