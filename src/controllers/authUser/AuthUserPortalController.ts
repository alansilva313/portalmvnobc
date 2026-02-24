import axios from 'axios';

export default class AuthUserPortalController {

    async auth(req: any, res: any){


        const { username, password} = req.body;

        const verify_token = process.env.VERIFY_TOKEN;
        const client_id = process.env.CLIENT_ID;
        const client_secret = process.env.CLIENT_SECRET_P;
        const grant_type = process.env.GRANT_TYPE;
        const api_path = process.env.API_PATH;

       
        if(!verify_token || !client_id || !client_secret || !grant_type || !api_path) return res.status(401).json({
            message: "Falha na autenticação, verifique e tente novamente!",
            statusCode: 401
        });

        if(!username || !password) return res.status(401).json({
            message: "Usuário ou senha inválidos, tente novamente!",
            statusCode: 401
        })

        try {

             const result: any = await axios.get(`${api_path}portal_authentication?verify_token=${verify_token}&client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}&username=${username}&password=${password}`);

              if(!result) return res.status(404).json({
                message: "Não foi possivel conectar com o servidor",
                statusCode: 404
              });



              return res.status(200).json({
                message: "Autenticado com sucesso!",
                data: result.data
              })
        } catch (error: any) {
            return res.status(404).json({
                message: error.message || "Falha ao conectar!",
                statusCode: 404
            })
        }

    }   
}