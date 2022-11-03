#!/usr/bin/env node
import {
    WithRabbitmq,
    Middleware,
    ExpressTimerDecorator,
    WithMysql,
} from "../Tools"

const router = require("express").Router();

class PublishRouter{
    //发送消息
    @ExpressTimerDecorator
    async sendUsdtEventList(req:any,res:any){
        const rabb = new WithRabbitmq()
        try{
            rabb.publish( "usdtEventList",{
                sendDate: new Date(),
                userId: 95,
            } )
        }catch(err:any){
            return {
                code: 400,
                message: err.message,
                data: {}
            }
        }finally{
            console.log("设置USDT奖励列表消息")
        }
    }

}

const publish = new PublishRouter();
const middleware = new Middleware();
//router.get("/sendAwardUserList",async(req:any,res:any,next:any)=> await middleware.checkAuth(req,res,next),async(req:any,res:any)=>await publish.sendUsdtEventList(req,res) );
export default router;