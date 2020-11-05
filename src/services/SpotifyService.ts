/* eslint-disable @typescript-eslint/naming-convention */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as vscode from 'vscode';

const TOKEN = 'wzuqui-spotify-accessToken';

export class SpotifyService {
  private api!: AxiosInstance;
  private deviceid = '41c6a2e93c5d782c697ebb4c6ab6591c5a838bfa';

  constructor(private context: vscode.ExtensionContext) {
    this._configuraApi();
  }

  private _configuraApi() {
    const authorization = this.context.globalState.get(TOKEN);

    this.api = axios.create({
      baseURL: 'https://api.spotify.com',
      headers: {
        authorization,
      },
    });
  }

  async autenticar() {
    try {
      const cookie = await vscode.window.showInputBox({
        prompt:
          'Entre no site https://open.spotify.com/get_access_token, copie o cookie sp_dc e cole aqui',
      });
      if (cookie) {
        const options = {
          method: 'GET',
          url: 'https://open.spotify.com/get_access_token',
          headers: {
            cookie: `sp_dc=${cookie};`,
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0;Win64;x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36 Edg/86.0.622.58',
          },
        } as AxiosRequestConfig;

        const { data } = await axios.request(options);

        this.context.globalState.update(TOKEN, `Bearer ${data.accessToken}`);
        this._configuraApi();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async play() {
    return this.api
      .put(`v1/me/player/play?device_id=${this.deviceid}`)
      .then(() => vscode.window.showInformationMessage('Reproduzindo faixa'))
      .catch((err) => {
        console.error(err);
      });
  }

  async pause() {
    return this.api
      .put(`v1/me/player/pause?device_id=${this.deviceid}`)
      .then(() =>
        vscode.window.showInformationMessage(
          'Pausado a reprodução de um usuário'
        )
      );
  }

  async anterior() {
    return this.api
      .post(`v1/me/player/previous?device_id=${this.deviceid}`)
      .then(() =>
        vscode.window.showInformationMessage('Reproduzindo faixa anterior')
      );
  }

  async proxima() {
    return this.api
      .post(`v1/me/player/next?device_id=${this.deviceid}`)
      .then(() =>
        vscode.window.showInformationMessage('Reproduzindo próxima faixa')
      );
  }
}
