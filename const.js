const env = require("./env")

let resurl
let mp3FilePath
let dbHost
let dbUser
let dbPwd
if(env === 'dev'){
  resurl = 'http://localhost:9001'
  mp3FilePath = 'C:/Users/Everg/Desktop/resource/mp3'
  dbHost = 'localhost'
  dbUser = 'root'
  dbPwd = 'root'
}else if(env === 'prod'){
  resurl = 'http://59.110.220.84/book'
  mp3FilePath = '/root/nginx/upload/book/mp3'
  dbHost = '59.110.220.84'
  dbUser = 'root'
  dbPwd = 'root'
}
//nginx服务器地址(存储了书籍图片,字体,主题,解析后的书籍数据)

const category = [
  'ComputerScience',
  'SocialSciences',
  'Economics',
  'Education',
  'Engineering',
  'Environment',
  'Geography',
  'History',
  'Laws',
  'LifeSciences',
  'Literature',
  'Biomedicine',
  'BusinessandManagement',
  'EarthSciences',
  'MaterialsScience',
  'Mathematics',
  'MedicineAndPublicHealth',
  'Philosophy',
  'Physics',
  'PoliticalScienceAndInternationalRelations',
  'Psychology',
  'Statistics'
]

module.exports = {
  resurl,
  category,
  mp3FilePath,
  dbHost,
  dbPwd,
  dbUser
}



