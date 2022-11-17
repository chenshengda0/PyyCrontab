#!/usr/bin/env node
import { resolve } from "path";
import {
    WithRabbitmq,
    Middleware,
    WithMysql,
    ExpressTimerDecorator,
} from "../Tools"

const router = require("express").Router();

class ConsumerRouter{

    @ExpressTimerDecorator
    async setAwardList(req:any,res:any){
        const rabb = new WithRabbitmq()
        const message = await rabb.consumer("usdtEventList");
        if( !message )  return {
            code: 400,
            log: "设置USDT奖励列表",
            message: "未定义消息",
        }
        const withMysql = new WithMysql();
        const conn = await withMysql.connectHandle() as any;
        try{
            //开启事务
            await new Promise( (resolve,reject)=>{
                conn.beginTransaction( (err:any) => err ? reject(err) : resolve("开启事务成功") );
            } );
            //获取当前账户
            const current = await new Promise( (resolve,reject)=>{
                const sql = `SELECT * FROM wab_customer_user WHERE id = ? AND black_status = 0 AND active_status = 1`;
                conn.query( sql,[message.userId],(err:any,dataList:any[])=>err ? resolve([]): resolve(dataList) )
            } ) as any[];
            if( current.length < 1 ){
                conn.rollback();
                return {
                    code: 400,
                    message: "未查询到账户",
                    data: {}
                };
            }
            //拆分上级账户
            const awardList = current[0].invite_parent_ids.split(/[-\,_]/).filter( (d: any) => d ).reverse();
            for( const index in awardList ){
                //发送消息
                await rabb.publish( "usdtEvent",{
                    sendDate: new Date(),
                    fromUserId: message.userId,
                    fromUserPhone: current[0].phone,
                    toUserId: awardList[index],
                    currentLevel: parseInt(index) + 1,
                } )
            }
            conn.commit()
            return {
                code: 200,
                message: "SUCCESS",
                data: {}
            }
        }catch(err:any){
            //回退消息
            await rabb.publish("usdtEventList",message);
            conn.rollback();
            return {
                code: 400,
                message: err.message,
                data: {}
            }
        }finally{
            conn.release()
            console.log( "设置USDT奖励列表" )
        }
    }

    @ExpressTimerDecorator
    async setAwardListBak(req:any,res:any){
        const rabb = new WithRabbitmq()
        const message = await rabb.consumer("usdtEventListBak");
        if( !message )  return {
            code: 400,
            log: "设置USDT奖励列表",
            message: "未定义消息",
        }
        const withMysql = new WithMysql();
        const conn = await withMysql.connectHandle() as any;
        try{
            //开启事务
            await new Promise( (resolve,reject)=>{
                conn.beginTransaction( (err:any) => err ? reject(err) : resolve("开启事务成功") );
            } );
            //获取当前账户
            const current = await new Promise( (resolve,reject)=>{
                const sql = `SELECT * FROM wab_customer_user WHERE id = ? AND black_status = 0 AND active_status = 1`;
                conn.query( sql,[message.userId],(err:any,dataList:any[])=>err ? resolve([]): resolve(dataList) )
            } ) as any[];
            if( current.length < 1 ){
                conn.rollback();
                return {
                    code: 400,
                    message: "未查询到账户",
                    data: {}
                };
            }
            //拆分上级账户
            const awardList = current[0].invite_parent_ids.split(/[-\,_]/).filter( (d: any) => d ).reverse();
            for( const index in awardList ){
                //发送消息
                await rabb.publish( "usdtEventBak",{
                    sendDate: new Date(),
                    fromUserId: message.userId,
                    fromUserPhone: current[0].phone,
                    toUserId: awardList[index],
                    currentLevel: parseInt(index) + 1,
                } )
            }
            conn.commit()
            return {
                code: 200,
                message: "SUCCESS",
                data: {}
            }
        }catch(err:any){
            //回退消息
            await rabb.publish("usdtEventListBak",message);
            conn.rollback();
            return {
                code: 400,
                message: err.message,
                data: {}
            }
        }finally{
            conn.release()
            console.log( "设置USDT奖励列表" )
        }
    }

