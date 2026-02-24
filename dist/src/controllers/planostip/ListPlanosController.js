"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class ListPlanosController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const URL_TIP = process.env.URL_TIP;
            const TOKEN_TIP = process.env.TOKEN_TIP;
            try {
                const result = yield axios_1.default.get(`${URL_TIP}/planos?user_token=${TOKEN_TIP}`);
                return res.status(200).json({
                    message: "Listando planos",
                    data: result.data
                });
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
exports.default = ListPlanosController;
