import * as vscode from 'vscode';

import { SpotifyService } from './services/SpotifyService';

export function activate(context: vscode.ExtensionContext) {
  const service = new SpotifyService(context);

  context.subscriptions.push(vscode.commands.registerCommand('wzuqui-spotify.login', () => service.autenticar()));
  context.subscriptions.push(vscode.commands.registerCommand('wzuqui-spotify.play', () => service.play()));
  context.subscriptions.push(vscode.commands.registerCommand('wzuqui-spotify.pause', () => service.pause()));
  context.subscriptions.push(vscode.commands.registerCommand('wzuqui-spotify.prev', () => service.anterior()));
  context.subscriptions.push(vscode.commands.registerCommand('wzuqui-spotify.next', () => service.proxima()));
}

export function deactivate() {}
