import axios from "axios";
import returnToken from "../../auth/returnToken";
import { prisma } from "../../config/PrismaClient";

export default class GerarFaturaController {

    async gerar(req: any, res: any) {

        const { item_id, plano, document, contractNumber, simcard, msisdn } = req.body;

        if (!plano || !document || !contractNumber || !item_id || !simcard || !msisdn) {
            return res.status(400).json({
                message: "Dados obrigatórios não informados"
            });
        }

        const valorPlano = Number(plano);
        if (valorPlano !== 9.90 && valorPlano !== 17.90) {
            return res.status(400).json({
                message: "Valor do plano não permitido. Apenas 9.90 e 17.90 são aceitos."
            });
        }



        const tokenERP = await returnToken()

        const tokenBearer = `Bearer ${tokenERP}`

        console.log(tokenBearer)

        try {

            const body = {
                companyPlaceTxId: "11.372.464/0001-45",
                clientTxId: document,
                contractNumber: contractNumber,
                priceListId: "76df0ffd-62ba-2e52-1a0f-ac91f3728041",
                financialCollectionTypeId: "ef2ad5c1-0a98-cf32-cd48-37c3f2e85f5f",
                paymentConditionId: "97726c72-44fb-4df5-b7e6-e5ab18beba17",
                items: [
                    {
                        id: item_id,
                        quantity: 1,
                        unitValue: valorPlano
                    }
                ]
            };

            const response: any = await axios.post(
                "https://erp.internetway.com.br:45715/external/integrations/thirdparty/salerequest",
                body,
                {
                    headers: {
                        accept: "application/json",
                        Authorization: String(tokenBearer),
                        "Content-Type": "application/json"
                    }
                }
            );

            // Salvar no banco de dados local
            await prisma.recarga.create({
                data: {
                    simcard,
                    msisdn,
                    item_id,
                    plano: String(plano),
                    documento: document,
                    contractNumber: String(contractNumber),
                    status: "PENDENTE",
                    external_id: String(response.data?.response?.salesOrderNumber || response.data?.id || response.data?.txId || "")
                }
            });

            return res.status(200).json(response.data);

        } catch (error: any) {



            return res.status(500).json({
                message: error?.response?.data || "Erro ao gerar fatura"
            });
        }
    }
}