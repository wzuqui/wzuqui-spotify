/* eslint-disable @typescript-eslint/naming-convention */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Subject } from 'rxjs/internal/Subject';
import * as vscode from 'vscode';
import {
  COOKIE,
  SP_URI_API,
  SP_URI_TOKEN,
  TOKEN,
  USER_AGENT,
} from '../constants';
import { ETIQUETA } from '../etiquetas';

function sanitizaItem(item: Spotify.Item): string {
  return `${item.name} - ${item.artists
    .map((artist) => artist.name)
    .join(' ')}`;
}

export class SpotifyService {
  private api!: AxiosInstance;
  private player!: Spotify.PlayerResponse;
  public playing$ = new Subject<[boolean, string]>();

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
    this.autenticar();
    this._atualizarPlayer();
  }

  private _atualizarPlayer() {
    setInterval(async () => {
      try {
        const { data } = await this.api.get<Spotify.PlayerResponse>(
          'v1/me/player'
        );
        this.player = data;
        this.playing$.next([data.is_playing, sanitizaItem(data.item)]);
      } catch (err) {
        console.error(err);
      }
    }, 10_000);
  }

  autenticar(cookie?: string) {
    setInterval(async () => {
      try {
        if (cookie) {
          this.context.globalState.update(COOKIE, cookie);
          this.atualizarToken(cookie);
          this._configura();
        }
      } catch (err) {
        console.error(err);
      }
    }, 10_000);
  }

  async play() {
    return this.api
      .put(`v1/me/player/play?device_id=${this.player.device.id}`)
      .then(() => {
        this.playing$.next([true, '']);
        vscode.window.showInformationMessage(ETIQUETA.play);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async pause() {
    return this.api
      .put(`v1/me/player/pause?device_id=${this.player.device.id}`)
      .then(() => {
        this.playing$.next([false, '']);
        vscode.window.showInformationMessage(ETIQUETA.pause);
      });
  }

  async anterior() {
    return this.api
      .post(`v1/me/player/previous?device_id=${this.player.device.id}`)
      .then(() => vscode.window.showInformationMessage(ETIQUETA.prev));
  }

  async proxima() {
    return this.api
      .post(`v1/me/player/next?device_id=${this.player.device.id}`)
      .then(() => vscode.window.showInformationMessage(ETIQUETA.next));
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
