import axios from "axios";

export default class ListContratoMvnoController {
    async listenerCount(req: any, res: any) {
        const { cpf, base, empresa } = req.body;

        // ✅ Validação dos dados recebidos
        if (!cpf || !base || !empresa) {
            return res.status(400).json({
                success: false,
                message: "Campos obrigatórios não informados.",
                received: { cpf, base, empresa }
            });
        }

        const URL_API_EXTERNA = process.env.URL_API_EXTERNA;
        const user = process.env.USER_API_EXTERNA;
        const pass = process.env.AUTH_API_EXTERNA_PASS;
        const token = process.env.TOKEN_API_EXTERNA;

        // ✅ Validação das variáveis de ambiente
        if (!URL_API_EXTERNA || !user || !pass || !token) {
            return res.status(500).json({
                success: false,
                message: "Configurações da API externa não estão completas.",
                missing: {
                    URL_API_EXTERNA: !URL_API_EXTERNA,
                    USER_API_EXTERNA: !user,
                    AUTH_API_EXTERNA_PASS: !pass,
                    TOKEN_API_EXTERNA: !token
                }
            });
        }

        try {
            const data = { cpf, base, empresa };

            const result = await axios.post(`${URL_API_EXTERNA}/contracts_mvno_per_client.php`, data, {
                headers: {
                    usuario: user,
                    senha: pass,
                    token: token
                }
            });

            // ✅ Validação do retorno da API externa
            if (!result || !result.data) {
                return res.status(404).json({
                    success: false,
                    message: "Nenhum contrato encontrado ou falha na resposta da API externa."
                });
            }

            return res.status(200).json({
                success: true,
                message: "Listando contrato(s) com sucesso.",
                data: result.data
            });

        } catch (error: any) {
            console.error("Erro ao listar contrato MVNO:", error?.response?.data || error.message);

            return res.status(500).json({
                success: false,
                message: "Erro ao listar contrato MVNO.",
                error: error?.response?.data || error.message
            });
        }
    }
}
