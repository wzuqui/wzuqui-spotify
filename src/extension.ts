import * as vscode from 'vscode';

import { App } from './app';

export function activate(context: vscode.ExtensionContext) {
  new App(context);
}

export function deactivate() {}
