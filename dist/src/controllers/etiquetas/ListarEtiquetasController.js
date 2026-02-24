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
const token_1 = __importDefault(require("../../service/token"));
class ListarEtiquetasController {
    list(document, contract) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx_id = document;
            try {
                const token = yield new token_1.default().getToken();
                const result = yield axios_1.default.get(`https://erp.internetway.com.br:45715/external/integrations/thirdparty/servicetagsinfopaged?txId=${tx_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                const response = result.data.response;
                if (!(response === null || response === void 0 ? void 0 : response.data)) {
                    return false;
                }
                // FILTRA (convertendo contrato para número)
                const filtrado = response.data.filter((item) => item.contractId === Number(contract));
                console.log(filtrado);
                return {
                    tag: filtrado[0].tag
                };
            }
            catch (error) {
                return false;
            }
        });
    }
}
exports.default = ListarEtiquetasController;
