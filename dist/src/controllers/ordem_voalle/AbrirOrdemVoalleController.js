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
const ListarEtiquetasController_1 = __importDefault(require("../etiquetas/ListarEtiquetasController"));
class AbrirordemVoalleController {
    criarOrdemVoalle(clientId, contractServiceTagId, motivo, document) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const tag = yield new ListarEtiquetasController_1.default().list(document, contractServiceTagId);
            if (!tag)
                return [];
            const body = {
                incidentStatusId: 4,
                personId: "219945",
                clientId: clientId,
                incidentTypeId: String(process.env.CATEGORIA_T_PRODUCAO),
                contractServiceTagId: String(contractServiceTagId),
                contractServiceTagCategory: String(tag.tag),
                catalogServiceId: String(process.env.CATEGORIA_C_PRODUCAO),
                serviceLevelAgreementId: 101,
                assignment: {
                    title: "Bloqueio de linha",
                    description: `Bloqueio de linha, via portal MVNO - motivo ${motivo}`,
                    priority: 0,
                    beginningDate: "",
                    finalDate: "",
                    report: {
                        beginningDate: "",
                        finalDate: "",
                        description: `Cliente realizou o bloqueio da linha via portal com o motivo de ${motivo}` //Descrição
                    },
                    companyPlaceId: 1
                },
                solicitationServiceCategory1: String(process.env.CATEGORIA_1_PRODUCAO),
                solicitationServiceCategory2: String(process.env.CATEGORIA_2_PRODUCAO),
                solicitationServiceCategory3: String(process.env.CATEGORIA_3_PRODUCAO),
                solicitationServiceCategory4: String(process.env.CATEGORIA_4_PRODUCAO),
                solicitationServiceCategory5: String(process.env.CATEGORIA_5_PRODUCAO),
            };
            try {
                const token = yield new token_1.default().getToken();
                const result = yield axios_1.default.post("https://erp.internetway.com.br:45715/external/integrations/thirdparty/opendetailedsolicitation", body, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                const data = result.data;
                if (!(data === null || data === void 0 ? void 0 : data.success) || !((_a = data.response) === null || _a === void 0 ? void 0 : _a.protocol)) {
                    return ({ message: 'Erro ao criar solicitação.', detalhe: data });
                }
                return ({
                    message: "Solicitação criada com sucesso!",
                    protocolo: data.response.protocol,
                    assignmentId: data.response.assignmentId
                });
            }
            catch (error) {
                console.error("Erro ao criar solicitação:", (error === null || error === void 0 ? void 0 : error.message) || error);
                return ({
                    message: 'Erro ao criar solicitação.',
                    error: (error === null || error === void 0 ? void 0 : error.message) || error
                });
            }
        });
    }
}
exports.default = AbrirordemVoalleController;
