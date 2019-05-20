const app = getApp()

//获取openid
const getOpenid = () => new Promise((resolve, reject) => {
  if (app.globalData.openid){
    resolve(app.globalData.openid);
  }else{
    wx.cloud.callFunction({
      name: 'login',
      data: {},
    }).then(res => {
      console.log('[云函数] [login] user openid: ', res.result.openid)
      app.globalData.openid = res.result.openid;
      resolve(res.result.openid)
      }).catch(error => {
        console.error('[云函数] [login] 调用失败', error)
        reject(error)
      })
  }
})

//查询收藏
const queryStar = (_openid) => new Promise((resolve, reject) => {
  const db = wx.cloud.database()
  db.collection('user').doc(
    _openid
  ).get().then(result => {
      console.log('[数据库] [查询记录] 成功: ', result)
      resolve(result.data.stars)
    }).catch(error => {
      console.error('[数据库] [查询记录] 失败：', error)
      reject(error)
    })
})

//添加收藏
const addStar = (_openid, star) => new Promise((resolve, reject) => {
  const db = wx.cloud.database();
  star.create_time = db.serverDate()
  const _ = db.command;
  db.collection('user').doc(_openid).update({
    data: {
      stars: _.unshift(star)
    }
  }).then(result => {
    console.log('[数据库] [添加收藏] 成功: ', result)
    resolve(result)
  }).catch(error => {
    console.error('[数据库] [添加收藏] 失败：', error)
    reject(error)
  })
})

//取消收藏->查询收藏集合，删除元素，重写集合元素值
const setStar = (_openid, stars) => new Promise((resolve, reject) => {
  const db = wx.cloud.database();
  const _ = db.command;
  db.collection('user').doc(_openid).update({
    data: {
      stars: stars
    }
  }).then(result => {
    console.log('[数据库] [取消收藏] 成功: ', result)
    resolve(result)
  }).catch(error => {
    console.error('[数据库] [取消收藏] 失败：', error)
    reject(error)
  })
})

//更新最后登录时间
const updateLastTime = (_openid) => new Promise((resolve, reject) => {
  const db = wx.cloud.database();
  const _ = db.command;
  db.collection('user').doc(_openid).update({
    data: {
      last_time: new Date().getTime()
    }
  }).then(result => {
    console.log('[数据库] [更新最后登录时间] 成功: ', result)
    resolve(result)
  }).catch(error => {
    console.error('[数据库] [更新最后登录时间] 失败：', error)
    reject(error)
  })
})

//更新formId值
const updateFormId = (_openid, formId) => new Promise((resolve, reject) => {
  const db = wx.cloud.database();
  const _ = db.command;
  db.collection('user').doc(_openid).update({
    data: {
      form_id: formId
    }
  }).then(result => {
    console.log('[数据库] [更新formId值] 成功: ', result)
    resolve(result)
  }).catch(error => {
    console.error('[数据库] [更新formId值] 失败：', error)
    reject(error)
  })
})


module.exports = {
  getOpenid, queryStar, addStar, setStar, updateLastTime, updateFormId
}