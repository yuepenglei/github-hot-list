exports.main = (event, context) => {
  return {
    openid: event.userInfo.openId,
    event,
    sum:222
  }
}
