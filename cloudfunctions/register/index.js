// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
exports.main = async (event, context) => {
  try {
    return await db.collection('user').add({
      data: {
        _id: event.userInfo.openId,
        _openid: event.userInfo.openId,
        gender: event.gender,
        province: event.province,
        city: event.city,
        stars: new Array(),
        create_time: db.serverDate()
      },
    })
  } catch (e) {
    console.error(e)
  }
}