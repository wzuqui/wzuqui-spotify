import * as vscode from 'vscode';

import { SpotifyService } from './services/SpotifyService';

export function activate(context: vscode.ExtensionContext) {
  const service = new SpotifyService(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('wzuqui-spotify.autenticar', () =>
      service.autenticar()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('wzuqui-spotify.play', () => service.play())
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('wzuqui-spotify.pause', () =>
      service.pause()
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('wzuqui-spotify.anterior', () =>
      service.anterior()
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('wzuqui-spotify.proxima', () =>
      service.proxima()
    )
  );
}

export function deactivate() {}

function getWebviewContent() {
  const panel = vscode.window.createWebviewPanel(
    'wzuqui-spotify.autenticar',
    'wzuqui-spotify.autenticar',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      enableCommandUris: true,
    }
  );
  panel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
</head>
<body>
    <textarea></textarea>
    <button onclick="main()">Logar</button>
    <iframe src="https://cors-anywhere.herokuapp.com/https://accounts.spotify.com/login"></iframe>
    <a class="mini-spotify-player-link" href="https://accounts.spotify.com/login" target="_blank">Spotify</a>
    <script>
    async function main() {
      debugger;
      const textareaEl = document.querySelector('textarea');
      try {
        const proxy = 'https://cors-anywhere.herokuapp.com/';
        const url = 'https://open.spotify.com/get_access_token';

        const res = await fetch(proxy + url);
        token = await res.json();

        textareaEl.value = token;
      } catch (err) {
        textareaEl.value = err;
      }
    }
    </script>
</body>
</html>`;
}
