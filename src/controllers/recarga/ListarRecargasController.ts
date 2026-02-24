import axios from "axios";
import { prisma } from "../../config/PrismaClient";

export default class ListarRecargasController {
    async listar(req: any, res: any) {
        const { documento, contrato, simcard, status } = req.body;

        try {
            // 1. Buscar recargas no banco local
            const recargasLocais = await prisma.recarga.findMany({
                where: {
                    documento: documento ? String(documento) : undefined,
                    simcard: simcard ? String(simcard) : undefined,
                    status: status ? String(status) : undefined,
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            // 2. Se tivermos documento e contrato, buscar dados atualizados na InternetWay
            if (documento && contrato) {
                const checkUrl = 'https://apis.internetway.com.br/consulta_recargas.php';
                const checkBody = {
                    cpf: String(documento).replace(/\D/g, ''),
                    contrato: String(contrato)
                };

                try {
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
                        const recargasAPI = apiData["Recargas MVNO"];

                        // Mesclar dados da API com os dados locais
                        const recargasMescladas = recargasLocais.map(local => {
                            // Tentar encontrar o pedido correspondente na API
                            const correspondente = recargasAPI.find((r: any) =>
                                String(r.pedido_venda) === local.external_id
                            );

                            if (correspondente) {
                                return {
                                    ...local,
                                    status: correspondente.pago.toUpperCase() === "SIM" ? "CONCLUIDO" :
                                        correspondente.cancelado.toUpperCase() === "SIM" ? "CANCELADO" : "PENDENTE",
                                    linha_digitavel: correspondente.linha_digitavel,
                                    qr_codepix: correspondente.qr_codepix,
                                    notificado: correspondente.notificado,
                                    v_final_amount: correspondente.v_final_amount
                                };
                            }

                            return local;
                        });

                        return res.status(200).json(recargasMescladas);
                    }
                } catch (apiError) {
                    console.error("Erro ao consultar API externa de recargas:", apiError);
                    // Em caso de erro na API externa, retorna os dados locais mesmo
                }
            }

            return res.status(200).json(recargasLocais);

        } catch (error: any) {
            console.error("Erro ao listar recargas:", error);
            return res.status(500).json({
                message: "Erro interno ao listar as recargas.",
                error: error.message
            });
        }
    }
}
