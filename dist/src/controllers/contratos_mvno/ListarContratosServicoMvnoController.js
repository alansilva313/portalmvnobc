"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const removePointsDocument_1 = require("../../utils/removePointsDocument");
class ListarContratosServicoMvnoController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
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
                    const documento = (0, removePointsDocument_1.limparCpfCnpj)(cpf_cnpj);
                    url += `&cpf_cnpj=${documento}`;
                }
                const responseTIP = yield axios_1.default.get(url);
                // TIP retorna "results" = array
                const assinantes = ((_a = responseTIP.data) === null || _a === void 0 ? void 0 : _a.results) || [];
                // junta TODOS contratos de TODOS assinantes
                const tipContratos = assinantes.flatMap((a) => a.contratos || []);
                //
                // CONSULTA MVNO
                //
                const resultMVNO = yield axios_1.default.post(`${URL_API_EXTERNA}/contract_services_mvno.php`, data, {
                    headers: {
                        usuario: user,
                        senha: pass,
                        token: token
                    }
                });
                if (!(resultMVNO === null || resultMVNO === void 0 ? void 0 : resultMVNO.data)) {
                    return res.status(404).json({
                        success: false,
                        message: "Nenhum contrato encontrado ou falha na resposta da API externa."
                    });
                }
                const produtosMVNO = resultMVNO.data.produtos || [];
                // normaliza para comparar dígito por dígito
                const normalize = (v) => String(v).trim().replace(/\D/g, "");
                //
                // MERGE (ICCID OU MSISDN ↔ linha_contrato)
                //
                const produtosComStatus = produtosMVNO.map((prod) => {
                    const iccid = normalize(prod.iccid);
                    const linha = normalize(prod.msisdn);
                    const encontrado = tipContratos.find((tip) => {
                        const sim = normalize(tip.sim_card);
                        const linhaTip = normalize(tip.linha_contrato);
                        return sim === iccid || linhaTip === linha;
                    });
                    return Object.assign(Object.assign({}, prod), { status_tip: encontrado ? encontrado.status : null, linha_contrato_tip: encontrado ? encontrado.linha_contrato : null, plano_tip: encontrado ? encontrado.plano : null });
                });
                return res.status(200).json({
                    success: true,
                    message: "Listando contrato(s) com sucesso.",
                    data: Object.assign(Object.assign({}, resultMVNO.data), { produtos: produtosComStatus })
                });
            }
            catch (error) {
                console.error("Erro ao listar contrato MVNO:", ((_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
                return res.status(500).json({
                    success: false,
                    message: "Erro ao listar contrato MVNO.",
                    error: ((_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message
                });
            }
        });
    }
}
exports.default = ListarContratosServicoMvnoController;
