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
class ListAssinanteController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { cpf_cnpj } = req.body; // vem no body
            const URL_TIP = process.env.URL_TIP;
            const TOKEN_TIP = process.env.TOKEN_TIP;
            try {
                // Monta a URL base com o token obrigatório
                let url = `${URL_TIP}/assinantes/listar?user_token=${TOKEN_TIP}`;
                // Se o cpf_cnpj existir, limpa e adiciona como query param
                if (cpf_cnpj) {
                    const documento = (0, removePointsDocument_1.limparCpfCnpj)(cpf_cnpj);
                    url += `&cpf_cnpj=${documento}`;
                }
                // Faz a requisição (sem body, pois é por query param)
                const response = yield axios_1.default.get(url);
                return res.status(200).json({
                    message: "Assinantes listados com sucesso",
                    data: response.data,
                });
            }
            catch (error) {
                console.error("Erro ao listar assinantes:", error.message);
                return res.status(500).json({
                    message: "Erro ao listar assinantes",
                    error: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message,
                });
            }
        });
    }
}
exports.default = ListAssinanteController;
