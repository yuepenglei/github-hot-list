// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  const res = await cloud.callFunction({name: 'getInactiveUsers'});
  let list = res.result;
  for (let i = 0; i < list.length; i++) {
    let userList = list[i].data;
    for (let j = 0; j < userList.length; j++){
      try {
        
        await cloud.openapi.templateMessage.send({
          touser: userList[j]._openid,
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
          formId: userList[j].form_id,
        })
        let data = { code: "111", msg: "msg", _openid: userList[j]._openid, form_id: userList[j].form_id}
        await cloud.callFunction({ name: 'sendSuccessLog', data: data });
      } catch (e) {
        let data = { code: e.errCode, msg: e.errMsg, _openid: userList[j]._openid, form_id: userList[j].form_id}
        await cloud.callFunction({ name: 'sendFailLog', data: data });
      }

    }

  }
}