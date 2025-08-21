import type { ExtensionContext, StatusBarItem } from "vscode";
import {
  commands,
  extensions,
  StatusBarAlignment,
  window,
  workspace,
} from "vscode";

let restartTs: StatusBarItem;
let restartEslint: StatusBarItem;
let restartSvelte: StatusBarItem;
let restartAll: StatusBarItem;

const TYPESCRIPT_EXTENSION_ID = "vscode.typescript-language-features";
const ESLINT_EXTENSION_ID = "dbaeumer.vscode-eslint";
const SVELTE_EXTENSION_ID = "svelte.svelte-vscode";

const RESTART_TS_SERVER_LABEL = "$(debug-restart) Restart TS";
const RESTART_ESLINT_SERVER_LABEL = "$(debug-restart) Restart ESLint";
const RESTART_SVELTE_SERVER_LABEL = "$(debug-restart) Restart Svelte LSP";
const RESTART_ALL_LABEL = "$(debug-restart) Restart TS, ESLint, and Svelte LSP";
const THIS_EXT_NAME = "restart-ts-eslint-svelte-server";
const THIS_EXT_ID = `firatciftci.${THIS_EXT_NAME}`;
const SUPPORTED_LANGUAGES = new Set([
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
  "svelte",
]);

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

  restartEslint = window.createStatusBarItem(StatusBarAlignment.Left, 1);
  restartEslint.command = `${THIS_EXT_NAME}.softRestartEslintServer`;
  restartEslint.text = RESTART_ESLINT_SERVER_LABEL;

  restartSvelte = window.createStatusBarItem(StatusBarAlignment.Left, 1);
  restartSvelte.command = `${THIS_EXT_NAME}.softRestartSvelteServer`;
  restartSvelte.text = RESTART_SVELTE_SERVER_LABEL;

  restartAll = window.createStatusBarItem(StatusBarAlignment.Left, 0);
  restartAll.command = `${THIS_EXT_NAME}.softRestartAll`;
  restartAll.text = RESTART_ALL_LABEL;

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

async function softRestartTsServer() {
  const typeScriptExtension = extensions.getExtension(TYPESCRIPT_EXTENSION_ID);
  if (!typeScriptExtension?.isActive) {
    window.showErrorMessage(
      "TypeScript extension is not active or not running.",
    );
    return;
  }

  await commands.executeCommand("typescript.restartTsServer");
}

function softRestartEslintServer() {
  const eslintExtension = extensions.getExtension(ESLINT_EXTENSION_ID);
  if (!eslintExtension?.isActive) {
    window.showErrorMessage("ESLint extension is not active or not running.");
    return;
  }

  return commands.executeCommand("eslint.restart");
}

async function softRestartSvelteServer() {
  const svelteExtension = extensions.getExtension(SVELTE_EXTENSION_ID);
  if (!svelteExtension?.isActive) {
    window.showErrorMessage("Svelte extension is not active or not running.");
    return;
  }

  return commands.executeCommand("svelte.restartLanguageServer");
}

async function softRestartAll() {
  await softRestartTsServer();
  await softRestartEslintServer();
  await softRestartSvelteServer();
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

// this method is called when your extension is deactivated
export function deactivate() {
  console.log(`Extension ${THIS_EXT_ID} is now inactive!`);
}
