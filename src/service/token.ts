import axios from 'axios';
import qs from 'qs';

export default class AuthApivoalleController {
  async getToken() {
   
    const ambiente = process.env.VOALLE_AMBIENTE || "STAGING"; // Use uma variável de ambiente para definir o ambiente
     const url = ambiente === "PRODUCAO" ? process.env.URL_VOALLE : process.env.URL_VOALLE_STAGING;

    if (!url) {
      console.error("URL_VOALLE não definida.");
      return false;
    }

    const configs: Record<string, any> = {
      PRODUCAO: {
        grant_type: process.env.GRANT_TYPE,
        scope: process.env.SCOPE,
        client_id: process.env.CLIENT_ID_VOALLE,
        client_secret: process.env.CLIENT_SECRET_VOALLE,
        syndata: process.env.SYNDATA_VOALLE
      },
      STAGING: {
        grant_type: process.env.GRANT_TYPE_STAGING,
        scope: process.env.SCOPE_STAGING,
        client_id: process.env.CLIENT_ID_VOALLE_STAGING,
        client_secret: process.env.CLIENT_SECRET_VOALLE_STAGING,
        syndata: process.env.SYNDATA_VOALLE_STAGING
      }
    };

    const data: any = configs[ambiente];

    if (!data) {
      console.error(`Configuração para ambiente '${ambiente}' não encontrada.`);
      return false;
    }

    try {
      const response: any = await axios.post(url, qs.stringify(data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const accessToken = response.data?.access_token;

      if (!accessToken) {
        console.error("Token não encontrado na resposta.");
        return false;
      }

 
      return accessToken;
    } catch (error: any) {
      console.error("Erro ao obter token:", error.message);
      return false;
    }
  }
}
