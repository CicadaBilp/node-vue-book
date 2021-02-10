
//导入express库
const express = require('express')
//导入跨域支持的库
const cors = require('cors')
const voice = require('./voice')
const consts = require('./const')
//导入mysql库
const mysql = require('mysql')
//调用express导出的函数生成服务器对象
const app = express()
app.use(cors()) 

//连接数据库的函数
function connection() {
  return mysql.createConnection({
    host: consts.dbHost,
    user: consts.dbUser,
    password: consts.dbPwd,
    database: 'book'
  })
}
//返回随机数数组
function rand(n, l) {
  let arr = []
  for (let i = 0; i < n; i++) {
    arr.push(Math.floor(Math.random() * l))
  }
  return arr
}
//根据id从书籍数据中获取对应书籍并拼接封面的路径
function createData(result, key) {
  return handleData(result[key])
}
//为每本书对象添加一些属性
function handleData(data) {
  if (!data.cover.startsWith('http://')) {
    data['cover'] = `${consts.resurl}/img${data.cover}`
  }
  data['selected'] = false
  data['private'] = false
  data['cache'] = false
  data['haveRead'] = false
  return data
}
//返回猜你喜欢数组
function createGuessYouLike(data) {
  const n = parseInt(rand(1, 3)) + 1
  data['type'] = n
  switch (n) {
    case 1:
      data['result'] = data.id % 2 === 0 ? '《Exexuting Magic》' : '《Elements Of Robotics》'
      break;
    case 2:
      data['result'] = data.id % 2 === 0 ? '《Improving Psychiatric Care》' : '《Programming Languages》'
      break;
    case 3:
      data['result'] = '《Living with Disfigurement》'
      data['percent'] = data.id % 2 === 0 ? '90%' : '94%'
      break;
  }
  return data
}
//返回热门推荐数组
function createRecommend(data) {
  data['readers'] = Math.floor(data.id / 2 * rand(1, 100))
  return data
}
//传入想展示的分类数返回分类id数组
function createCategoryIds(n) {
  const arr = []
  //遍历分类数组,将index加1重新写入一个数组
  consts.category.forEach((item, index) => {
    arr.push(index + 1)
  })
  const res = []
  //生成n个随机数,作为arr的下标
  for (let i = 0; i < n; i++) {
    const ran = Math.floor(Math.random() * (arr.length - i))
    //将随机数去arr中取值,结果push进res
    res.push(arr[ran])
    arr[ran] = arr[arr.length - i - 1]
  }
  return res
}
//返回选定的分类及取其中四本书展示的数组
function createCategoryData(result) {
  const categoryIds = createCategoryIds(6)
  const resu = []
  categoryIds.forEach(categoryId => {
    const subList = result.filter(item => item.category === categoryId).slice(0, 4)
    subList.map(item => handleData(item))
    resu.push({
      category: categoryId,
      list: subList
    })
  })
  return resu.filter(item => item.list.length === 4)
}

