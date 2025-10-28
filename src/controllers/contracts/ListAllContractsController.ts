import axios from "axios";

export default class ListAllContractsController {
  async list(req: any, res: any) {
    // pode vir de req.body ou req.params dependendo da rota
    const { id_client, token } = req.body;
    const url = process.env.API_PATH;

    if (!id_client) {
      return res.status(400).json({ error: "id_client é obrigatório" });
    };


    if (!token) {
      return res.status(400).json({ error: "Dados de aunteticação não enviado" });
    };


    try {
      const result = await axios.get(`${url}api/people/${id_client}/contracts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Verify-Token": process.env.VERIFY_TOKEN,
        },
      });

      // Retorna o resultado da API
      return res.status(200).json(result.data);

    } catch (error: any) {
      console.error("Erro ao buscar contratos:", error.message);

      // Se a API retornar erro, devolve o status e a mensagem
      if (error.response) {
        return res
          .status(error.response.status)
          .json({ error: error.response.data });
      }

      return res.status(500).json({ error: "Erro interno ao buscar contratos" });
    }
  }
}
