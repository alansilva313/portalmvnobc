import axios from "axios"; 
import AuthApivoalleController from "../../service/token";

export default class ListarEtiquetasController {

    async list(document: any, contract: any) {

       
        const tx_id = document;

        try {
            const token = await new AuthApivoalleController().getToken();

            const result: any = await axios.get(
                `https://erp.internetway.com.br:45715/external/integrations/thirdparty/servicetagsinfopaged?txId=${tx_id}`, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const response = result.data.response;

          

            if (!response?.data) {
                return false
            }

            // FILTRA (convertendo contrato para número)
            const filtrado = response.data.filter(
                (item: any) => item.contractId === Number(contract)
            );
            console.log(filtrado)
            return {
                tag: filtrado[0].tag
            }
            

        } catch (error) {
            
            return false
        }
    }
}
