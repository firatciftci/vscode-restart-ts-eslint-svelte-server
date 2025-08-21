import type { ExtensionContext, StatusBarItem } from "vscode";
import {
  commands,
  extensions,
  StatusBarAlignment,
  window,
  workspace,
} from "vscode";
import {
  ESLINT_EXTENSION_ID,
  RESTART_ALL_LABEL,
  RESTART_ESLINT_SERVER_LABEL,
  RESTART_SVELTE_SERVER_LABEL,
  RESTART_TS_SERVER_LABEL,
  SUPPORTED_LANGUAGES,
  SVELTE_EXTENSION_ID,
  THIS_EXT_ID,
  THIS_EXT_NAME,
  TYPESCRIPT_EXTENSION_ID,
} from "./constants";

let restartTs: StatusBarItem;
let restartEslint: StatusBarItem;
let restartSvelte: StatusBarItem;
let restartAll: StatusBarItem;

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(
      `${THIS_EXT_NAME}.softRestartTsServer`,
      softRestartTsServer,
    ),
    commands.registerCommand(
      `${THIS_EXT_NAME}.softRestartEslintServer`,
      softRestartEslintServer,
    ),
    commands.registerCommand(
      `${THIS_EXT_NAME}.softRestartSvelteServer`,
      softRestartSvelteServer,
    ),
    commands.registerCommand(`${THIS_EXT_NAME}.softRestartAll`, softRestartAll),
  );

  restartTs = window.createStatusBarItem(StatusBarAlignment.Left, 1);
  restartTs.command = `${THIS_EXT_NAME}.softRestartTsServer`;
  restartTs.text = RESTART_TS_SERVER_LABEL;
  restartTs.tooltip = "Restart TypeScript language server";

  restartEslint = window.createStatusBarItem(StatusBarAlignment.Left, 1);
  restartEslint.command = `${THIS_EXT_NAME}.softRestartEslintServer`;
  restartEslint.text = RESTART_ESLINT_SERVER_LABEL;
  restartEslint.tooltip = "Restart ESLint language server";

  restartSvelte = window.createStatusBarItem(StatusBarAlignment.Left, 1);
  restartSvelte.command = `${THIS_EXT_NAME}.softRestartSvelteServer`;
  restartSvelte.text = RESTART_SVELTE_SERVER_LABEL;
  restartSvelte.tooltip = "Restart Svelte language server";

  restartAll = window.createStatusBarItem(StatusBarAlignment.Left, 0);
  restartAll.command = `${THIS_EXT_NAME}.softRestartAll`;
  restartAll.text = RESTART_ALL_LABEL;
  restartAll.tooltip =
    "Restart TypeScript, ESLint, and Svelte language servers";

  const restartAllCommandPalette = commands.registerCommand(
    `${THIS_EXT_NAME}.softRestartAllCommand`,
    softRestartAll,
  );

  context.subscriptions.push(
    window.onDidChangeActiveTextEditor(updateStatusBarItemVisibility),
    window.onDidChangeTextEditorSelection(updateStatusBarItemVisibility),
    workspace.onDidCloseTextDocument(updateStatusBarItemVisibility),
    workspace.onDidOpenTextDocument(updateStatusBarItemVisibility),
    restartAllCommandPalette,
  );

  updateStatusBarItemVisibility();
  console.log(`Extension ${THIS_EXT_ID} is now active!`);
}

async function softRestartTsServer(): Promise<void> {
  const typeScriptExtension = extensions.getExtension(TYPESCRIPT_EXTENSION_ID);
  if (!typeScriptExtension?.isActive) {
    window.showErrorMessage(
      "TypeScript extension is not active or not running.",
    );
    return;
  }

  await commands.executeCommand("typescript.restartTsServer");
}

async function softRestartEslintServer(): Promise<void> {
  const eslintExtension = extensions.getExtension(ESLINT_EXTENSION_ID);
  if (!eslintExtension?.isActive) {
    window.showErrorMessage("ESLint extension is not active or not running.");
    return;
  }

  return commands.executeCommand("eslint.restart");
}

async function softRestartSvelteServer(): Promise<void> {
  const svelteExtension = extensions.getExtension(SVELTE_EXTENSION_ID);
  if (!svelteExtension?.isActive) {
    window.showErrorMessage("Svelte extension is not active or not running.");
    return;
  }

  return commands.executeCommand("svelte.restartLanguageServer");
}

async function softRestartAll() {
  const restartPromises: Array<Promise<void>> = [];
  const errors: Array<string> = [];

  const typeScriptExtension = extensions.getExtension(TYPESCRIPT_EXTENSION_ID);
  if (typeScriptExtension?.isActive) {
    restartPromises.push(
      softRestartTsServer().catch((error: unknown) => {
        errors.push(`TypeScript: ${error}`);
      }),
    );
  }

  const eslintExtension = extensions.getExtension(ESLINT_EXTENSION_ID);
  if (eslintExtension?.isActive) {
    restartPromises.push(
      softRestartEslintServer().catch((error: unknown) => {
        errors.push(`ESLint: ${error}`);
      }),
    );
  }

  const svelteExtension = extensions.getExtension(SVELTE_EXTENSION_ID);
  if (svelteExtension?.isActive) {
    restartPromises.push(
      softRestartSvelteServer().catch((error: unknown) => {
        errors.push(`Svelte: ${error}`);
      }),
    );
  }

  await Promise.allSettled(restartPromises);

  if (errors.length > 0) {
    window.showErrorMessage(
      `Some servers failed to restart: ${errors.join(", ")}`,
    );
  }

  if (restartPromises.length === 0) {
    const availableExtensions = [
      typeScriptExtension?.isActive ? "TypeScript" : null,
      eslintExtension?.isActive ? "ESLint" : null,
      svelteExtension?.isActive ? "Svelte" : null,
    ].filter(Boolean);

    if (availableExtensions.length === 0) {
      window.showInformationMessage(
        "No language server extensions are currently active.",
      );
    }
  }
}

function updateStatusBarItemVisibility(): void {
  const { activeTextEditor } = window;

  if (
    !activeTextEditor?.document ||
    !SUPPORTED_LANGUAGES.has(activeTextEditor.document.languageId)
  ) {
    restartTs.hide();
    restartEslint.hide();
    restartSvelte.hide();
    restartAll.hide();
  } else {
    restartTs.show();
    const eslintExtension = extensions.getExtension(ESLINT_EXTENSION_ID);
    if (eslintExtension?.isActive) {
      restartEslint.show();
      restartSvelte.show();
      restartAll.show();
    }
  }
}

export function deactivate() {
  console.log(`Extension ${THIS_EXT_ID} is now inactive!`);
}