//对book/home首页路由响应
app.get('/book/home', (req, res) => {
  const conn = connection()
  conn.query('select * from book where cover != \'\'', (err, result) => {
    const length = result.length
    const guessYouLike = []
    const banner = consts.resurl + '/home_banner2.jpg'
    const recommend = []
    const featured = []
    const random = []
    const categoryList = createCategoryData(result)
    const categories = [
      { category: 1, num: 56, img1: consts.resurl + "/cover/cs/A978-3-319-62533-1_CoverFigure.jpg", img2: consts.resurl + "/cover/cs/A978-3-319-89366-2_CoverFigure.jpg" },
      { category: 2, num: 51, img1: consts.resurl + "/cover/ss/A978-3-319-61291-1_CoverFigure.jpg", img2: consts.resurl + "/cover/ss/A978-3-319-69299-9_CoverFigure.jpg" },
      { category: 3, num: 32, img1: consts.resurl + "/cover/eco/A978-3-319-69772-7_CoverFigure.jpg", img2: consts.resurl + "/cover/eco/A978-3-319-76222-7_CoverFigure.jpg" },
      { category: 4, num: 60, img1: consts.resurl + "/cover/edu/A978-981-13-0194-0_CoverFigure.jpg", img2: consts.resurl + "/cover/edu/978-3-319-72170-5_CoverFigure.jpg" },
      { category: 5, num: 23, img1: consts.resurl + "/cover/eng/A978-3-319-39889-1_CoverFigure.jpg", img2: consts.resurl + "/cover/eng/A978-3-319-00026-8_CoverFigure.jpg" },
      { category: 6, num: 42, img1: consts.resurl + "/cover/env/A978-3-319-12039-3_CoverFigure.jpg", img2: consts.resurl + "/cover/env/A978-4-431-54340-4_CoverFigure.jpg" },
      { category: 7, num: 7, img1: consts.resurl + "/cover/geo/A978-3-319-56091-5_CoverFigure.jpg", img2: consts.resurl + "/cover/geo/978-3-319-75593-9_CoverFigure.jpg" },
      { category: 8, num: 18, img1: consts.resurl + "/cover/his/978-3-319-65244-3_CoverFigure.jpg", img2: consts.resurl + "/cover/his/978-3-319-92964-4_CoverFigure.jpg" },
      { category: 9, num: 13, img1: consts.resurl + "/cover/law/2015_Book_ProtectingTheRightsOfPeopleWit.jpeg", img2: consts.resurl + "/cover/law/2016_Book_ReconsideringConstitutionalFor.jpeg" },
      { category: 10, num: 24, img1: consts.resurl + "/cover/ls/A978-3-319-27288-7_CoverFigure.jpg", img2: consts.resurl + "/cover/ls/A978-1-4939-3743-1_CoverFigure.jpg" },
      { category: 11, num: 6, img1: consts.resurl + "/cover/lit/2015_humanities.jpg", img2: consts.resurl + "/cover/lit/A978-3-319-44388-1_CoverFigure_HTML.jpg" },
      { category: 12, num: 14, img1: consts.resurl + "/cover/bio/2016_Book_ATimeForMetabolismAndHormones.jpeg", img2: consts.resurl + "/cover/bio/2017_Book_SnowSportsTraumaAndSafety.jpeg" },
      { category: 13, num: 16, img1: consts.resurl + "/cover/bm/2017_Book_FashionFigures.jpeg", img2: consts.resurl + "/cover/bm/2018_Book_HeterogeneityHighPerformanceCo.jpeg" },
      { category: 14, num: 16, img1: consts.resurl + "/cover/es/2017_Book_AdvancingCultureOfLivingWithLa.jpeg", img2: consts.resurl + "/cover/es/2017_Book_ChinaSGasDevelopmentStrategies.jpeg" },
      { category: 15, num: 2, img1: consts.resurl + "/cover/ms/2018_Book_ProceedingsOfTheScientific-Pra.jpeg", img2: consts.resurl + "/cover/ms/2018_Book_ProceedingsOfTheScientific-Pra.jpeg" },
      { category: 16, num: 9, img1: consts.resurl + "/cover/mat/2016_Book_AdvancesInDiscreteDifferential.jpeg", img2: consts.resurl + "/cover/mat/2016_Book_ComputingCharacterizationsOfDr.jpeg" },
      { category: 17, num: 20, img1: consts.resurl + "/cover/map/2013_Book_TheSouthTexasHealthStatusRevie.jpeg", img2: consts.resurl + "/cover/map/2016_Book_SecondaryAnalysisOfElectronicH.jpeg" },
      { category: 18, num: 16, img1: consts.resurl + "/cover/phi/2015_Book_TheOnlifeManifesto.jpeg", img2: consts.resurl + "/cover/phi/2017_Book_Anti-VivisectionAndTheProfessi.jpeg" },
      { category: 19, num: 10, img1: consts.resurl + "/cover/phy/2016_Book_OpticsInOurTime.jpeg", img2: consts.resurl + "/cover/phy/2017_Book_InterferometryAndSynthesisInRa.jpeg" },
      { category: 20, num: 26, img1: consts.resurl + "/cover/psa/2016_Book_EnvironmentalGovernanceInLatin.jpeg", img2: consts.resurl + "/cover/psa/2017_Book_RisingPowersAndPeacebuilding.jpeg" },
      { category: 21, num: 3, img1: consts.resurl + "/cover/psy/2015_Book_PromotingSocialDialogueInEurop.jpeg", img2: consts.resurl + "/cover/psy/2015_Book_RethinkingInterdisciplinarityA.jpeg" },
      { category: 22, num: 1, img1: consts.resurl + "/cover/sta/2013_Book_ShipAndOffshoreStructureDesign.jpeg", img2: consts.resurl + "/cover/sta/2013_Book_ShipAndOffshoreStructureDesign.jpeg" }
    ]
    rand(9, length).forEach(key => {
      guessYouLike.push(createGuessYouLike(createData(result, key)))
    })
    rand(3, length).forEach(key => {
      recommend.push(createRecommend(createData(result, key)))
    })
    rand(6, length).forEach(key => {
      featured.push(createData(result, key))
    })
    rand(1, length).forEach(key => {
      random.push(createData(result, key))
    })
    res.json({
      guessYouLike,
      banner,
      recommend,
      featured,
      categoryList,
      categories,
      random
    })
  })
  conn.end()
})

//对book/detail的响应
app.get('/book/detail', (req, res) => {
  const conn = connection()
  const fileName = req.query.fileName
  const sql = `select * from book where fileName='${fileName}'`
  conn.query(sql, (err, result) => {
    if (err) {
      res.json({
        error_code: 1,
        msg: '详情获取失败'
      })
    } else {
      if (result && result.length === 0) {
        res.json({
          error_code: 1,
          msg: '详情获取失败'
        })
      } else {
        const book = handleData(result[0])
        res.json({
          error_code: 0,
          msg: '获取成功',
          data: book
        })
      }
    }
    conn.end()
  })
})

//对book/list的响应(全部分类及下的图书)
app.get('/book/list',(req,res) => {
  const conn = connection()
  conn.query('select * from book where cover != \'\'',(err,result) => {
    if(err){
      res.json({
        error_code:1,
        msg:'获取失败'
      })
    }else{
      result.forEach(item => { handleData(item) })
      const data = {}
      consts.category.forEach(categoryText => {
        data[categoryText] = result.filter(item => item.categoryText === categoryText)
      })
      res.json({
        error_code:0,
        msg:'获取成功',
        data,
        total:result.length
      })
    }
    conn.end()
  })
})
//对book/flat-list(首页搜索时)
app.get('/book/flat-list',(req,res) => {
  const conn = connection()
  conn.query('select * from book where cover != \'\'',(err,result) => {
    if(err){
      res.json({
        error_code:1,
        msg:'获取失败'
      })
    }else{
      result.forEach(item => { handleData(item) })
      res.json({
        error_code:0,
        msg:'获取成功',
        data:result,
        total:result.length
      })
    }
    conn.end()
  })
})
//book/shelf,返回书架数据接口,默认返回空数组,
app.get('/book/shelf',(req,res) => {
  res.json({
    bookList:[]
  })
})
//处理语音合成的
app.get('/voice',(req,res) => {
  voice(req,res)
})


app.listen(4000, () => {
  console.log('sueecss,端口4000');
})