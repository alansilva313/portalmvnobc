import axios from "axios";
import { limparCpfCnpj } from "../../utils/removePointsDocument";

export default class ListAssinanteController {
  async list(req: any, res: any) {
    const { cpf_cnpj } = req.body; // vem no body
    const URL_TIP = process.env.URL_TIP;
    const TOKEN_TIP = process.env.TOKEN_TIP;

    try {
      // Monta a URL base com o token obrigatório
      let url = `${URL_TIP}/assinantes/listar?user_token=${TOKEN_TIP}`;

      // Se o cpf_cnpj existir, limpa e adiciona como query param
      if (cpf_cnpj) {
        const documento = limparCpfCnpj(cpf_cnpj);
        url += `&cpf_cnpj=${documento}`;
      }

      // Faz a requisição (sem body, pois é por query param)
      const response = await axios.get(url);

      return res.status(200).json({
        message: "Assinantes listados com sucesso",
        data: response.data,
      });
    } catch (error: any) {
      console.error("Erro ao listar assinantes:", error.message);

      return res.status(500).json({
        message: "Erro ao listar assinantes",
        error: error.response?.data || error.message,
      });
    }
  }
}
