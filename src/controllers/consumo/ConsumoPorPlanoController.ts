import axios from "axios";

export default class ConsumoDetalhadoController {
  async list(req: any, res: any) {
    const { periodo, cpf_cnpj }: any = req.body;

    const URL_TIP = process.env.URL_TIP;
    const TOKEN_TIP = process.env.TOKEN_TIP;

    try {
      // 1️⃣ Pega todos os planos
      const planosResp: any = await axios.get(`${URL_TIP}/planos?user_token=${TOKEN_TIP}`);
      const planos = planosResp.data?.data || [];

      // 2️⃣ Pega todos os consumos
      const consumoBody: any = { periodo };
      if (cpf_cnpj) consumoBody.cpf_cnpj = cpf_cnpj;

      const consumoResp: any = await axios.post(
        `${URL_TIP}/consumo-consolidado?user_token=${TOKEN_TIP}`,
        consumoBody
      );
      const consumos = consumoResp.data?.data?.results || [];

      // 3️⃣ Cria resultado detalhado por linha
      const resultado = consumos.map((c: any) => {
        // encontra o plano correspondente
        const plano = planos.find((p: any) => String(p.id) === String(c.id_plano));

        const limite_dados = Number(plano?.quantity?.dados || 0);
        const limite_sms = Number(plano?.quantity?.sms || 0);
        const limite_minutos = Number(plano?.quantity?.telefonia || 0);

        const consumo_dados = Number(c.consumo_dados || 0);
        const consumo_sms = Number(c.consumo_sms || 0);
        const consumo_minutos = Number(c.consumo_minutos || c.consumo_segundos / 60 || 0);

        return {
          contrato: c.numero_contrato,
          linha: c.linha,
          cliente: c.cliente_nome,
          plano: plano?.description || c.plano,
          limite: {
            dados: limite_dados,
            sms: limite_sms,
            minutos: limite_minutos,
          },
          consumo: {
            dados: consumo_dados,
            sms: consumo_sms,
            minutos: consumo_minutos,
          },
          percentual_consumo: {
            dados: limite_dados ? ((consumo_dados / limite_dados) * 100).toFixed(2) : "0",
            sms: limite_sms ? ((consumo_sms / limite_sms) * 100).toFixed(2) : "0",
            minutos: limite_minutos ? ((consumo_minutos / limite_minutos) * 100).toFixed(2) : "0",
          },
        };
      });

      return res.status(200).json({
        message: "Consumo detalhado por linha com limites do plano",
        data: resultado,
      });
    } catch (error: any) {
      console.error("Erro ao listar consumo detalhado:", error.message);
      return res.status(500).json({
        message: "Erro ao listar consumo detalhado",
        error: error.response?.data || error.message,
      });
    }
  }
}
