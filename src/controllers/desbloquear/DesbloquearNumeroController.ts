import axios from "axios";

interface DesbloqueioI {
    simcard: string;
}

export default class DesbloquearSimCardController {
    async desbloqueio(req: any, res: any) {

        const { simcard }: DesbloqueioI = req.body;

        const URL_TIP = process.env.URL_TIP;
        const TOKEN_TIP = process.env.TOKEN_TIP;

        // ✅ Validação básica
        if (!simcard) {
            return res.status(400).json({
                message: "Parâmetro obrigatório não enviado! simcard"
            });
        }

        // ✅ Limpa o número e remove o 55 do início
        let cleanSimcard = String(simcard)
            .replace(/\D/g, "")   // remove não numéricos
            .replace(/^55/, "");  // remove 55 no início

        try {
            // ✅ Chamada à API
            const result: any = await axios.post(
                `${URL_TIP}/simcard/${cleanSimcard}/desbloquear?user_token=${TOKEN_TIP}`);

            // ✅ Caso retorne algo inesperado
            if (!result || !result.data) {
                return res.status(502).json({
                    message: "Resposta inválida da TIP",
                });
            }

            // ✅ Retorno esperado (STATUS 200)
            return res.status(200).json({
                msg_usuario: result.data?.msg_usuario || "Desbloqueio realizado com sucesso!",
                codigo_status_tip: result.data?.codigo_status_tip ?? 0,
                americanet: result.data || {}
            });

        } catch (error: any) {
            console.error("Erro ao desbloquear SIMCARD:", error);

            return res.status(error?.response?.status || 500).json({
                message: "Erro ao realizar desbloqueio!",
                details: error?.response?.data || error.message
            });
        }
    }
}
