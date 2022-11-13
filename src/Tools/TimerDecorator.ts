export const ExpressTimerDecorator = (
    target: any,
    key:any,
    descriptor:any
)=>{
    const original = descriptor.value;
    descriptor.value = async function(...args:any[]){
        console.log("======================================================START=====================================================================");
        console.log( `方法名称：${key}` )
        console.log( `参数：${JSON.stringify(args[0].body)}` )
        const start = new Date().getTime();
        const result = await original( ...args );
        const end = new Date().getTime();
        // @ts-ignore
        if(!REACT_SERVER_DEBUG){
            console.log( `执行结果：${JSON.stringify(result)}` )
        }
        console.log( `执行耗时：${end - start} ms` )
        console.log("======================================================END=======================================================================");
        return args[1].json(result);
    }
}