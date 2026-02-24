import axios from "axios";
import { prisma } from "../../config/PrismaClient";

export default class RecargaController {

    async recarga(req: any, res: any) {

        const urlTip = process.env.URL_TIP;
        const user_token = process.env.TOKEN_TIP;
        const { simcard, cpf, contrato } = req.body;

        const plano_1 = '1Gb';
        const plano_2 = '2Gb';

        if (!urlTip) {
            return res.status(500).json({ message: "URL_TIP não configurada" });
        }

        if (!user_token) {
            return res.status(500).json({ message: "TOKEN_TIP não configurado" });
        }

        if (!simcard) {
            return res.status(400).json({ message: "Simcard é obrigatório" });
        }

        try {
            // 🔍 1. Verificar na InternetWay se existe recarga pendente
            if (cpf && contrato) {
                const checkUrl = 'https://apis.internetway.com.br/consulta_recargas.php';
                const checkBody = {
                    cpf: String(cpf).replace(/\D/g, ''),
                    contrato: String(contrato)
                };

                const checkResponse = await axios.post(checkUrl, checkBody, {
                    headers: {
                        'Usuario': 'integracao',
                        'Senha': 'W@y1z4z!#2024',
                        'Token': 'ac0r3YH4ATzUTyyar36p8dBkpSAYWFfr',
                        'Content-Type': 'application/json'
                    }
                });

                const apiData = checkResponse.data as any;

                if (apiData && apiData["Recargas MVNO"]) {
                    const recargas = apiData["Recargas MVNO"];
                    // Se existe alguma recarga que NÃO está paga e NÃO está cancelada, bloqueia
                    const temPendente = recargas.some((r: any) =>
                        r.pago && r.pago.toUpperCase() === "NAO" &&
                        r.cancelado && r.cancelado.toUpperCase() === "NAO"
                    );

                    if (temPendente) {
                        return res.status(401).json({
                            message: "Já existe uma solicitação de recarga pendente para esta conta. Por favor, realize o pagamento da fatura anterior para solicitar uma nova.",
                            status: 401
                        });
                    }
                }
            }

            // 🔍 2. Consultar última recarga na TIP (Validação de 1 recarga por mês)
            const url = `${urlTip}/simcard/${simcard}/ultima-recarga?user_token=${user_token}`;
            const response = await axios.get(url);
            const result: any = response.data;

            if (result && result.ultima_recarga) {
                const dataUltimaRecarga = new Date(result.ultima_recarga);
                const hoje = new Date();

                const mesmoMes =
                    dataUltimaRecarga.getMonth() === hoje.getMonth() &&
                    dataUltimaRecarga.getFullYear() === hoje.getFullYear();

                if (mesmoMes) return res.status(401).json({
                    message: "Você já possui uma recarga ativa para este mês nesta linha.",
                    status: 401
                });
            }

            // 🔍 3. Verificar se existe recarga pendente no banco local (redundância)
            const recargaPendenteLocal = await prisma.recarga.findFirst({
                where: {
                    simcard: String(simcard),
                    status: "PENDENTE"
                }
            });

            if (recargaPendenteLocal) {
                return res.status(401).json({
                    message: "Já existe uma solicitação de recarga processando para esta linha.",
                    status: 401
                });
            }


            return res.status(201).json({
                message: "Recarga disponivel",
                planos: {
                    plano_1: {
                        plano1: plano_1,
                        valor: '9,90',
                        id: "b9c4830e-151c-955c-1b4c-03545339cb16"
                    },
                    plano_2: {
                        plano2: plano_2,
                        valor: '17,90',
                        id: "aaaaed7b-4980-1f9b-5bfc-beffba50d79d"
                    }
                }
            })

        } catch (error: any) {

            console.error("Erro ao consultar API:", error?.response?.data.message || error.message);

            return res.status(400).json({
                message: error?.response?.data.message,
                status: 400
            });
        }
    }
}