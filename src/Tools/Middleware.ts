#!/usr/bin/env node

class Middleware{
    constructor(){}

    async checkAuth(req:any,res:any,next:any){
        try{
            //获取账户地址
            next();
        }catch(err:any){
            return res.json({
                code: 300,
                message: err.message,
                data: []
            })
        }finally{
            //验证账号是否过期
            console.log( `参数校验` )
        }
    }

}

export default Middleware;