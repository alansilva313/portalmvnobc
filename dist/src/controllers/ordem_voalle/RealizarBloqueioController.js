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
const AbrirOrdemVoalleController_1 = __importDefault(require("./AbrirOrdemVoalleController"));
class RealizarBloqueio {
    bloq(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { clientId, contractServiceTagId, motivo, document } = req.body;
            if (!clientId || !motivo || !contractServiceTagId)
                return res.status(400).json({
                    message: "Dados obrigatorios não enviados!"
                });
            try {
                const result = new AbrirOrdemVoalleController_1.default().criarOrdemVoalle(clientId, contractServiceTagId, motivo, document);
                return res.status(200).json(Object.assign({ message: "Ordem aberta com sucesso!" }, result));
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({
                    message: "Ocorreu algum erro ao realizar abertura da ordem!"
                });
            }
        });
    }
}
exports.default = RealizarBloqueio;
