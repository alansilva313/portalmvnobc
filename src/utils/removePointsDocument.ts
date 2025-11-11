export function limparCpfCnpj(valor: string): string {
  if (!valor) return "";
  return valor.replace(/[^\d]/g, ""); // remove tudo que não for número
}
