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
class ListAllConnectionController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id_client, token } = req.body;
            const url = process.env.API_PATH;
            // 🔒 Validação básica
            if (!id_client) {
                return res.status(400).json({ error: "id_client é obrigatório" });
            }
            if (!token) {
                return res.status(400).json({ error: "Token de autenticação não enviado" });
            }
            try {
                // 🔗 Chamada à API externa
                const result = yield axios_1.default.get(`${url}api/people/${id_client}/authentications`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Verify-Token": process.env.VERIFY_TOKEN,
                    },
                });
                // ✅ Caso retorne com sucesso
                const data = result.data;
                // Se quiser retornar os dados como estão:
                return res.status(200).json({
                    success: true,
                    count: data.count,
                    connections: data.data.map((item) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h;
                        return ({
                            id: item.id,
                            user: item.user,
                            password: item.password,
                            ipType: item.ipTypeAsText,
                            equipmentUser: item.equipmentUser,
                            equipmentPassword: item.equipmentPassword,
                            serviceProduct: (_a = item.serviceProduct) === null || _a === void 0 ? void 0 : _a.title,
                            connectionType: item.connectionType,
                            contractNumber: (_b = item.contract) === null || _b === void 0 ? void 0 : _b.contract_number,
                            address: {
                                street: (_c = item.peopleAddress) === null || _c === void 0 ? void 0 : _c.street,
                                number: (_d = item.peopleAddress) === null || _d === void 0 ? void 0 : _d.number,
                                neighborhood: (_e = item.peopleAddress) === null || _e === void 0 ? void 0 : _e.neighborhood,
                                city: (_f = item.peopleAddress) === null || _f === void 0 ? void 0 : _f.city,
                                state: (_g = item.peopleAddress) === null || _g === void 0 ? void 0 : _g.state,
                                postalCode: (_h = item.peopleAddress) === null || _h === void 0 ? void 0 : _h.postalCode,
                            },
                            created: item.created,
                            modified: item.modified,
                            active: item.active,
                        });
                    }),
                });
            }
            catch (error) {
                console.error("Erro ao listar conexões:", error.message);
                // 🚨 Tratamento de erro mais robusto
                if (error.response) {
                    return res.status(error.response.status).json({
                        error: true,
                        message: ((_a = error.response.data) === null || _a === void 0 ? void 0 : _a.message) || "Erro ao consultar autenticações",
                        details: error.response.data,
                    });
                }
                return res.status(500).json({
                    error: true,
                    message: "Erro interno ao buscar conexões",
                });
            }
        });
    }
}
exports.default = ListAllConnectionController;
