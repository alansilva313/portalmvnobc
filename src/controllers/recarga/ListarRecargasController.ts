import { prisma } from "../../config/PrismaClient";

export default class ListarRecargasController {
    async listar(req: any, res: any) {
        const { documento, simcard, status } = req.body;

        try {
            const recargas = await prisma.recarga.findMany({
                where: {
                    documento: documento ? String(documento) : undefined,
                    simcard: simcard ? String(simcard) : undefined,
                    status: status ? String(status) : undefined,
                },
                orderBy: {
                    created_at: 'desc'
                }
            });

            return res.status(200).json(recargas);

        } catch (error: any) {
            console.error("Erro ao listar recargas:", error);
            return res.status(500).json({
                message: "Erro interno ao listar as recargas.",
                error: error.message
            });
        }
    }
}
