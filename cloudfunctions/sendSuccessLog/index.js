// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('send_success_log').add({
      data: {
        _openid: event._openid,
        form_id: event.form_id,
        errCode: event.code,
        errMsg: event.msg,
        create_time: new Date()
      },
    })
  } catch (e) {
    console.error(e)
  }
}