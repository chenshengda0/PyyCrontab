#!/usr/bin/env node
class WithRabbitmq{
    private rabbitmqConf:{
        protocol: string,
        hostname: string,
        port: number,
        username: string,
        password: string,
        locale: string,
        frameMax: number,
        //heartbeat: number,
        host: string,
    }

    constructor(){
        this.rabbitmqConf = {
            // @ts-ignore
            protocol: RABBITMQ_PROTOCOL as unknown as string,
            // @ts-ignore
            hostname: RABBITMQ_HOSTNAME as unknown as string,
            // @ts-ignore
            port: RABBITMQ_PORT as unknown as number,
            // @ts-ignore
            username: RABBITMQ_USERNAME as unknown as string,
            // @ts-ignore
            password: RABBITMQ_PASSWORD as unknown as string,
            // @ts-ignore
            locale: RABBITMQ_LOCALE as unknown as string,
            // @ts-ignore
            frameMax: RABBITMQ_FRAMEMAX as unknown as number,
            //heartbeat: 0,
            // @ts-ignore
            host: RABBITMQ_HOST as unknown as string,
        }
        console.log( this.rabbitmqConf )
    }

    //发送消息
    async publish( keyword:string,msg:any ){
        try{
            const exchange_name = "amq.topic";
            const queue_name = `${keyword}_queue`;
            const amqp = await require("amqplib/callback_api");
            //连接器
            const connection = await new Promise( (resolve,reject)=>amqp.connect(this.rabbitmqConf,(err:any,connection:any)=> err ? reject(err) : resolve(connection) ) ) as any;
            //创建通道
            const channel = await new Promise( (resolve,reject)=>connection.createChannel( (err:any,channel:any)=> err ? reject(err) : resolve(channel) ) ) as any;
            //创建队列
            await channel.assertQueue(queue_name,{
                durable: true,      //持久化
                autoDelete: false,  //自动删除
                exclusive: false,   //排它
            })
            //绑定队列
            channel.bindQueue( queue_name,exchange_name,keyword );
            //发送消息
            channel.publish( exchange_name, keyword, Buffer.from( JSON.stringify(msg) ) );
            //关闭连接
            await new Promise( (resolve,reject)=>{
                //关闭信道，关闭连接
                setTimeout( ()=>{
                    channel.close( () => {
                        connection.close()
                    } )
                    resolve("关闭连接成功")
                },50 )
            } )
            return true;
        }catch(err:any){
            throw err;
        }finally{
            console.log( "发布消息" )
        }
    }

    //消费消息
    async consumer(keyword:string){
        try{
            const exchange_name = "amq.topic";
            const queue_name = `${keyword}_queue`;
            const amqp = await require("amqplib/callback_api");
            //连接器
            const connection = await new Promise( (resolve,reject)=>amqp.connect(this.rabbitmqConf,(err:any,connection:any)=> err ? reject(err) : resolve(connection) ) ) as any;
            //创建通道
            const channel = await new Promise( (resolve,reject)=>connection.createChannel( (err:any,channel:any)=> err ? reject(err) : resolve(channel) ) ) as any;
            //创建队列
            await channel.assertQueue(queue_name,{
                durable: true,      //持久化
                autoDelete: false,  //自动删除
                exclusive: false,   //排它
            })
            //绑定队列
            await channel.bindQueue( queue_name,exchange_name,keyword );
            const message = await new Promise( (resolve,reject)=>{
                channel.get( queue_name,{noAck:true},(err:any,message:any)=>{
                    if(err) reject(err)
                    resolve( message )
                } )
            } ) as any;
            //关闭连接
            await new Promise( (resolve,reject)=>{
                //关闭信道，关闭连接
                setTimeout( ()=>{
                    channel.close( () => {
                        connection.close()
                    } )
                    resolve("关闭连接成功")
                },5 )
            } )
            return message ? JSON.parse( message.content.toString() ) : null;
        }catch(err:any){
            throw err;
        }finally{
            console.log("消费消息")
        }
    }
}

export default WithRabbitmq;


/*
(
    async()=>{
        const rabb = new WithRabbitmq();
        while( true ){
            console.log( await rabb.publish("tests",{message:"hello world"}) )
            console.log( await rabb.consumer("tests") )
        }
    }
)()
*/