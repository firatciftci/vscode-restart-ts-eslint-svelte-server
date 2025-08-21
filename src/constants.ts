export const TYPESCRIPT_EXTENSION_ID = "vscode.typescript-language-features";
export const ESLINT_EXTENSION_ID = "dbaeumer.vscode-eslint";
export const SVELTE_EXTENSION_ID = "svelte.svelte-vscode";

export const RESTART_TS_SERVER_LABEL = "$(debug-restart) Restart TS";
export const RESTART_ESLINT_SERVER_LABEL = "$(debug-restart) Restart ESLint";
export const RESTART_SVELTE_SERVER_LABEL = "$(debug-restart) Restart Svelte";
export const RESTART_ALL_LABEL = "$(debug-restart) Restart All";

export const THIS_EXT_NAME = "restart-ts-eslint-svelte-server";
export const THIS_EXT_ID = `firatciftci.${THIS_EXT_NAME}`;

export const SUPPORTED_LANGUAGES = new Set([
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
  "svelte",
]);
