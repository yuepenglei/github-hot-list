// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const MAX_LIMIT = 100
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {

  var start = new Date(new Date(new Date().toLocaleDateString())).getTime();
  var end = new Date(new Date(new Date().toLocaleDateString()).setDate(new Date().getDate() + 1)).getTime();
  // var start = new Date(new Date(new Date().toLocaleDateString()).setDate(new Date().getDate() - 3)).getTime();
  // var end = new Date(new Date(new Date().toLocaleDateString()).setDate(new Date().getDate() - 2)).getTime();


  // 先取出集合记录总数
  const countResult = await db.collection('user').where({
    last_time: _.gt(start).and(_.lt(end))
  }).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  let tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = await db.collection('user').field({
      _openid: true,
      form_id: true
    }).where({
      last_time: _.gt(start).and(_.lt(end))
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return tasks;

}