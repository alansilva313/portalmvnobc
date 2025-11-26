import axios from "axios";

export default class ConsumoDetalhadoController {
  async list(req: any, res: any) {
    const { periodo, cpf_cnpj }: any = req.body;

    const URL_TIP = process.env.URL_TIP;
    const TOKEN_TIP = process.env.TOKEN_TIP;

    try {
      // 1️⃣ Buscar todos os planos disponíveis
      const planosResp: any = await axios.get(`${URL_TIP}/planos?user_token=${TOKEN_TIP}`);
      const planos = planosResp.data?.data || [];

      // 2️⃣ Buscar todos os consumos do período
      const consumoBody: any = { periodo };
      if (cpf_cnpj) consumoBody.cpf_cnpj = cpf_cnpj;

      const consumoResp: any = await axios.post(
        `${URL_TIP}/consumo-consolidado?user_token=${TOKEN_TIP}`,
        consumoBody,
        { headers: { "Content-Type": "application/json" } }
      );

      const consumos = consumoResp.data?.results || [];

      // 3️⃣ Montar resultado detalhado por linha
      const resultado = consumos.map((c: any) => {
        // 🔍 Encontrar plano correspondente
        const plano = planos.find((p: any) =>
          p.description.toLowerCase().includes((c.plano || "").toLowerCase().split(" ")[1] || "")
        );

        // 🔢 Limites do plano
        const limite_dados = Number(plano?.quantity?.dados ?? 0); // MB
        const limite_sms = Number(plano?.quantity?.sms ?? 0);
        const limite_minutos = Number(plano?.quantity?.telefonia ?? 0);

        // 📊 Consumo real
        const consumo_dados_gb = Number(c.consumo_dados ?? 0);
        const consumo_dados_mb = consumo_dados_gb * 1024; // GB → MB
        const consumo_sms = Number(c.consumo_sms ?? 0);
        const consumo_minutos = Number(c.consumo_minutos ?? 0) || Number(c.consumo_segundos ?? 0) / 60;

        // 🔁 Percentuais
        const percentual_dados = limite_dados > 0 ? ((consumo_dados_mb / limite_dados) * 100).toFixed(2) : "0";
        const percentual_sms = limite_sms > 0 ? ((consumo_sms / limite_sms) * 100).toFixed(2) : "0";
        const percentual_minutos = limite_minutos > 0 ? ((consumo_minutos / limite_minutos) * 100).toFixed(2) : "0";

        return {
          contrato: c.numero_contrato,
          linha: c.linha,
          cliente: c.cliente_nome,
          plano: plano?.description || c.plano,
          limite: {
            dados: `${limite_dados} MB`,
            sms: limite_sms,
            minutos: limite_minutos,
          },
          consumo: {
            dados: `${consumo_dados_mb.toFixed(2)} MB`,
            sms: consumo_sms,
            minutos: consumo_minutos.toFixed(2),
          },
          percentual_consumo: {
            dados: percentual_dados,
            sms: percentual_sms,
            minutos: percentual_minutos,
          },
        };
      });

      // 4️⃣ Somatório geral
      const totalGeral = resultado.reduce(
        (acc: any, item: any) => {
          const dados = parseFloat(String(item.consumo.dados).replace(" MB", "")) || 0;
          const sms = Number(item.consumo.sms) || 0;
          const minutos = Number(item.consumo.minutos) || 0;

          acc.dados += dados;
          acc.sms += sms;
          acc.minutos += minutos;
          return acc;
        },
        { dados: 0, sms: 0, minutos: 0 }
      );

      // 🔒 Garante que são números antes do toFixed()
      const totalDados = Number(totalGeral.dados) || 0;
      const totalSms = Number(totalGeral.sms) || 0;
      const totalMinutos = Number(totalGeral.minutos) || 0;

      return res.status(200).json({
        message: "Consumo detalhado por linha com limites do plano",
        total_geral: {
          dados: `${totalDados.toFixed(2)} MB`,
          sms: totalSms,
          minutos: totalMinutos.toFixed(2),
        },
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
