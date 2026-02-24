import { prisma } from "../../config/PrismaClient";

export default class ConfirmarPagamentoController {
    async confirmar(req: any, res: any) {
        const { simcard, external_id } = req.body;

        if (!simcard && !external_id) {
            return res.status(400).json({
                message: "Simcard ou External ID é obrigatório para confirmar o pagamento."
            });
        }

        try {
            // Buscar a recarga pendente
            const recarga = await prisma.recarga.findFirst({
                where: {
                    OR: [
                        { simcard: simcard ? String(simcard) : undefined },
                        { external_id: external_id ? String(external_id) : undefined }
                    ],
                    status: "PENDENTE"
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            if (!recarga) {
                return res.status(404).json({
                    message: "Nenhuma recarga pendente encontrada com os dados informados."
                });
            }

            // Atualizar status para CONCLUIDO
            await prisma.recarga.update({
                where: { id: recarga.id },
                data: { status: "CONCLUIDO" }
            });

            return res.status(200).json({
                message: "Pagamento confirmado e status da recarga atualizado com sucesso!",
                recarga: recarga
            });

        } catch (error: any) {
            console.error("Erro ao confirmar pagamento:", error);
            return res.status(500).json({
                message: "Erro interno ao confirmar o pagamento.",
                error: error.message
            });
        }
    }
}
