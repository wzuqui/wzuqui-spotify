import * as vscode from 'vscode';
import { COMANDO } from './comandos';
import { PlayerComponent } from './components/PlayerComponent';
import { COOKIE, MENSAGEM_AUTENTICAR } from './constants';

import { SpotifyService } from './services/SpotifyService';

export function activate(context: vscode.ExtensionContext) {
  const service = new SpotifyService(context);
  const component = new PlayerComponent(context);

  service.playing$.subscribe(([isPlaying, song]) => {
    if (isPlaying) {
      component.play.hide();
      component.pause.show();
      component.song.show();
    } else {
      component.pause.hide();
      component.play.show();
      component.song.hide();
    }
    if (song) {
      component.song.text = song;
    }
  });

  context.subscriptions.push(
    vscode.commands.registerCommand(COMANDO.login, async () => {
      let cookie = await vscode.window.showInputBox({
        prompt: MENSAGEM_AUTENTICAR,
      });

      if (cookie === '') {
        cookie = context.globalState.get<string>(COOKIE);
      }
      service.autenticar(cookie);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(COMANDO.play, () => service.play())
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(COMANDO.pause, () => service.pause())
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(COMANDO.prev, () => service.anterior())
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(COMANDO.next, () => service.proxima())
  );
}

export function deactivate() {}
