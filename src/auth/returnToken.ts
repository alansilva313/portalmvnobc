import AuthApivoalleController from "./AuthApi";

async function returnToken(){
const token: any  = await new AuthApivoalleController().getToken();

return token;
}


export default returnToken;
