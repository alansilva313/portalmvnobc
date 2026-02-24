import axios from "axios";


export default class StatusPortabilidadeController {


    async port(req: any, res: any){

        const { simcard } = req.body;
        const URL_MVNO = process.env.URL_MVNO;
        const TOKEN_TIP = process.env.TOKEN_TIP;


        if(!simcard) return res.status(404).json({
            message: "Status de portabilidade não encontrado!",
            statusCode: 404
        })

        try {

            const result: any = await axios.get(`${URL_MVNO}/${simcard}?user_token=${TOKEN_TIP}`)

            if(!result) return res.status(404).json({
                message: "Erro ao listar status de portabilidade!"
            })

            

            return res.status(200).json({
                message: "Listando status de portabilidade",
                ...result.data
            })
            
        } catch (error: any) {

            return res.status(400).json({
                message: "Simcard ou Numero não existe"
            })
           
        }
    }
}