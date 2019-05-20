// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let res = await cloud.openapi.templateMessage.send({
    touser: event._openid,
    page: 'pages/trends/trends',
    data: {
      keyword1: {
        value: '排行榜单有新的变化'
      },
      keyword2: {
        value: '点击通知，直达热门项目榜单'
      }
    },
    templateId: 'wCV3Au2lzuvRrNlOwiBtfOz9Ortyi4vgb_1ZWVo0tV4',
    formId: event.form_id,
  })
}