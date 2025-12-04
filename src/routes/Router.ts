import { Router } from "express";
import AuthUserPortalController from "../controllers/authUser/AuthUserPortalController";
import ListAllContractsController from "../controllers/contracts/ListAllContractsController";
import ListAllConnectionController from "../controllers/conexoes/ListAllConnectionController";
import ListAllConsumoController from "../controllers/consumo/ListAllConsumoController";
import ListPlanosController from "../controllers/planostip/ListPlanosController";
import ListAssinanteController from "../controllers/assinante/ListAssinanteController";
import ConsumoComPlanoController from "../controllers/consumo/ConsumoPorPlanoController";
import ListContratoMvnoController from "../controllers/contratos_mvno/ListContratoMvnoController";
import ListarContratosServicoMvnoController from "../controllers/contratos_mvno/ListarContratosServicoMvnoController";
import BloquearSimCardController from "../controllers/bloquear/BloquearSimCardController";
import DesbloquearSimCardController from "../controllers/desbloquear/DesbloquearNumeroController";
import StatusPortabilidadeController from "../controllers/statusport/StatusPortabilidadeController";


const authUserPortalController = new AuthUserPortalController();
const listAllContractsController = new ListAllContractsController();
const listAllConnectionController = new ListAllConnectionController();
const listAllConsumoController = new ListAllConsumoController();
const listPlanosController = new ListPlanosController();
const listAssinanteController = new ListAssinanteController();
const consumoComPlanoController = new ConsumoComPlanoController();

const listContratoMvnoController = new ListContratoMvnoController();
const listarContratosServicoMvnoController = new ListarContratosServicoMvnoController();

const bloquearSimCardController = new BloquearSimCardController();

const desbloquearSimCardController = new DesbloquearSimCardController();
const statusPortabilidadeController = new StatusPortabilidadeController();

const router = Router()

router.post("/auth", authUserPortalController.auth);
router.post("/contracts", listAllContractsController.list);
router.post("/connection", listAllConnectionController.list);

// api tip
router.post("/consumo", listAllConsumoController.list);
router.post("/consumo/plano", consumoComPlanoController.list);
router.get("/planos", listPlanosController.list);
router.post("/assinantes", listAssinanteController.list);
router.post("/contratos/mvno", listContratoMvnoController.listenerCount);
router.post("/contratos/servicos", listarContratosServicoMvnoController.list);
router.post("/contratos/bloqueio", bloquearSimCardController.bloqueio);
router.post("/contratos/desbloquear", desbloquearSimCardController.desbloqueio)
router.post("/acompanhamento/portabilidade", statusPortabilidadeController.port)



export default router