    //消费奖励消息
    @ExpressTimerDecorator
    async setAward(req:any,res:any){
        const rabb = new WithRabbitmq()
        const message = await rabb.consumer("usdtEvent");
        if( !message )  return {
            code: 400,
            log: "设置USDT奖励",
            message: "未定义消息",
        }
        const withMysql = new WithMysql();
        const conn = await withMysql.connectHandle() as any;
        try{
            //校验账户是否存在
            //开启事务
            await new Promise( (resolve,reject)=>{
                conn.beginTransaction( (err:any) => err ? reject(err) : resolve("开启事务成功") );
            } );
            //获取当前账户
            const current = await new Promise( (resolve,reject)=>{
                const sql = `SELECT * FROM wab_customer_user WHERE id = ? AND black_status = 0`;
                conn.query( sql,[message.toUserId],(err:any,dataList:any[])=>err ? resolve([]): resolve(dataList) )
            } ) as any[];
            if( current.length < 1 ){
                conn.rollback();
                return {
                    code: 400,
                    message: "未查询到账户",
                    data: {}
                };
            }
            if( parseInt(current[0].active_status) !== 1 ){
                conn.rollback();
                return {
                    code: 400,
                    message: "账户未激活",
                    data: {}
                };
            }
            //查询推荐有效会员数量
            const sons = await new Promise( (resolve,reject)=>{
                const sql = "SELECT count(1) as sonsCount FROM wab_customer_user WHERE invite_id = ? AND black_status = 0 AND active_status = 1";
                conn.query( sql,[message.toUserId], (err:any,dataList:any[])=>err ? reject(err) : resolve( dataList ) )
            } ) as any[]
            //查询当前账户奖励
            const awardLevel = await new Promise( (resolve,reject)=>{
                const sql = "SELECT * FROM `wab_commission_config` WHERE `level` = ?"
                conn.query( sql, [message.currentLevel],(err:any,dataList:any[])=>err ? reject(err): resolve(dataList) );
            } ) as any[];
            if( awardLevel.length < 1 ){
                conn.rollback();
                return {
                    code: 400,
                    message: "未查询到当前账户奖励级别",
                    data: {}
                }
            }
            //获取奖励数量
            const count = awardLevel[0].commission;
            //查询账户推荐的有效会员数量
            if( parseInt(sons[0].sonsCount) < 2 ){
                if( parseInt(message.currentLevel) <= 2 ){
                    //发送奖励,写入日志
                    await new Promise( (resolve,reject)=>{
                        const sql = `UPDATE wab_customer_user SET usdt_num = usdt_num + ? where id = ?`;
                        conn.query( sql, [count,message.toUserId], (err:any,dataList:any[])=>err ? reject(err) : resolve(dataList))
                        //resolve( `UPDATE wab_customer_user SET usdt_num = usdt_num + ${count} where id = ${message.toUserId}` )
                    } )
                    await new Promise( (resolve,reject)=>{
                        const sql = `INSERT INTO wab_customer_promotion(
                                        id, 
                                        to_address, 
                                        commission, 
                                        create_time, 
                                        level, 
                                        invite_address, 
                                        status,
                                        old_usdt_num, 
                                        cur_usdt_num
                                    ) VALUES (0,?,?,NOW(),?,?,1,?,?)`;
                        conn.query( sql,[
                            current[0].phone,
                            count,
                            message.currentLevel,
                            message.fromUserPhone,
                            current[0].usdt_num,
                            current[0].usdt_num + count,
                        ],(err:any,dataList:any[])=>err ? reject(err): resolve(dataList) )
                    } )
                }else{
                    //只写记录，不发送奖励
                    await new Promise( (resolve,reject)=>{
                        const sql = `INSERT INTO wab_customer_promotion(
                                        id, 
                                        to_address, 
                                        commission, 
                                        create_time, 
                                        level, 
                                        invite_address, 
                                        status,
                                        old_usdt_num, 
                                        cur_usdt_num
                                    ) VALUES (0,?,?,NOW(),?,?,0,?,?)`;
                        conn.query( sql,[
                            current[0].phone,
                            count,
                            message.currentLevel,
                            message.fromUserPhone,
                            current[0].usdt_num,
                            current[0].usdt_num + count,
                        ],(err:any,dataList:any[])=>err ? reject(err) : resolve( dataList ) )
                    } )
                }
            }else{
                //发送奖励,写入日志
                await new Promise( (resolve,reject)=>{
                    const sql = `UPDATE wab_customer_user SET usdt_num = usdt_num + ? where id = ?`;
                    conn.query( sql, [count,message.toUserId], (err:any,dataList:any[])=>err ? reject(err) : resolve(dataList))
                    //resolve( `UPDATE wab_customer_user SET usdt_num = usdt_num + ${count} where id = ${message.toUserId}` )
                } )
                await new Promise( (resolve,reject)=>{
                    const sql = `INSERT INTO wab_customer_promotion(
                                    id, 
                                    to_address, 
                                    commission, 
                                    create_time, 
                                    level, 
                                    invite_address, 
                                    status, 
                                    old_usdt_num, 
                                    cur_usdt_num
                                ) VALUES (0,?,?,NOW(),?,?,1,?,?)`;
                    conn.query( sql,[
                        current[0].phone,
                        count,
                        message.currentLevel,
                        message.fromUserPhone,
                        current[0].usdt_num,
                        current[0].usdt_num + count,
                    ],(err:any,dataList:any[])=>err ? reject(err): resolve(dataList) )
                } )
            }
            conn.commit();
            return {
                code: 200,
                message: "SUCCESS",
                data: {}
            }
        }catch(err:any){
            conn.rollback();
            await rabb.publish( "usdtEvent", message )
            return {
                code: 400,
                message: err.message,
                data: {}
            }
        }finally{
            conn.release()
            console.log( "设置USDT奖励" )
        }
    }


