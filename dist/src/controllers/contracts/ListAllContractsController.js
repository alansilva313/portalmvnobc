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
class ListAllContractsController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // pode vir de req.body ou req.params dependendo da rota
            const { id_client, token } = req.body;
            const url = process.env.API_PATH;
            if (!id_client) {
                return res.status(400).json({ error: "id_client é obrigatório" });
            }
            ;
            if (!token) {
                return res.status(400).json({ error: "Dados de aunteticação não enviado" });
            }
            ;
            try {
                const result = yield axios_1.default.get(`${url}api/people/${id_client}/contracts`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Verify-Token": process.env.VERIFY_TOKEN,
                    },
                });
                // Retorna o resultado da API
                return res.status(200).json(result.data);
            }
            catch (error) {
                console.error("Erro ao buscar contratos:", error.message);
                // Se a API retornar erro, devolve o status e a mensagem
                if (error.response) {
                    return res
                        .status(error.response.status)
                        .json({ error: error.response.data });
                }
                return res.status(500).json({ error: "Erro interno ao buscar contratos" });
            }
        });
    }
}
exports.default = ListAllContractsController;
