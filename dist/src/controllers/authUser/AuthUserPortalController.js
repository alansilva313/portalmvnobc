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
class AuthUserPortalController {
    auth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            const verify_token = process.env.VERIFY_TOKEN;
            const client_id = process.env.CLIENT_ID;
            const client_secret = process.env.CLIENT_SECRET_P;
            const grant_type = process.env.GRANT_TYPE;
            const api_path = process.env.API_PATH;
            if (!verify_token || !client_id || !client_secret || !grant_type || !api_path)
                return res.status(401).json({
                    message: "Falha na autenticação, verifique e tente novamente!",
                    statusCode: 401
                });
            if (!username || !password)
                return res.status(401).json({
                    message: "Usuário ou senha inválidos, tente novamente!",
                    statusCode: 401
                });
            try {
                const result = yield axios_1.default.get(`${api_path}portal_authentication?verify_token=${verify_token}&client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}&username=${username}&password=${password}`);
                if (!result)
                    return res.status(404).json({
                        message: "Não foi possivel conectar com o servidor",
                        statusCode: 404
                    });
                return res.status(200).json({
                    message: "Autenticado com sucesso!",
                    data: result.data
                });
            }
            catch (error) {
                return res.status(404).json({
                    message: error.message || "Falha ao conectar!",
                    statusCode: 404
                });
            }
        });
    }
}
exports.default = AuthUserPortalController;
