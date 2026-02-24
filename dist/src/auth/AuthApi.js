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
const qs_1 = __importDefault(require("qs"));
class AuthApivoalleController {
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const ambiente = process.env.VOALLE_AMBIENTE || "STAGING"; // Use uma variável de ambiente para definir o ambiente
            const url = ambiente === "PRODUCAO" ? process.env.URL_VOALLE : process.env.URL_VOALLE_STAGING;
            if (!url) {
                console.error("URL_VOALLE não definida.");
                return false;
            }
            const configs = {
                PRODUCAO: {
                    grant_type: process.env.GRANT_TYPE,
                    scope: process.env.SCOPE,
                    client_id: process.env.CLIENT_ID_VOALLE,
                    client_secret: process.env.CLIENT_SECRET_VOALLE,
                    syndata: process.env.SYNDATA_VOALLE
                },
                STAGING: {
                    grant_type: process.env.GRANT_TYPE_STAGING,
                    scope: process.env.SCOPE_STAGING,
                    client_id: process.env.CLIENT_ID_VOALLE_STAGING,
                    client_secret: process.env.CLIENT_SECRET_VOALLE_STAGING,
                    syndata: process.env.SYNDATA_VOALLE_STAGING
                }
            };
            const data = configs[ambiente];
            if (!data) {
                console.error(`Configuração para ambiente '${ambiente}' não encontrada.`);
                return false;
            }
            try {
                const response = yield axios_1.default.post(url, qs_1.default.stringify(data), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                const accessToken = (_a = response.data) === null || _a === void 0 ? void 0 : _a.access_token;
                if (!accessToken) {
                    console.error("Token não encontrado na resposta.");
                    return false;
                }
                return accessToken;
            }
            catch (error) {
                console.error("Erro ao obter token:", error.message);
                return false;
            }
        });
    }
}
exports.default = AuthApivoalleController;
