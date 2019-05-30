const github = require('../../api/github.js')
const wxdb = require('../../utils/wxdb.js')
const app = getApp()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    url:""
  },

  onLoad: function () {
    let that = this;
    wx.getSetting({
      success(res) {
        //信息沒有过时
        if (res.authSetting['scope.userInfo']) {
          wx.switchTab({
            url: '/pages/trends/trends',
          });
        }
      }
    })
  },

  //微信授权
  bindGetUserInfo: function (e) {
    let that = this;
    let userInfo = e.detail.userInfo;
debugger

    wx.cloud.callFunction({
      name: 'register',
      data: {
        gender: userInfo.gender,
        province: userInfo.province,
        city: userInfo.city,
        stars: new Array()
      }}).then(res => {
        wx.setStorageSync('wxSignedIn', true);
        wx.navigateBack({})
      }).catch(error => {
        console.log("云函数注册调用失败") // 3
        console.error
        })
  },


  //跳转页面
  goToPage: function (){
    let that = this;
    let formData = wx.getLaunchOptionsSync();
    let path = formData.path;
    if (path.indexOf("pages/index") > -1){
      wx.reLaunch({
        url: "/pages/trends/trends"
      })
    }else{
      //分享页面来的
      app.globalData.share = true
      let params = that.queryParam(formData.query);
      wx.reLaunch({
        url: "/" + formData.path + "?" + params
      })
    }
  },

  //参数拼接
  queryParam: function (query) {
    let params = "";
    for (let k of Object.keys(query)) {
      params = params + k + "=" + query[k] + "&";
    }
    params = params.substring(0, params.length - 1);
    return params;
  },

})