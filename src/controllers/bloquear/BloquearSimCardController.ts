import axios from "axios";
import { prisma } from "../../config/PrismaClient";

interface ReasonI {
    reason: number;
    simcard: string;
    documento: string;
    birthday: string;
}

export default class BloquearSimCardController {
    async bloqueio(req: any, res: any) {

        const { reason, simcard, documento, birthday }: ReasonI = req.body;

        const URL_TIP = process.env.URL_TIP;
        const TOKEN_TIP = process.env.TOKEN_TIP;

        // ✅ Validação básica
        if (!reason || !simcard) {
            return res.status(400).json({
                message: "Parâmetros obrigatórios não enviados! reason, simcard"
            });
        }

        // ✅ Limpa o número e remove o 55 do início
        let cleanSimcard = String(simcard)
            .replace(/\D/g, "") // remove tudo que não é número
            .replace(/^55/, ""); // remove 55 do começo


            function brToIsoDate(dateBR: string) {
                const [dia, mes, ano] = dateBR.split("/");
                return `${ano}-${mes}-${dia}`;
                }



            if(!documento || !birthday) return res.status(404).json({
                message: "Falha ao realizar bloqueio, dados necesários para a confirmação não enviados!"
            })

        try {


            await prisma.bloqueio.create({
                data: {
                    documento: documento,
                    birthday: new Date(brToIsoDate(birthday)),
                    tipo_bloqueio: String(reason),
                    linha: simcard
                }
                });

            const data = { reason: String(reason) };

            // ✅ Chamada à API da TIP
            const result: any = await axios.post(
                `${URL_TIP}/simcard/${cleanSimcard}/bloquear/total?user_token=${TOKEN_TIP}`,
                data,
                { timeout: 15000 }
            );

            // ✅ Caso retorne algo inesperado
            if (!result || !result.data) {
                return res.status(502).json({
                    message: "Resposta inválida da TIP",
                });
            }

            // ✅ Retorno esperado (STATUS 200)
            return res.status(200).json({
                msg_usuario: result.data?.msg_usuario || "Bloqueio realizado com sucesso!",
                codigo_status_tip: result.data?.codigo_status_tip ?? 0,
                americanet: result.data || {}
            });

        } catch (error: any) {
          

            return res.status(error?.response?.status || 500).json({
                message: "Erro ao realizar bloqueio!",
                details: error?.response?.data || error.message
            });
        }
    }
}
