//nginx服务器地址(存储了书籍图片,字体,主题,解析后的书籍数据)
const resurl = 'http://localhost:9001'

const mp3FilePath = 'C:/Users/Everg/Desktop/resource/mp3'
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
  mp3FilePath
}