    //消费奖励消息
    @ExpressTimerDecorator
    async setAwardBak(req:any,res:any){
        const rabb = new WithRabbitmq()
        const message = await rabb.consumer("usdtEventBak");
        if( !message )  return {
            code: 400,
            log: "设置USDT奖励",
            message: "未定义消息",
        }
        const withMysql = new WithMysql();
        const conn = await withMysql.connectHandle() as any;
        try{
            //校验账户是否存在
            //开启事务
            await new Promise( (resolve,reject)=>{
                conn.beginTransaction( (err:any) => err ? reject(err) : resolve("开启事务成功") );
            } );
            //获取当前账户
            const current = await new Promise( (resolve,reject)=>{
                const sql = `SELECT * FROM wab_customer_user WHERE id = ? AND black_status = 0`;
                conn.query( sql,[message.toUserId],(err:any,dataList:any[])=>err ? resolve([]): resolve(dataList) )
            } ) as any[];
            if( current.length < 1 ){
                conn.rollback();
                return {
                    code: 400,
                    message: "未查询到账户",
                    data: {}
                };
            }
            if( parseInt(current[0].active_status) !== 1 ){
                conn.rollback();
                return {
                    code: 400,
                    message: "账户未激活",
                    data: {}
                };
            }
            //查询推荐有效会员数量
            const sons = await new Promise( (resolve,reject)=>{
                const sql = "SELECT count(1) as sonsCount FROM wab_customer_user WHERE invite_id = ? AND black_status = 0 AND active_status = 1";
                conn.query( sql,[message.toUserId], (err:any,dataList:any[])=>err ? reject(err) : resolve( dataList ) )
            } ) as any[]
            //查询当前账户奖励
            const awardLevel = await new Promise( (resolve,reject)=>{
                const sql = "SELECT * FROM `wab_commission_config` WHERE `level` = ?"
                conn.query( sql, [message.currentLevel],(err:any,dataList:any[])=>err ? reject(err): resolve(dataList) );
            } ) as any[];
            if( awardLevel.length < 1 ){
                conn.rollback();
                return {
                    code: 400,
                    message: "未查询到当前账户奖励级别",
                    data: {}
                }
            }
            //获取奖励数量
            const count = awardLevel[0].commission;
            //查询账户推荐的有效会员数量
            if( parseInt(sons[0].sonsCount) < 2 ){
                if( parseInt(message.currentLevel) <= 2 ){
                    //发送奖励,写入日志
                    /*
                    await new Promise( (resolve,reject)=>{
                        const sql = `UPDATE wab_customer_user SET usdt_num = usdt_num + ? where id = ?`;
                        conn.query( sql, [count,message.toUserId], (err:any,dataList:any[])=>err ? reject(err) : resolve(dataList))
                        //resolve( `UPDATE wab_customer_user SET usdt_num = usdt_num + ${count} where id = ${message.toUserId}` )
                    } )
                    */
                    await new Promise( (resolve,reject)=>{
                        const sql = `INSERT INTO wab_customer_promotion(
                                        id, 
                                        to_address, 
                                        commission, 
                                        create_time, 
                                        level, 
                                        invite_address, 
                                        status
                                    ) VALUES (0,?,?,NOW(),?,?,1)`;
                        conn.query( sql,[
                            current[0].phone,
                            count,
                            message.currentLevel,
                            message.fromUserPhone
                        ],(err:any,dataList:any[])=>err ? reject(err): resolve(dataList) )
                    } )
                }else{
                    //只写记录，不发送奖励
                    await new Promise( (resolve,reject)=>{
                        const sql = `INSERT INTO wab_customer_promotion(
                                        id, 
                                        to_address, 
                                        commission, 
                                        create_time, 
                                        level, 
                                        invite_address, 
                                        status
                                    ) VALUES (0,?,?,NOW(),?,?,0)`;
                        conn.query( sql,[
                            current[0].phone,
                            count,
                            message.currentLevel,
                            message.fromUserPhone
                        ],(err:any,dataList:any[])=>err ? reject(err) : resolve( dataList ) )
                    } )
                }
            }else{
                //发送奖励,写入日志
                /*
                await new Promise( (resolve,reject)=>{
                    const sql = `UPDATE wab_customer_user SET usdt_num = usdt_num + ? where id = ?`;
                    conn.query( sql, [count,message.toUserId], (err:any,dataList:any[])=>err ? reject(err) : resolve(dataList))
                    //resolve( `UPDATE wab_customer_user SET usdt_num = usdt_num + ${count} where id = ${message.toUserId}` )
                } )
                */
                await new Promise( (resolve,reject)=>{
                    const sql = `INSERT INTO wab_customer_promotion(
                                    id, 
                                    to_address, 
                                    commission, 
                                    create_time, 
                                    level, 
                                    invite_address, 
                                    status
                                ) VALUES (0,?,?,NOW(),?,?,1)`;
                    conn.query( sql,[
                        current[0].phone,
                        count,
                        message.currentLevel,
                        message.fromUserPhone
                    ],(err:any,dataList:any[])=>err ? reject(err): resolve(dataList) )
                } )
            }
            conn.commit();
            return {
                code: 200,
                message: "SUCCESS",
                data: {}
            }
        }catch(err:any){
            conn.rollback();
            await rabb.publish( "usdtEventBak", message )
            return {
                code: 400,
                message: err.message,
                data: {}
            }
        }finally{
            conn.release()
            console.log( "设置USDT奖励" )
        }
    }

