const STORAGE_KEY = 'PLUG-ADD-MYAPP-KEY';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 提示文字
    text: {
      type: String,
      value: '点击「添加小程序」，下次访问更便捷 >'
    },
    // 多少秒后关闭
    duration: {
      type: Number,
      value: 10
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    SHOW_TOP: false,
    SHOW_MODAL: false,
    windowWidth:500,
    windowHeight: 600,
  },

  onLoad: function (){
    wx.getSystemInfo({
      success(res) {
        this.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight
        });
      }
    })
  },

  ready: function () {

  },

  /**
   * 组件的方法列表
   */
  methods: {

    //执行显示提醒
    doShowModal: function () {
      // 判断是否已经显示过
      let cache = wx.getStorageSync(STORAGE_KEY);
      if (cache) return;
      // 没显示过，则进行展示
      this.setData({
        SHOW_TOP: true
      });
      // 关闭时间
      setTimeout(() => {
        this.setData({
          SHOW_TOP: false
        })
        wx.setStorage({
          key: STORAGE_KEY,
          data: +new Date,
        });
      }, this.data.duration * 1000);
    },

    // 显示全屏添加说明
    showModal: function () {
      this.setData({
        SHOW_TOP: false,
        SHOW_MODAL: true
      });
    },

    okHandler: function () {
      this.setData({
        SHOW_MODAL: false
      });
      wx.setStorage({
        key: STORAGE_KEY,
        data: +new Date,
      });
    }
  }
})