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
class ListContratoMvnoController {
    listenerCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
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
                const result = yield axios_1.default.post(`${URL_API_EXTERNA}/contracts_mvno_per_client.php`, data, {
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
            }
            catch (error) {
                console.error("Erro ao listar contrato MVNO:", ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                return res.status(500).json({
                    success: false,
                    message: "Erro ao listar contrato MVNO.",
                    error: ((_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message
                });
            }
        });
    }
}
exports.default = ListContratoMvnoController;
