import type { ExtensionContext } from "vscode";
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

export function activate(context: ExtensionContext) {
  const restartTs = window.createStatusBarItem(StatusBarAlignment.Left, 1);
  restartTs.command = `${THIS_EXT_NAME}.softRestartTsServer`;
  restartTs.text = RESTART_TS_SERVER_LABEL;
  restartTs.tooltip = "Restart TypeScript language server";

  const restartEslint = window.createStatusBarItem(StatusBarAlignment.Left, 1);
  restartEslint.command = `${THIS_EXT_NAME}.softRestartEslintServer`;
  restartEslint.text = RESTART_ESLINT_SERVER_LABEL;
  restartEslint.tooltip = "Restart ESLint language server";

  const restartSvelte = window.createStatusBarItem(StatusBarAlignment.Left, 1);
  restartSvelte.command = `${THIS_EXT_NAME}.softRestartSvelteServer`;
  restartSvelte.text = RESTART_SVELTE_SERVER_LABEL;
  restartSvelte.tooltip = "Restart Svelte language server";

  const restartAll = window.createStatusBarItem(StatusBarAlignment.Left, 0);
  restartAll.command = `${THIS_EXT_NAME}.softRestartAll`;
  restartAll.text = RESTART_ALL_LABEL;
  restartAll.tooltip =
    "Restart TypeScript, ESLint, and Svelte language servers";

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

  context.subscriptions.push(
    restartTs,
    restartEslint,
    restartSvelte,
    restartAll,
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
    commands.registerCommand(
      `${THIS_EXT_NAME}.softRestartAllCommand`,
      softRestartAll,
    ),
    window.onDidChangeActiveTextEditor(updateStatusBarItemVisibility),
    window.onDidChangeTextEditorSelection(updateStatusBarItemVisibility),
    workspace.onDidCloseTextDocument(updateStatusBarItemVisibility),
    workspace.onDidOpenTextDocument(updateStatusBarItemVisibility),
  );

  updateStatusBarItemVisibility();
  // eslint-disable-next-line no-console
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
  const restarts: Array<{ name: string; restart: () => Promise<void> }> = [];

  if (extensions.getExtension(TYPESCRIPT_EXTENSION_ID)?.isActive) {
    restarts.push({ name: "TypeScript", restart: softRestartTsServer });
  }
  if (extensions.getExtension(ESLINT_EXTENSION_ID)?.isActive) {
    restarts.push({ name: "ESLint", restart: softRestartEslintServer });
  }
  if (extensions.getExtension(SVELTE_EXTENSION_ID)?.isActive) {
    restarts.push({ name: "Svelte", restart: softRestartSvelteServer });
  }

  if (restarts.length === 0) {
    window.showInformationMessage(
      "No language server extensions are currently active.",
    );
    return;
  }

  const errors: Array<string> = [];
  await Promise.allSettled(
    restarts.map(async ({ name, restart }) => {
      try {
        await restart();
      } catch (error) {
        errors.push(`${name}: ${String(error)}`);
      }
    }),
  );

  if (errors.length > 0) {
    window.showErrorMessage(
      `Some servers failed to restart: ${errors.join(", ")}`,
    );
  }
}

export function deactivate() {
  // eslint-disable-next-line no-console
  console.log(`Extension ${THIS_EXT_ID} is now inactive!`);
}
