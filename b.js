const { MongoClient, ServerApiVersion } = require('mongodb');
const redis = require("redis");
const crypto = require('crypto');
// const uri = "mongodb+srv://helloworld260:QUNQpvnegXfWTe1B@unknown.uoruudj.mongodb.net/?retryWrites=true&w=majority";
const uri = "mongodb+srv://lolita:QA5FBHQJAF72yN1F@lolita.dzjfywq.mongodb.net/?retryWrites=true&w=majority";
const REDISURL = "redis://127.0.0.1:6379"



var redisCli
var dbCli
function md5(plain){
    return crypto.createHash('md5').update(plain).digest('hex');
}

async function initClient(){
    dbCli = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
    });
    redisCli = redis.createClient({
        url: REDISURL
    })


    //TODO 异常处理
    await redisCli.connect()
    await dbCli.connect()
}


//题目当前分数初始化，比赛开始时执行一次
async function initCurrentScore(){

}


async function addCurrentUserScore(uuid,score){
    var oldScore = await redisCli.hGet(md5(uuid)+'_userScore')
    oldScore = oldScore?parseInt(oldScore):0
    await redisCli.hSet(md5(uuid)+'_userScore',oldScore+parseInt(score))
}


//提交一次flag执行一次
//获取当前分数并更新分数
async function updateCurrentScore(puuid){

    console.log(md5(puuid))
    var a = await redisCli.hGet(md5(puuid),'score')

    //查询数据库得到原始分数
    var initScore = 5000;

    if(!a){
        await redisCli.hSet(md5(puuid),'score',parseInt(initScore-100*Math.log1p(1)))
        await redisCli.hSet(md5(puuid),'solvedTimes',1)
    }

    var solvedTimes = await redisCli.hGet(md5(puuid),'solvedTimes')
    solvedTimes = parseInt(solvedTimes)
    var nowScore = parseInt(initScore-100*Math.log1p(solvedTimes+1))

    await redisCli.hSet(md5(puuid),'score',nowScore)
    await redisCli.hSet(md5(puuid),'solvedTimes',solvedTimes+1)

}




//每五分钟执行
async function run() {
  try {
    await initClient() 
    await updateCurrentScore('4773d51d-4863-46a2-b124-14eeb6782bd4')

    console.log(b)

    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await redisCli.quit();
    await dbCli.close();
  }
}



run().catch()
