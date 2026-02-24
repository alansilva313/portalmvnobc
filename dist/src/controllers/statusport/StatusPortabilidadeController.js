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
class StatusPortabilidadeController {
    port(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { simcard } = req.body;
            const URL_MVNO = process.env.URL_MVNO;
            const TOKEN_TIP = process.env.TOKEN_TIP;
            if (!simcard)
                return res.status(404).json({
                    message: "Status de portabilidade não encontrado!",
                    statusCode: 404
                });
            try {
                const result = yield axios_1.default.get(`${URL_MVNO}/${simcard}?user_token=${TOKEN_TIP}`);
                if (!result)
                    return res.status(404).json({
                        message: "Erro ao listar status de portabilidade!"
                    });
                return res.status(200).json(Object.assign({ message: "Listando status de portabilidade" }, result.data));
            }
            catch (error) {
                return res.status(400).json({
                    message: "Simcard ou Numero não existe"
                });
            }
        });
    }
}
exports.default = StatusPortabilidadeController;
