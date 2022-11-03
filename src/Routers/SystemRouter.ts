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
        try{
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
        }finally{}
    }

}

const system = new SystemRouter();
const middleware = new Middleware();
router.get("/",async(req:any,res:any,next:any)=> await middleware.checkAuth(req,res,next),async(req:any,res:any)=>await system.test(req,res) );
export default router;