import { Router } from "express";
import AuthUserPortalController from "../controllers/authUser/AuthUserPortalController";
import ListAllContractsController from "../controllers/contracts/ListAllContractsController";
import ListAllConnectionController from "../controllers/conexoes/ListAllConnectionController";


const authUserPortalController = new AuthUserPortalController();
const listAllContractsController = new ListAllContractsController();
const listAllConnectionController = new ListAllConnectionController();
const router = Router()

router.post("/auth", authUserPortalController.auth);
router.post("/contracts", listAllContractsController.list);
router.post("/connection", listAllConnectionController.list);


export default router