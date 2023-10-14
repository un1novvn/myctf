const { MongoClient, ServerApiVersion } = require('mongodb');
const redis = require("redis");
const crypto = require('crypto');
// const uri = "mongodb+srv://helloworld260:QUNQpvnegXfWTe1B@unknown.uoruudj.mongodb.net/?retryWrites=true&w=majority";
const uri = "mongodb+srv://lolita:QA5FBHQJAF72yN1F@lolita.dzjfywq.mongodb.net/?retryWrites=true&w=majority";
const REDISURL = "redis://llt:Pc2ccw30@lolita2023.redis.rds.aliyuncs.com:6379"



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

//设置1 2 3 血
async function setBlood(userid,puuid,blood){
    switch(blood){
        case 1:
            await redisCli.set(puuid+'_firstBlood',userid)
            break

        case 2:
            await redisCli.set(puuid+'_secondBlood',userid)
            break

        case 3:
            await redisCli.set(puuid+'_thirdBlood',userid)
            break
    }
}

//提交一次正确flag执行一次
async function updateProblemScore(puuid){

    var minScore = 100;

    var solvedTimes = await redisCli.hGet(puuid+'_score','solvedTimes')
    solvedTimes = parseInt(solvedTimes)

    //查询数据库得到原始分数
    var problem = await dbCli.db('lolita').collection('problems').find({uuid:puuid}).toArray()
    console.log('puuid',puuid,problem)
    var initScore = problem[0].score?problem[0].score:0

    if(!solvedTimes){
        solvedTimes = 1
    }else{
        solvedTimes+=1
    }

    var nowScore = parseInt(initScore-100*Math.log1p(solvedTimes))
    nowScore = nowScore < minScore?minScore:nowScore
    await redisCli.hSet(puuid+'_score','score',nowScore)
    await redisCli.hSet(puuid+'_score','solvedTimes',solvedTimes)

    console.log('puuid: ',puuid,'solvedTimes: ',solvedTimes,'nowScore: ',nowScore)
    return solvedTimes

}


//根据比赛id获取排行榜
async function scoreBoard(cuuid){
    // 36083d07-d334-49f6-bc60-cb360d79e2e0

    // 1bd4bb19-da19-4ed9-992e-6d874e9f6b56  36083d07-d334-49f6-bc60-cb360d79e2e0


    var results = []
    var users = await dbCli.db('lolita').collection('userattendrecords').find({uuid:cuuid}).toArray()
    for(var i = 0;i<users.length;i++){
        var user = users[i];
        var userid = user.userid

        var score = await redisCli.get(md5(cuuid+userid)+'_userScore')

        var solvedProblems = await redisCli.lRange(md5(cuuid+userid)+'_userSolved',0,999)

        var result = {userid:userid,score:score?score:0,solvedProblems:solvedProblems}
        result.firstblood = []
        result.secondblood = []
        result.thirdblood = []
        for(var j = 0;j<solvedProblems.length;j++){
            var solved = solvedProblems[j]
            
            var userid = await redisCli.get(solved+'_firstBlood')
            if(userid === result.userid) result.firstblood.push(solved)

            userid = await redisCli.get(solved+'_secondBlood')
            if(userid === result.userid) result.secondblood.push(solved)

            userid = await redisCli.get(solved+'_thirdBlood')
            if(userid === result.userid) result.thirdblood.push(solved)
        }

        results.push(result)
    }

    console.log(results)

}

//每五分钟执行
//获取每个用户当前总分 和 解出的题目
async function flushUserScoreAndSolve(){
    var items = await dbCli.db('lolita').collection('userproblemrecords').find({solved:true}).toArray()
    console.log(items);

    var users = []

    for(var i = 0;i<items.length;i++){
        var item = items[i]
        var user = {}

        if(!(item.userid in users)){
            users[item.userid] = {}
        }

        if(!users[item.userid].score){
            users[item.userid].score = 0
        }

        var score = await redisCli.hGet(item.puuid+'_score','score')
        score = score?score:0
        users[item.userid].score += parseInt(score)

        if(!users[item.userid].solvedProblems){
            users[item.userid].solvedProblems = []
        }
        users[item.userid].solvedProblems.push(item.puuid)
        users[item.userid].cuuid = item.cuuid

    }

    console.log(users)

    for(var userid in users){
        var user = users[userid]
        await redisCli.set(md5(user.cuuid + userid )+'_userScore',user.score)

        // console.log('user.score: ',user.score,'user.solvedProblems: ',user.solvedProblems)

        await redisCli.del(md5(user.cuuid + userid)+'_userSolved')
        for(var puuid of user.solvedProblems){
            await redisCli.rPush(md5(user.cuuid + userid)+'_userSolved',puuid)
        }
    }
}

async function getUserScore(cuuid,uuid){

}


async function deleteall(pattern){
    var keys = await redisCli.keys(pattern)
    for(var i =0;i<keys.length;i++){
        console.log(keys[i])
        await redisCli.del(keys[i])
    }
}

async function submitFlag() {
  try {
    await initClient() 
    // await inte()

    await scoreBoard('1bd4bb19-da19-4ed9-992e-6d874e9f6b56')
    // await deleteall('*_score')
    // await deleteall('*Blood')
    // await deleteall('*S*')


    // await updateProblemScore('9196147e-d25b-4337-b403-db31ee0b4ad6')

    // var userids = ['36083d07-d334-49f6-bc60-cb360d79e2e0','4ee9c23e-5e83-464f-9b6e-ca842cffd27b']
    // var puuids = ['4773d51d-4863-46a2-b124-14eeb6782bd4','b137115a-b3fc-42e2-b8e6-409dbabfd258','609cf3a8-d09f-4e3f-b532-68106d28da9b']
    
    // for(var i =0;i<puuids.length;i++){
    //     for(var j =0;j<puuids.length;j++){
    //         var userid = userids[i]
    //         var puuid = puuids[j]
    //         var blood = await updateProblemScore(puuid)
    //         // if(blood<4){
    //         //     await setBlood(userid,puuid,blood)
    //         // }
    //     }
    // }

    // await flushUserScoreAndSolve()

    // console.log('==============================scoreboard==============================')
    // await scoreBoard('1bd4bb19-da19-4ed9-992e-6d874e9f6b56')
    
  } finally {
    await redisCli.quit();
    await dbCli.close();
  }
}


submitFlag().catch(console.dir);