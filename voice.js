const keda = require('./tts-ws-node').keda

function createVoice(req,res){
  const text = req.query.text
  const lang = req.query.lang
  const result = keda(text)
  if(result){
    res.json({
      error_code:0,
      msg:'下载成功',
      path:result
    })
  }else{
    res.json({
      error_code:1,
      mag:'下载失败'
    })
  }
}

module.exports = createVoice