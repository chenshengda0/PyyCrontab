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
    async sendSetLogList(req:any,res:any){
        const rabb = new WithRabbitmq()
        const withMysql = new WithMysql();
        const conn = await withMysql.connectHandle() as any;
        try{
            const list = await new Promise( (resolve,reject)=>{
                const sql = `SELECT to_address FROM wab_customer_promotion WHERE status = 0 GROUP BY to_address`;
                conn.query( sql,[],(err:any,dataList:any[])=>err ? reject(err) : resolve(dataList) )
            } ) as any[];
            for( const row of list ){
                rabb.publish( "sendSetLogList",{
                    sendDate: new Date(),
                    userphone: row.to_address,
                } )
            }
            return {
                code: 200,
                message: "SUCCESS",
                data: {}
            }
        }catch(err:any){
            return {
                code: 400,
                message: err.message,
                data: {}
            }
        }finally{
            console.log("检查奖励日志重复发送消息")
        }
    }

}

const publish = new PublishRouter();
const middleware = new Middleware();
router.get("/sendSetLogList",async(req:any,res:any,next:any)=> await middleware.checkAuth(req,res,next),async(req:any,res:any)=>await publish.sendSetLogList(req,res) );
export default router;