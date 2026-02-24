import axios from "axios"


export default class ListPlanosController {

    async list(req: any, res: any){

    const URL_TIP = process.env.URL_TIP;
    const TOKEN_TIP = process.env.TOKEN_TIP;

        try {

            const result: any = await axios.get(`${URL_TIP}/planos?user_token=${TOKEN_TIP}`);

            return res.status(200).json({
                message: "Listando planos",
                data: result.data
            })
            
        } catch (error) {
            console.log(error)
        }
    }
}