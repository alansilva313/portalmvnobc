import axios from "axios";
import AuthApivoalleController from "../../service/token";
import ListarEtiquetasController from "../etiquetas/ListarEtiquetasController";





export default class AbrirordemVoalleController {
  async criarOrdemVoalle(clientId: any,  contractServiceTagId: any, motivo: any, document: any) {



    const tag: any = await new ListarEtiquetasController().list(document, contractServiceTagId)
    
    if(!tag) return [];

   
    const body = {
      incidentStatusId: 4,
      personId: "219945",
      clientId: clientId,
      incidentTypeId: String(process.env.CATEGORIA_T_PRODUCAO),
      contractServiceTagId: String(contractServiceTagId),
      contractServiceTagCategory: String(tag.tag),
      catalogServiceId: String(process.env.CATEGORIA_C_PRODUCAO),
      serviceLevelAgreementId: 101,
    
      assignment: {
        title: "Bloqueio de linha",
        description: `Bloqueio de linha, via portal MVNO - motivo ${motivo}`,
        priority: 0,
        beginningDate: "",
        finalDate: "",
         report: {
      beginningDate: "",
      finalDate: "",
      description: `Cliente realizou o bloqueio da linha via portal com o motivo de ${motivo}` //Descrição
    },
   
        companyPlaceId: 1
      },

        solicitationServiceCategory1: String(process.env.CATEGORIA_1_PRODUCAO),
      solicitationServiceCategory2: String(process.env.CATEGORIA_2_PRODUCAO),
      solicitationServiceCategory3: String(process.env.CATEGORIA_3_PRODUCAO),
      solicitationServiceCategory4: String(process.env.CATEGORIA_4_PRODUCAO),
      solicitationServiceCategory5: String(process.env.CATEGORIA_5_PRODUCAO),
    };

    try {
      const token = await new AuthApivoalleController().getToken();


      const result = await axios.post("https://erp.internetway.com.br:45715/external/integrations/thirdparty/opendetailedsolicitation",
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const data: any = result.data;



      if (!data?.success || !data.response?.protocol) {
  
        return ({ message: 'Erro ao criar solicitação.', detalhe: data });
      }


     


      return ({
        message: "Solicitação criada com sucesso!",
        protocolo: data.response.protocol,
        assignmentId: data.response.assignmentId
      });

  

    } catch (error: any) {
      console.error("Erro ao criar solicitação:", error?.message || error);
      return ({
        message: 'Erro ao criar solicitação.',
        error: error?.message || error
      });
    }
  }
}
