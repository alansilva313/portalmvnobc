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
function extrairGbDaDescricao(descricao) {
    const regex = /(\d+)\s*gb?/gi;
    const matches = descricao.match(regex);
    if (!matches)
        return [];
    return matches.map((item) => Number(item.replace(/gb?/i, "").trim()));
}
class ListAllConsumoController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const { periodo, cpf_cnpj, numero_contrato, linha_contrato, portabilidade } = req.body;
            const URL_TIP = process.env.URL_TIP;
            const TOKEN_TIP = process.env.TOKEN_TIP;
            const documento = (0, removePointsDocument_1.limparCpfCnpj)(cpf_cnpj);
            console.log("📌 Portabilidade recebida:", portabilidade);
            try {
                const data = { periodo };
                if (cpf_cnpj)
                    data.cpf_cnpj = documento;
                if (numero_contrato)
                    data.numero_contrato = numero_contrato;
                if (linha_contrato)
                    data.linha_contrato = linha_contrato;
                // 🔹 Consumo
                const response = yield axios_1.default.post(`${URL_TIP}/consumo-consolidado?user_token=${TOKEN_TIP}`, data);
                // 🔹 Planos
                const result = yield axios_1.default.get(`${URL_TIP}/planos?user_token=${TOKEN_TIP}`);
                // 🔹 Tenta buscar nos dois formatos possíveis
                const consumos = ((_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.results) || ((_c = response.data) === null || _c === void 0 ? void 0 : _c.results) || [];
                const planos = ((_d = result.data) === null || _d === void 0 ? void 0 : _d.data) || result.data || [];
                // 🔹 Faz o join
                const consumosComPlano = consumos.map((consumo) => {
                    var _a, _b, _c, _d;
                    const idPlano = Number(consumo.id_plano);
                    const planoRelacionado = planos.find((p) => Number(p.id) === idPlano);
                    if (!planoRelacionado) {
                        console.warn("⚠️ Nenhum plano encontrado para id:", idPlano);
                        return Object.assign(Object.assign({}, consumo), { plano_detalhes: null });
                    }
                    // ==========================================
                    // 🔥 EXTRAI OS GB DA DESCRIÇÃO
                    // ==========================================
                    const valoresGb = extrairGbDaDescricao(planoRelacionado.description);
                    const primeiroGb = (_a = valoresGb[0]) !== null && _a !== void 0 ? _a : 0; // ex: 5GB
                    const adicionalGb = (_b = valoresGb[1]) !== null && _b !== void 0 ? _b : 0; // ex: 3GB
                    // converter para MB
                    const primeiroMb = primeiroGb * 1024;
                    const adicionalMb = adicionalGb * 1024;
                    // ==========================================
                    // 🔥 REGRA FINAL
                    // Se portabilidade = "Sim" → soma
                    // Se portabilidade = "Não" → pega só o primeiro valor
                    // ==========================================
                    const limiteDados = (portabilidade === null || portabilidade === void 0 ? void 0 : portabilidade.toLowerCase()) === "sim"
                        ? primeiroMb + adicionalMb
                        : primeiroMb;
                    const limiteSMS = Number(((_c = planoRelacionado.quantity) === null || _c === void 0 ? void 0 : _c.sms) || 0);
                    const limiteVoz = Number(((_d = planoRelacionado.quantity) === null || _d === void 0 ? void 0 : _d.telefonia) || 0);
                    const usoDados = Number(consumo.consumo_dados || 0);
                    const usoSMS = Number(consumo.consumo_sms || 0);
                    const usoVoz = Number(consumo.consumo_minutos || 0);
                    return Object.assign(Object.assign({}, consumo), { plano_detalhes: {
                            id_plano: planoRelacionado.id,
                            descricao_plano: planoRelacionado.description,
                            rede: planoRelacionado.rede,
                            limites: {
                                dados_total_mb: limiteDados, // 👈 AQUI A REGRA FUNCIONA!
                                sms_total: limiteSMS,
                                voz_total_min: limiteVoz,
                            },
                            uso: {
                                dados_usados_mb: usoDados,
                                sms_usados: usoSMS,
                                voz_usada_min: usoVoz,
                            },
                            percentual_uso: {
                                dados: limiteDados > 0 ? Number(((usoDados / limiteDados) * 100).toFixed(2)) : 0,
                                sms: limiteSMS > 0 ? Number(((usoSMS / limiteSMS) * 100).toFixed(2)) : 0,
                                voz: limiteVoz > 0 ? Number(((usoVoz / limiteVoz) * 100).toFixed(2)) : 0,
                            },
                        } });
                });
                return res.status(200).json({
                    message: "Listando consumo com sucesso",
                    data: consumosComPlano,
                });
            }
            catch (error) {
                console.error("❌ Erro ao listar consumo:", error.message);
                return res.status(500).json({
                    message: "Erro ao listar consumo",
                    error: ((_e = error.response) === null || _e === void 0 ? void 0 : _e.data) || error.message,
                });
            }
        });
    }
}
exports.default = ListAllConsumoController;
