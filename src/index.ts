#!/usr/bin/env node
import {
    ConsumerRouter,
    SystemRouter,
    PublishRouter,
} from "./Routers"
const app = (require("express"))();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
/*引入cors*/
const cors = require('cors');
app.use(cors());

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended: true}) );//application/x-www-form-urlencoded

app.listen( 9527,()=>{
    console.log( "服务器已启动" )
} )

//处理错误
//发送请求
//const http = require("http");
const request = require("request");
//服务端TCP已断开，客户端还在请求，服务端keepalive断开时间为5秒
const Agent = require("agentkeepalive");
const agent = new Agent();
// @ts-ignore
if( REACT_SERVER_DEBUG ){
    setInterval(() => {
        const reqInfo = request.get("http://127.0.0.1:9527", {agent}, (err:any) => {
          if (!err) {
            console.log("success");
          } else if (err.code === 'ECONNRESET' && reqInfo.req.reusedSocket) {
            // 如果错误码为ECONNRESET，且复用了TCP连接，那么重试一次
            return request.get("http://127.0.0.1:9527", (err:any) => {
              if (err) {
                throw err;
              } else {
                //process.exit();
                console.log("success with retry");
              }
            });
          } else {
            throw err;
          }
        });
    }, 5000);
}

app.use("",SystemRouter);
app.use("/publish",PublishRouter);
app.use("/consumer",ConsumerRouter);

//捕获到异常不退出
process.on( "uncaughtException",(err)=>{
    console.log( err.stack )
    console.log( "NOT exit..." )
} )


process.setMaxListeners(0);