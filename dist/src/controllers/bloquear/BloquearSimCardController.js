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
const PrismaClient_1 = require("../../config/PrismaClient");
class BloquearSimCardController {
    bloqueio(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const { reason, simcard, documento, birthday } = req.body;
            const URL_TIP = process.env.URL_TIP;
            const TOKEN_TIP = process.env.TOKEN_TIP;
            // ✅ Validação básica
            if (!reason || !simcard) {
                return res.status(400).json({
                    message: "Parâmetros obrigatórios não enviados! reason, simcard"
                });
            }
            // ✅ Limpa o número e remove o 55 do início
            let cleanSimcard = String(simcard)
                .replace(/\D/g, "") // remove tudo que não é número
                .replace(/^55/, ""); // remove 55 do começo
            function brToIsoDate(dateBR) {
                const [dia, mes, ano] = dateBR.split("/");
                return `${ano}-${mes}-${dia}`;
            }
            if (!documento || !birthday)
                return res.status(404).json({
                    message: "Falha ao realizar bloqueio, dados necesários para a confirmação não enviados!"
                });
            try {
                yield PrismaClient_1.prisma.bloqueio.create({
                    data: {
                        documento: documento,
                        birthday: new Date(brToIsoDate(birthday)),
                        tipo_bloqueio: String(reason),
                        linha: simcard
                    }
                });
                const data = { reason: String(reason) };
                // ✅ Chamada à API da TIP
                const result = yield axios_1.default.post(`${URL_TIP}/simcard/${cleanSimcard}/bloquear/total?user_token=${TOKEN_TIP}`, data, { timeout: 15000 });
                // ✅ Caso retorne algo inesperado
                if (!result || !result.data) {
                    return res.status(502).json({
                        message: "Resposta inválida da TIP",
                    });
                }
                // ✅ Retorno esperado (STATUS 200)
                return res.status(200).json({
                    msg_usuario: ((_a = result.data) === null || _a === void 0 ? void 0 : _a.msg_usuario) || "Bloqueio realizado com sucesso!",
                    codigo_status_tip: (_c = (_b = result.data) === null || _b === void 0 ? void 0 : _b.codigo_status_tip) !== null && _c !== void 0 ? _c : 0,
                    americanet: result.data || {}
                });
            }
            catch (error) {
                return res.status(((_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.status) || 500).json({
                    message: "Erro ao realizar bloqueio!",
                    details: ((_e = error === null || error === void 0 ? void 0 : error.response) === null || _e === void 0 ? void 0 : _e.data) || error.message
                });
            }
        });
    }
}
exports.default = BloquearSimCardController;
