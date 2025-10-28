import axios from "axios";

export default class ListAllConnectionController {

  async list(req: any, res: any) {
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
      const result = await axios.get(`${url}api/people/${id_client}/authentications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Verify-Token": process.env.VERIFY_TOKEN,
        },
      });

      // ✅ Caso retorne com sucesso
      const data: any = result.data;

      // Se quiser retornar os dados como estão:
      return res.status(200).json({
        success: true,
        count: data.count,
        connections: data.data.map((item: any) => ({
          id: item.id,
          user: item.user,
          password: item.password,
          ipType: item.ipTypeAsText,
          equipmentUser: item.equipmentUser,
          equipmentPassword: item.equipmentPassword,
          serviceProduct: item.serviceProduct?.title,
          connectionType: item.connectionType,
          contractNumber: item.contract?.contract_number,
          address: {
            street: item.peopleAddress?.street,
            number: item.peopleAddress?.number,
            neighborhood: item.peopleAddress?.neighborhood,
            city: item.peopleAddress?.city,
            state: item.peopleAddress?.state,
            postalCode: item.peopleAddress?.postalCode,
          },
          created: item.created,
          modified: item.modified,
          active: item.active,
        })),
      });

    } catch (error: any) {
      console.error("Erro ao listar conexões:", error.message);

      // 🚨 Tratamento de erro mais robusto
      if (error.response) {
        return res.status(error.response.status).json({
          error: true,
          message: error.response.data?.message || "Erro ao consultar autenticações",
          details: error.response.data,
        });
      }

      return res.status(500).json({
        error: true,
        message: "Erro interno ao buscar conexões",
      });
    }
  }
}