    //发送奖励
    @ExpressTimerDecorator
    async sendSetLogList(req:any,res:any){
        const rabb = new WithRabbitmq()
        const message = await rabb.consumer("sendSetLogList");
        if( !message )  return {
            code: 400,
            log: "重发USDT奖励",
            message: "未定义消息",
        }
        const withMysql = new WithMysql();
        const conn = await withMysql.connectHandle() as any;
        try{
            //开启事务
            await new Promise( (resolve,reject)=>{
                conn.beginTransaction( (err:any) => err ? reject(err) : resolve("开启事务成功") );
            } );
            //校验账号是否有未处理的记录
            const LogList = await new Promise( (resolve,reject)=>{
                const sql = `SELECT * FROM wab_customer_promotion WHERE status = 0 AND to_address = ?`;
                conn.query( sql,[message.userphone],(err:any,dataList:any[])=> err ? reject(err) : resolve(dataList) );
            } ) as any[];
            if( LogList.length <= 0 ){
                conn.rollback();
                return {
                    code: 400,
                    message: "未查询到账户",
                    data: {}
                }
            }
            //检查账户是否存在
            const current = await new Promise( (resolve,reject)=>{
                const sql = `SELECT * FROM wab_customer_user WHERE phone = ? AND active_status = 1 AND black_status = 0`;
                conn.query( sql,[message.userphone],(err:any,dataList:any[])=>err ? reject(err) : resolve(dataList) )
            } ) as any[];
            if( current.length < 1 ){
                conn.rollback();
                return {
                    code: 400,
                    message: "未查询到账户",
                    data: {}
                }
            }
            //查询推荐有效会员数量
            const sons = await new Promise( (resolve,reject)=>{
                const sql = "SELECT count(1) as sonsCount FROM wab_customer_user WHERE invite_id = ? AND black_status = 0 AND active_status = 1";
                conn.query( sql,[current[0].id], (err:any,dataList:any[])=>err ? reject(err) : resolve( dataList ) )
            } ) as any[];
            if( parseInt(sons[0].sonsCount) < 2 ){
                conn.rollback();
                return {
                    code: 400,
                    message: "推荐人不满足条件",
                    data: {}
                }
            }
            //逐条发送奖励
            for( const log of LogList ){
                //修改日志状态
                const preState = await new Promise( (resolve,reject)=>{
                    const sql = `SELECT * FROM wab_customer_user WHERE phone = ? AND active_status = 1 AND black_status = 0`;
                    conn.query( sql,[message.userphone],(err:any,dataList:any[])=>err ? reject(err) : resolve(dataList) )
                } ) as any[]
                await new Promise( (resolve,reject)=>{
                    const sql = `UPDATE wab_customer_promotion SET status = 1,old_usdt_num = ?, cur_usdt_num = ? + commission WHERE id = ?`;
                    conn.query( sql,[
                        log.id,
                        preState[0].usdt_num,
                        preState[0].usdt_num
                    ],(err:any,dataList:any[])=> err ? reject(err) : resolve(dataList) )
                } )
                //修改账户usdt
                await new Promise( (resolve,reject)=>{
                    const sql = `UPDATE wab_customer_user SET usdt_num = usdt_num + ? WHERE id = ?`;
                    conn.query( sql,[log.commission, current[0].id],(err:any,dataList:any[]) => err ? reject( err ) : resolve( dataList ) )
                } )
            }
            conn.commit();
            return {
                code: 200,
                message: "SUCCESS",
                data: {}
            }
        }catch(err:any){
            conn.rollback();
            await rabb.publish("sendSetLogList",message);
            return {
                code: 400,
                message: err.message,
                data: {}
            }
        }finally{
            conn.release()
            console.log( "重发USDT奖励" )
        }
    }

}

const consumer = new ConsumerRouter();
const middleware = new Middleware();
router.get("/sendAwardUserList",async(req:any,res:any,next:any)=> await middleware.checkAuth(req,res,next),async(req:any,res:any)=>await consumer.setAwardList(req,res) );
router.get("/sendAwardUserListBak",async(req:any,res:any,next:any)=> await middleware.checkAuth(req,res,next),async(req:any,res:any)=>await consumer.setAwardListBak(req,res) );
router.get("/sendAward",async(req:any,res:any,next:any)=> await middleware.checkAuth(req,res,next),async(req:any,res:any)=>await consumer.setAward(req,res) );
router.get("/sendAwardBak",async(req:any,res:any,next:any)=> await middleware.checkAuth(req,res,next),async(req:any,res:any)=>await consumer.setAwardBak(req,res) );
router.get("/sendSetLogList",async(req:any,res:any,next:any)=> await middleware.checkAuth(req,res,next),async(req:any,res:any)=>await consumer.sendSetLogList(req,res) );
export default router;