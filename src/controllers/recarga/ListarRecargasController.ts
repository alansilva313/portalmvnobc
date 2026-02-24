import axios from "axios";
import { prisma } from "../../config/PrismaClient";

export default class ListarRecargasController {
    async listar(req: any, res: any) {
        const { documento, contrato, simcard, status } = req.body;

        const localDateFromTitle = (title: string) => {
            if (!title) return new Date().toISOString();

            // Caso 1: DD/MM/YYYY
            const matchBR = title.match(/(\d{2})\/(\d{2})\/(\d{4})/);
            if (matchBR) {
                const [_, day, month, year] = matchBR;
                return new Date(`${year}-${month}-${day}`).toISOString();
            }

            // Caso 2: FATYYMMDD (Ex: FAT260224...)
            const matchFAT = title.match(/FAT(\d{2})(\d{2})(\d{2})/);
            if (matchFAT) {
                const [_, yearShort, month, day] = matchFAT;
                const year = `20${yearShort}`;
                return new Date(`${year}-${month}-${day}`).toISOString();
            }

            return new Date().toISOString();
        };

        try {
            // 1. Buscar recargas no banco local
            const recargasLocais = await prisma.recarga.findMany({
                where: {
                    documento: documento ? String(documento) : undefined,
                    contractNumber: contrato ? String(contrato) : undefined,
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

                        // 1. Criar um Set de external_ids das recargas locais para facilitar a identificação
                        const localExternalIds = new Set(recargasLocais.map(l => l.external_id).filter(Boolean));

                        // 2. Mapear as recargas locais com dados da API
                        const recargasMescladas = recargasLocais.map(local => {
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
                                    v_final_amount: correspondente.v_final_amount,
                                    description: correspondente.description
                                };
                            }
                            return local;
                        });

                        // 3. Adicionar recargas da API que NÃO estão no banco local e pertencem ao contrato atual
                        const novasDaAPI = recargasAPI
                            .filter((r: any) =>
                                !localExternalIds.has(String(r.pedido_venda)) &&
                                String(r.contract_number) === String(contrato)
                            )
                            .map((r: any) => ({
                                id: `api-${r.pedido_venda}`,
                                simcard: "", // Não temos no ERP diretamente as vezes
                                msisdn: "",
                                item_id: "",
                                plano: r.v_final_amount || r.title_amount,
                                documento: r.tx_id,
                                contractNumber: r.contract_number,
                                status: r.pago.toUpperCase() === "SIM" ? "CONCLUIDO" :
                                    r.cancelado.toUpperCase() === "SIM" ? "CANCELADO" : "PENDENTE",
                                external_id: String(r.pedido_venda),
                                created_at: localDateFromTitle(r.title), // Tentar extrair data do título se possível
                                updated_at: new Date().toISOString(),
                                linha_digitavel: r.linha_digitavel,
                                qr_codepix: r.qr_codepix,
                                description: r.description
                            }));

                        const resultadoFinal = [...recargasMescladas, ...novasDaAPI].sort((a: any, b: any) =>
                            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                        );

                        return res.status(200).json(resultadoFinal);
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
