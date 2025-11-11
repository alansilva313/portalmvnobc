import axios from "axios";
import { limparCpfCnpj } from "../../utils/removePointsDocument";

export default class ListAllConsumoController {
  async list(req: any, res: any) {
    const { periodo, cpf_cnpj, numero_contrato, linha_contrato  }: any = req.body;

    const URL_TIP = process.env.URL_TIP;
    const TOKEN_TIP = process.env.TOKEN_TIP;

    const documento = limparCpfCnpj(cpf_cnpj)

    try {
      // Monta o corpo da requisição, adicionando cpf_cnpj apenas se for informado
      const data: any = {
        periodo,
      };


      if (cpf_cnpj) {
        data.cpf_cnpj = documento;
      }

      if (numero_contrato) {
        data.numero_contrato = numero_contrato;
      }

      if (linha_contrato) {
        data.linha_contrato = linha_contrato;
      }

      const response = await axios.post(
        `${URL_TIP}/consumo-consolidado?user_token=${TOKEN_TIP}`,
        data
      );

      // Retorna o resultado da API TIP
      return res.status(200).json({
        message: "Listando consumo com sucesso",
        data: response.data,
      });
    } catch (error: any) {
      console.error("Erro ao listar consumo:", error.message);

      return res.status(500).json({
        message: "Erro ao listar consumo",
        error: error.response?.data || error.message,
      });
    }
  }
}
