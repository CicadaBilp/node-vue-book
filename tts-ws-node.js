/* Created by iflytek on 2020/03/01.
 *
 * 运行前：请先填写 appid、apiSecret、apiKey
 * 
 * 在线语音合成调用demo
 * 此demo只是一个简单的调用示例，不适合用到实际生产环境中
 *
 * 在线语音合成 WebAPI 接口调用示例 接口文档（必看）：https://www.xfyun.cn/doc/tts/online_tts/API.html
 * 错误码链接：
 * https://www.xfyun.cn/document/error-code （code返回错误码时必看）
 * 
 */
const resurl = require('./const').resurl
const mp3FilePath = require('./const').mp3FilePath
const CryptoJS = require('crypto-js')
const WebSocket = require('ws')
var log = require('log4node')
var fs = require('fs')

function keda(text) {
    //本次音频文件名,时间戳
    const fileName = new Date().getTime()
    //音频文件保存在存放资源的nginx中MP3文件夹下
    const filePath = `${mp3FilePath}/${fileName}.mp3`
    //需要返回前端该音频的下载路径,就是nginx服务器上
    const downloadUrl = `${resurl}/mp3/${fileName}.mp3`

    // 系统配置 
    const config = {
        // 请求地址
        hostUrl: "wss://tts-api.xfyun.cn/v2/tts",
        host: "tts-api.xfyun.cn",
        appid: "5ff92321",
        apiSecret: "6431768abaff7e72f2d5076d2e017914",
        apiKey: "6b03987a3e0043cf5671989d4afd0b96",
        text,
        uri: "/v2/tts",
    }

    // 获取当前时间 RFC1123格式
    let date = (new Date().toUTCString())
    // 设置当前临时状态为初始化

    let wssUrl = config.hostUrl + "?authorization=" + getAuthStr(date,config) + "&date=" + date + "&host=" + config.host
    let ws = new WebSocket(wssUrl)

    // 连接建立完毕，读取数据进行识别
    ws.on('open', () => {
        log.info("websocket connect!")
        send(ws,config)
        // 如果之前保存过音频文件，删除之
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    log.error('remove error: ' + err)
                }
            })
        }
    })

    // 得到结果后进行处理，仅供参考，具体业务具体对待
    ws.on('message', (data, err) => {
        if (err) {
            log.error('message error: ' + err)
            return
        }

        let res = JSON.parse(data)

        if (res.code != 0) {
            log.error(`${res.code}: ${res.message}`)
            ws.close()
            return
        }

        let audio = res.data.audio
        let audioBuf = Buffer.from(audio, 'base64')

        save(audioBuf,filePath)

        if (res.code == 0 && res.data.status == 2) {
            ws.close()
        }
    })
    // 资源释放
    ws.on('close', () => {
        log.info('connect close!')
    })

    // 连接错误
    ws.on('error', (err) => {
        log.error("websocket connect err: " + err)
    })
    return downloadUrl
}




// 鉴权签名
function getAuthStr(date,config) {
    let signatureOrigin = `host: ${config.host}\ndate: ${date}\nGET ${config.uri} HTTP/1.1`
    let signatureSha = CryptoJS.HmacSHA256(signatureOrigin, config.apiSecret)
    let signature = CryptoJS.enc.Base64.stringify(signatureSha)
    let authorizationOrigin = `api_key="${config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
    let authStr = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin))
    return authStr
}

// 传输数据
function send(ws,config) {
    let frame = {
        // 填充common
        "common": {
            "app_id": config.appid
        },
        // 填充business
        "business": {
            "aue": "lame",
            "auf": "audio/L16;rate=16000",
            "vcn": "xiaoyan",
            "tte": "UTF8",
            "sfl": 1
        },
        // 填充data
        "data": {
            "text": Buffer.from(config.text).toString('base64'),
            "status": 2
        }
    }
    ws.send(JSON.stringify(frame))
}

// 保存文件
function save(data,filePath) {
    fs.writeFile(filePath, data, { flag: 'a' }, (err) => {
        if (err) {
            log.error('save error: ' + err)
            return
        }

        log.info('文件保存成功')
    })
}
module.exports = {
    keda
}
