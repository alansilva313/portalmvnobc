import axios from "axios";
import { limparCpfCnpj } from "../../utils/removePointsDocument";

export default class ListAllConsumoController {
  async list(req: any, res: any) {
    const { periodo, cpf_cnpj, numero_contrato, linha_contrato }: any = req.body;

    const URL_TIP = process.env.URL_TIP;
    const TOKEN_TIP = process.env.TOKEN_TIP;

    const documento = limparCpfCnpj(cpf_cnpj);

    try {
      const data: any = { periodo };

      if (cpf_cnpj) data.cpf_cnpj = documento;
      if (numero_contrato) data.numero_contrato = numero_contrato;
      if (linha_contrato) data.linha_contrato = linha_contrato;

      // 🔹 Consumo
      const response: any = await axios.post(
        `${URL_TIP}/consumo-consolidado?user_token=${TOKEN_TIP}`,
        data
      );

      // 🔹 Planos
      const result: any = await axios.get(`${URL_TIP}/planos?user_token=${TOKEN_TIP}`);

      // 🔹 Tenta buscar nos dois formatos possíveis
      const consumos = response.data?.data?.results || response.data?.results || [];
      const planos = result.data?.data || result.data || [];

      console.log("📦 Quantidade de consumos:", consumos.length);
      console.log("📦 Quantidade de planos:", planos.length);

      // 🔹 Faz o join
      const consumosComPlano = consumos.map((consumo: any) => {
        const idPlano = Number(consumo.id_plano);
        const planoRelacionado = planos.find((p: any) => Number(p.id) === idPlano);

        if (!planoRelacionado) {
          console.warn("⚠️ Nenhum plano encontrado para id:", idPlano);
          return { ...consumo, plano_detalhes: null };
        }

        const limiteDados = Number(planoRelacionado.quantity?.dados || 0);
        const limiteSMS = Number(planoRelacionado.quantity?.sms || 0);
        const limiteVoz = Number(planoRelacionado.quantity?.telefonia || 0);

        const usoDados = Number(consumo.consumo_dados || 0);
        const usoSMS = Number(consumo.consumo_sms || 0);
        const usoVoz = Number(consumo.consumo_minutos || 0);

        return {
          ...consumo,
          plano_detalhes: {
            id_plano: planoRelacionado.id,
            descricao_plano: planoRelacionado.description,
            rede: planoRelacionado.rede,
            limites: {
              dados_total_mb: limiteDados,
              sms_total: limiteSMS,
              voz_total_min: limiteVoz,
            },
            uso: {
              dados_usados_mb: usoDados,
              sms_usados: usoSMS,
              voz_usada_min: usoVoz,
            },
            percentual_uso: {
              dados: limiteDados > 0 ? Number(((usoDados / limiteDados) * 100).toFixed(2)) : 0,
              sms: limiteSMS > 0 ? Number(((usoSMS / limiteSMS) * 100).toFixed(2)) : 0,
              voz: limiteVoz > 0 ? Number(((usoVoz / limiteVoz) * 100).toFixed(2)) : 0,
            },
          },
        };
      });

      return res.status(200).json({
        message: "Listando consumo com sucesso",
        data: consumosComPlano,
      });
    } catch (error: any) {
      console.error("❌ Erro ao listar consumo:", error.message);

      return res.status(500).json({
        message: "Erro ao listar consumo",
        error: error.response?.data || error.message,
      });
    }
  }
}
