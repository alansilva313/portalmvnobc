import axios from "axios";
import { limparCpfCnpj } from "../../utils/removePointsDocument";

export default class ListarContratosServicoMvnoController {

    async list(req: any, res: any) {
        const { base, contrato_id, cpf_cnpj } = req.body;

        if (!base || !contrato_id) {
            return res.status(400).json({
                success: false,
                message: "Campos obrigatórios não informados.",
                received: { base, contrato_id }
            });
        }

        const URL_API_EXTERNA = process.env.URL_API_EXTERNA;
        const user = process.env.USER_API_EXTERNA;
        const pass = process.env.AUTH_API_EXTERNA_PASS;
        const token = process.env.TOKEN_API_EXTERNA;

        const URL_TIP = process.env.URL_TIP;
        const TOKEN_TIP = process.env.TOKEN_TIP;

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
            const data = { base, contrato_id };

            //
            // CONSULTA TIP
            //
            let url = `${URL_TIP}/assinantes/listar?user_token=${TOKEN_TIP}`;

            if (cpf_cnpj) {
                const documento = limparCpfCnpj(cpf_cnpj);
                url += `&cpf_cnpj=${documento}`;
            }

            const responseTIP: any = await axios.get(url);

            // TIP retorna "results" = array
            const assinantes = responseTIP.data?.results || [];

            // junta TODOS contratos de TODOS assinantes
            const tipContratos = assinantes.flatMap((a: any) => a.contratos || []);

            //
            // CONSULTA MVNO
            //
            const resultMVNO: any = await axios.post(
                `${URL_API_EXTERNA}/contract_services_mvno.php`,
                data,
                {
                    headers: {
                        usuario: user,
                        senha: pass,
                        token: token
                    }
                }
            );

            if (!resultMVNO?.data) {
                return res.status(404).json({
                    success: false,
                    message: "Nenhum contrato encontrado ou falha na resposta da API externa."
                });
            }

            const produtosMVNO = resultMVNO.data.produtos || [];

            // normaliza para comparar dígito por dígito
            const normalize = (v: any) =>
                String(v).trim().replace(/\D/g, "");

            //
            // MERGE (ICCID OU MSISDN ↔ linha_contrato)
            //
            const produtosComStatus = produtosMVNO.map((prod: any) => {
                const iccid = normalize(prod.iccid);
                const linha = normalize(prod.msisdn);

                const encontrado = tipContratos.find((tip: any) => {
                    const sim = normalize(tip.sim_card);
                    const linhaTip = normalize(tip.linha_contrato);

                    return sim === iccid || linhaTip === linha;
                });

                return {
                    ...prod,
                    status_tip: encontrado ? encontrado.status : null,
                    linha_contrato_tip: encontrado ? encontrado.linha_contrato : null,
                    plano_tip: encontrado ? encontrado.plano : null
                };
            });

            return res.status(200).json({
                success: true,
                message: "Listando contrato(s) com sucesso.",
                data: {
                    ...resultMVNO.data,
                    produtos: produtosComStatus
                }
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
