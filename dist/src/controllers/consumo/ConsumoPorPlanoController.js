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
class ConsumoDetalhadoController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const { periodo, cpf_cnpj } = req.body;
            const URL_TIP = process.env.URL_TIP;
            const TOKEN_TIP = process.env.TOKEN_TIP;
            try {
                // 1️⃣ Buscar todos os planos disponíveis
                const planosResp = yield axios_1.default.get(`${URL_TIP}/planos?user_token=${TOKEN_TIP}`);
                const planos = ((_a = planosResp.data) === null || _a === void 0 ? void 0 : _a.data) || [];
                console.log(planosResp);
                // 2️⃣ Buscar todos os consumos do período
                const consumoBody = { periodo };
                if (cpf_cnpj)
                    consumoBody.cpf_cnpj = cpf_cnpj;
                const consumoResp = yield axios_1.default.post(`${URL_TIP}/consumo-consolidado?user_token=${TOKEN_TIP}`, consumoBody, { headers: { "Content-Type": "application/json" } });
                const consumos = ((_b = consumoResp.data) === null || _b === void 0 ? void 0 : _b.results) || [];
                console.log(consumos);
                // 3️⃣ Montar resultado detalhado por linha
                const resultado = consumos.map((c) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                    // 🔍 Encontrar plano correspondente
                    const plano = planos.find((p) => p.description.toLowerCase().includes((c.plano || "").toLowerCase().split(" ")[1] || ""));
                    // 🔢 Limites do plano
                    const limite_dados = Number((_b = (_a = plano === null || plano === void 0 ? void 0 : plano.quantity) === null || _a === void 0 ? void 0 : _a.dados) !== null && _b !== void 0 ? _b : 0); // MB
                    const limite_sms = Number((_d = (_c = plano === null || plano === void 0 ? void 0 : plano.quantity) === null || _c === void 0 ? void 0 : _c.sms) !== null && _d !== void 0 ? _d : 0);
                    const limite_minutos = Number((_f = (_e = plano === null || plano === void 0 ? void 0 : plano.quantity) === null || _e === void 0 ? void 0 : _e.telefonia) !== null && _f !== void 0 ? _f : 0);
                    // 📊 Consumo real
                    const consumo_dados_gb = Number((_g = c.consumo_dados) !== null && _g !== void 0 ? _g : 0);
                    const consumo_dados_mb = consumo_dados_gb * 1024; // GB → MB
                    const consumo_sms = Number((_h = c.consumo_sms) !== null && _h !== void 0 ? _h : 0);
                    const consumo_minutos = Number((_j = c.consumo_minutos) !== null && _j !== void 0 ? _j : 0) || Number((_k = c.consumo_segundos) !== null && _k !== void 0 ? _k : 0) / 60;
                    // 🔁 Percentuais
                    const percentual_dados = limite_dados > 0 ? ((consumo_dados_mb / limite_dados) * 100).toFixed(2) : "0";
                    const percentual_sms = limite_sms > 0 ? ((consumo_sms / limite_sms) * 100).toFixed(2) : "0";
                    const percentual_minutos = limite_minutos > 0 ? ((consumo_minutos / limite_minutos) * 100).toFixed(2) : "0";
                    return {
                        contrato: c.numero_contrato,
                        linha: c.linha,
                        cliente: c.cliente_nome,
                        plano: (plano === null || plano === void 0 ? void 0 : plano.description) || c.plano,
                        limite: {
                            dados: `${limite_dados} MB`,
                            sms: limite_sms,
                            minutos: limite_minutos,
                        },
                        consumo: {
                            dados: `${consumo_dados_mb.toFixed(2)} MB`,
                            sms: consumo_sms,
                            minutos: consumo_minutos.toFixed(2),
                        },
                        percentual_consumo: {
                            dados: percentual_dados,
                            sms: percentual_sms,
                            minutos: percentual_minutos,
                        },
                    };
                });
                // 4️⃣ Somatório geral
                const totalGeral = resultado.reduce((acc, item) => {
                    const dados = parseFloat(String(item.consumo.dados).replace(" MB", "")) || 0;
                    const sms = Number(item.consumo.sms) || 0;
                    const minutos = Number(item.consumo.minutos) || 0;
                    acc.dados += dados;
                    acc.sms += sms;
                    acc.minutos += minutos;
                    return acc;
                }, { dados: 0, sms: 0, minutos: 0 });
                // 🔒 Garante que são números antes do toFixed()
                const totalDados = Number(totalGeral.dados) || 0;
                const totalSms = Number(totalGeral.sms) || 0;
                const totalMinutos = Number(totalGeral.minutos) || 0;
                return res.status(200).json({
                    message: "Consumo detalhado por linha com limites do plano",
                    total_geral: {
                        dados: `${totalDados.toFixed(2)} MB`,
                        sms: totalSms,
                        minutos: totalMinutos.toFixed(2),
                    },
                    data: resultado,
                });
            }
            catch (error) {
                console.error("Erro ao listar consumo detalhado:", error.message);
                return res.status(500).json({
                    message: "Erro ao listar consumo detalhado",
                    error: ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message,
                });
            }
        });
    }
}
exports.default = ConsumoDetalhadoController;
