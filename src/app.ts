import * as vscode from 'vscode';

import { COMANDO } from './comandos';
import { StatusBarComponent } from './components/StatusBarComponent';
import { COOKIE, MENSAGEM_AUTENTICAR } from './constants';
import { SpotifyService } from './services/SpotifyService';

export class App {
  constructor(
    private context: vscode.ExtensionContext,
    private service = new SpotifyService(context),
    private statusBar = new StatusBarComponent(context)
  ) {
    this.setupCommands();
    this.setupEvents();
  }

  private setupCommands() {
    const subscriptions = this.context.subscriptions;
    const command = vscode.commands.registerCommand;

    subscriptions.push(command(COMANDO.play, () => this.service.play()));
    subscriptions.push(command(COMANDO.pause, () => this.service.pause()));
    subscriptions.push(command(COMANDO.prev, () => this.service.anterior()));
    subscriptions.push(command(COMANDO.next, () => this.service.proxima()));
    subscriptions.push(command(COMANDO.login, () => this.login()));
  }

  private setupEvents() {
    this.service.playing$.subscribe(([isPlaying, song]) => {
      if (isPlaying) {
        this.statusBar.play.hide();
        this.statusBar.pause.show();
        this.statusBar.song.show();
      } else {
        this.statusBar.pause.hide();
        this.statusBar.play.show();
        this.statusBar.song.hide();
      }
      if (song) {
        this.statusBar.song.text = song;
      }
    });
  }

  private async login() {
    let cookie = await vscode.window.showInputBox({
      prompt: MENSAGEM_AUTENTICAR,
    });

    if (cookie === '') {
      cookie = this.context.globalState.get<string>(COOKIE);
    }
    this.service.autenticar(cookie);
  }
}
