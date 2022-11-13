#!/usr/bin/env node
import {
    WithRabbitmq,
    Middleware,
    WithMysql,
    ExpressTimerDecorator,
} from "../Tools"

const router = require("express").Router();

class SystemRouter{

    constructor(){}

    @ExpressTimerDecorator
    async test(req:any,res:any){
        const withMysql = new WithMysql();
        const conn = await withMysql.connectHandle() as any;
        try{
            const data = await new Promise( (resolve,reject)=>{
                const sql = "SELECT * FROM wab_customer_user where 1";
                conn.query( sql,[],(err:any,dataList:any[])=>err? reject(err) : resolve(dataList) )
            } ) as any[];
            return {
                code: 200,
                message: "SUCCESS",
                data,
            }
        }catch(err:any){
            return {
                code: 400,
                message: err.message,
                data: {}
            }
        }finally{}
    }

    @ExpressTimerDecorator
    async sendUsdtEventList(req:any,res:any){
        const rabb = new WithRabbitmq()
        const withMysql = new WithMysql();
        const conn = await withMysql.connectHandle() as any;
        try{
            const {
                userId=0, 
            } = req.body;
            //开启事务
            await new Promise( (resolve,reject)=>{
                conn.beginTransaction( (err:any) => err ? reject(err) : resolve("开启事务成功") );
            } );
            //获取当前账户
            const current = await new Promise( (resolve,reject)=>{
                const sql = `SELECT * FROM wab_customer_user WHERE id = ? AND black_status = 0 AND active_status = 1`;
                conn.query( sql,[userId],(err:any,dataList:any[])=>err ? resolve([]): resolve(dataList) )
            } ) as any[];
            if( current.length < 1 ){
                throw new Error("未查询到账户");
            }
            if( !current[0].invite_id ){
                throw new Error("该账户无推荐人");
            }
            await rabb.publish( "usdtEventList",{
                sendDate: new Date(),
                userId: userId,
            } )
            conn.commit();
            return {
                code: 200,
                message: "SUCCESS",
                data: {}
            }
        }catch(err:any){
            conn.rollback()
            return {
                code: 400,
                message: err.message,
                data: {}
            }
        }finally{
            conn.release()
            console.log("设置USDT奖励列表消息")
        }
    }

    @ExpressTimerDecorator
    async sendUsdtEventListBak(req:any,res:any){
        const rabb = new WithRabbitmq()
        const withMysql = new WithMysql();
        const conn = await withMysql.connectHandle() as any;
        try{
            const {
                userId=0, 
            } = req.body;
            //开启事务
            await new Promise( (resolve,reject)=>{
                conn.beginTransaction( (err:any) => err ? reject(err) : resolve("开启事务成功") );
            } );
            //获取当前账户
            const current = await new Promise( (resolve,reject)=>{
                const sql = `SELECT * FROM wab_customer_user WHERE id = ? AND black_status = 0 AND active_status = 1`;
                conn.query( sql,[userId],(err:any,dataList:any[])=>err ? resolve([]): resolve(dataList) )
            } ) as any[];
            if( current.length < 1 ){
                throw new Error("未查询到账户");
            }
            if( !current[0].invite_id ){
                throw new Error("该账户无推荐人");
            }
            await rabb.publish( "usdtEventListBak",{
                sendDate: new Date(),
                userId: userId,
            } )
            conn.commit();
            return {
                code: 200,
                message: "SUCCESS",
                data: {}
            }
        }catch(err:any){
            conn.rollback()
            return {
                code: 400,
                message: err.message,
                data: {}
            }
        }finally{
            conn.release()
            console.log("设置USDT奖励列表消息")
        }
    }

}

const system = new SystemRouter();
const middleware = new Middleware();
router.get("/",async(req:any,res:any,next:any)=> await middleware.checkAuth(req,res,next),async(req:any,res:any)=>await system.test(req,res) );
router.post("/sendAwardUserList",async(req:any,res:any,next:any) => await middleware.checkAuth(req,res,next), async(req:any,res:any)=>await system.sendUsdtEventList(req,res) );
router.post("/sendAwardUserListBak",async(req:any,res:any,next:any) => await middleware.checkAuth(req,res,next), async(req:any,res:any)=>await system.sendUsdtEventListBak(req,res) );
export default router;