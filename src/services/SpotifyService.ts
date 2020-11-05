/* eslint-disable @typescript-eslint/naming-convention */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as vscode from 'vscode';

import { COOKIE, MENSAGEM_AUTENTICAR, SP_NEXT, SP_PAUSE, SP_PLAY, SP_PREV, SP_URI_API, SP_URI_TOKEN, TOKEN, USER_AGENT } from '../constants';

export class SpotifyService {
  private api!: AxiosInstance;
  private player!: Spotify.PlayerResponse;

  constructor(private context: vscode.ExtensionContext) {
    this._configura();
  }

  private _configura() {
    const authorization = this.context.globalState.get(TOKEN);

    this.api = axios.create({
      baseURL: SP_URI_API,
      headers: {
        authorization,
      },
    });
    this._atualizarPlayer();
  }

  private _atualizarPlayer() {
    setTimeout(async () => {
      try {
        const { data } = await this.api.get('v1/me/player');
        this.player = data;
      } catch (err) {
        console.error(err);
      }
    }, 0);
  }

  async autenticar() {
    try {
      let cookie = await vscode.window.showInputBox({
        prompt: MENSAGEM_AUTENTICAR,
      });

      if (cookie === '') {
        cookie = this.context.globalState.get<string>(COOKIE);
      }
      if (cookie) {
        this.context.globalState.update(COOKIE, cookie);
        this.atualizarToken(cookie);
        this._configura();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async play() {
    return this.api
      .put(`v1/me/player/play?device_id=${this.player.device.id}`)
      .then(() => vscode.window.showInformationMessage(SP_PLAY))
      .catch((err) => {
        console.error(err);
      });
  }

  async pause() {
    return this.api
      .put(`v1/me/player/pause?device_id=${this.player.device.id}`)
      .then(() => vscode.window.showInformationMessage(SP_PAUSE));
  }

  async anterior() {
    return this.api
      .post(`v1/me/player/previous?device_id=${this.player.device.id}`)
      .then(() => vscode.window.showInformationMessage(SP_PREV));
  }

  async proxima() {
    return this.api
      .post(`v1/me/player/next?device_id=${this.player.device.id}`)
      .then(() => vscode.window.showInformationMessage(SP_NEXT));
  }

  private async atualizarToken(cookie: string) {
    try {
      const options = {
        method: 'GET',
        url: SP_URI_TOKEN,
        headers: {
          cookie: `sp_dc=${cookie};`,
          'user-agent': USER_AGENT,
        },
      } as AxiosRequestConfig;

      const { data } = await axios.request(options);
      const token = `Bearer ${data.accessToken}`;

      this.context.globalState.update(TOKEN, token);
      return token;
    } catch (err) {
      vscode.window.showInformationMessage(err);
    }
  }
}
