import axios from "axios";

export default class RecargaController {

    async recarga(req: any, res: any) {

        const urlTip = process.env.URL_TIP;
        const user_token = process.env.TOKEN_TIP;
        const { simcard } = req.body;

        const plano_1 = '1Gb';
        const plano_2 = '2Gb';

        if (!urlTip) {
            return res.status(500).json({ message: "URL_TIP não configurada" });
        }

        if (!user_token) {
            return res.status(500).json({ message: "TOKEN_TIP não configurado" });
        }

        if (!simcard) {
            return res.status(400).json({ message: "Simcard é obrigatório" });
        }

        const url = `${urlTip}/simcard/${simcard}/ultima-recarga?user_token=${user_token}`;

        try {

            const response = await axios.get(url);
            const result: any = response.data;

            if (!result || !result.ultima_recarga) {
                return res.status(400).json({
                    message: "Falha ao listar última recarga!"
                });
            }

            // 📅 Data da última recarga
            const dataUltimaRecarga = new Date(result.ultima_recarga);

            // 📅 Data atual
            const hoje = new Date();

            const mesmoMes =
                dataUltimaRecarga.getMonth() === hoje.getMonth() &&
                dataUltimaRecarga.getFullYear() === hoje.getFullYear();

            if(mesmoMes) return res.status(401).json({
                message: "Tem uma recarga no mesmo mês, por esse motivo não foi possivel registrar a recarga",
                status: 400
            });


            return res.status(201).json({
                message: "Recarga disponivel",
                planos: {
                    plano_1: {
                        plano1: plano_1,
                        valor: '9,90',
                        id: "b9c4830e-151c-955c-1b4c-03545339cb16"
                    },
                    plano_2: {
                        plano2: plano_2,
                        valor: '17,90',
                        id: "aaaaed7b-4980-1f9b-5bfc-beffba50d79d"
                    }
                }
            })

        } catch (error: any) {

            console.error("Erro ao consultar API:", error?.response?.data.message || error.message);

            return res.status(400).json({
                message: error?.response?.data.message,
                status: 400
            });
        }
    }
}