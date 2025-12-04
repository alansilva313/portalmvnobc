import AbrirordemVoalleController from "./AbrirOrdemVoalleController";


export default class RealizarBloqueio{

    async bloq(req: any, res: any){

        const { clientId, contractServiceTagId, motivo, document } = req.body;

        if(!clientId  || !motivo || !contractServiceTagId) return res.status(400).json({
            message: "Dados obrigatorios não enviados!"
        })
        try {

            const result: any = new AbrirordemVoalleController().criarOrdemVoalle(clientId, contractServiceTagId, motivo, document)

            return res.status(200).json({
                message: "Ordem aberta com sucesso!",
                ...result
            })

        
            
        } catch (error) {
            console.log(error)

            return res.status(500).json({
                message: "Ocorreu algum erro ao realizar abertura da ordem!"
            })
        }
    }
}