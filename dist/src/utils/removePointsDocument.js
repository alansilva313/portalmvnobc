"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limparCpfCnpj = limparCpfCnpj;
function limparCpfCnpj(valor) {
    if (!valor)
        return "";
    return valor.replace(/[^\d]/g, ""); // remove tudo que não for número
}
