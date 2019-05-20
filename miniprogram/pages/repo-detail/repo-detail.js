const github = require('../../api/github.js')
const utils = require('../../utils/util.js')
const wxdb = require('../../utils/wxdb.js')
const defaultUrl = ''
const app = getApp()

Page({
  data: {
    url: undefined,
    repo: {},
    issues: [],
    pulls: [],
    contributors: [],
    showTabs: false,
    isStarred: false,
    isWatching: false,
    // 组件所需的参数
    nvabarData: {
      title: '', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20, 
  },

  onLoad: function(options) {
    var url = decodeURIComponent(options.url || defaultUrl)
    this.setData({
      url
    })
    this.reloadData()


    this['event_bind_tap'] = event => {
      const target = ((event.target.dataset._el || {})._e || {})
      if (target.tagName === 'a' && target.attr && target.attr.href) {
        this.urlClicked(target.attr.href)
      }
    };

  },

  onShareAppMessage: function(options) {
    var url = this.data.url
    var title = this.data.repo.full_name
    return {
      title,
      path: `/pages/repo-detail/repo-detail?url=${url}`
    }
  },

  //加载ReadMe
  tryGetReadMe: function(repo) {
    let readMeUrl = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/README.md`

    return new Promise((resolve, reject) => {
      github.getFile(readMeUrl).then(readMeContent => {
        let parsed = app.towxml.toJson(
          readMeContent,
          'markdown'
        )
        parsed = app.towxml.initData(parsed, {
          base: `https://github.com/${this.data.repo.full_name}/raw/master/`,
          app: this
        })
        parsed.theme = 'dark'

        this.setData({
          article: parsed
        })
        resolve({})
      }).catch(error => {
        readMeUrl = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/readme.md`
        github.getFile(readMeUrl).then(readMeContent => {
          let parsed = app.towxml.toJson(
            readMeContent,
            'markdown'
          )
          parsed = app.towxml.initData(parsed, {
            base: `https://github.com/${this.data.repo.full_name}/raw/master/`,
            app: this
          })
          parsed.theme = 'dark'
          this.setData({
            article: parsed
          })
          resolve({})
        }).catch(error => reject(error))
      })
    })
  },

  //加载 Issues
  tryGetIssues: function() {
    wx.showNavigationBarLoading({})
    const repoFullName = this.data.repo.full_name
    github.repos(repoFullName).issues().end().then(issues => {
      console.log(issues)
      this.setData({
        issues
      })
      wx.hideNavigationBarLoading({})
    }).catch(error => wx.hideNavigationBarLoading({}))
  },

  //加载 Pulls
  tryGetPulls: function() {
    wx.showNavigationBarLoading({})
    const repoFullName = this.data.repo.full_name
    github.repos(repoFullName).pulls().then(pulls => {
      console.log(pulls)
      this.setData({
        pulls
      })
      wx.hideNavigationBarLoading({})
    }).catch(error => wx.hideNavigationBarLoading({}))
  },

  //加载 Contributors
  tryGetContributors: function () {
    wx.showNavigationBarLoading({})
    const repoFullName = this.data.repo.full_name
    github.repos(repoFullName).contributors().then(contributors => {
      this.setData({
        contributors
      })
      wx.hideNavigationBarLoading({})
    }).catch(error => wx.hideNavigationBarLoading({}))
  },

  //获取 start 状态-github
  loadStarStatus: function() {
    const repo = this.data.repo
    github.user().starred(repo.full_name).get().then(isStarred => {
      this.setData({
        isStarred
      })
    }, error => {})
  },
 //获取 watch 状态-github
  loadWatchingStatus: function() {
    const repo = this.data.repo
    github.repos(repo.full_name).subscription().get().then(isWatching => {
      this.setData({
        isWatching
      })
    }, error => {})
  },

  reloadData: function() {
    wx.showLoading({
      title: '正在获取数据',
      mask: true
    })
    github.getRepo(this.data.url).then(res => {
      const { repo } = res
      app.globalData.myStars.forEach(star => {
        if (repo.html_url == star.url) {
          repo.star_status = true;
        }
      });
      repo.owner.avatar_url = repo.owner.avatar_url + '&s=50'
      const showTabs = repo != undefined
      this.setData({
        repo,
        showTabs,
        "nvabarData.title": repo.full_name
      })
      wx.hideLoading()
      //加载 watch star 状态
      this.loadWatchingStatus()
      this.loadStarStatus()
      this.tryGetReadMe(repo).then(res => wx.hideNavigationBarLoading({})).catch(error => wx.hideNavigationBarLoading({}))
    }).catch(error => wx.hideNavigationBarLoading({}))
  },

  //切换加载 ReadMe Issues Pull Requests
  changeTab: function(event) {
    const tabIndex = event.detail.index
    switch (tabIndex) {
      case 0:
        break
      case 1:
        if (this.data.pulls.length === 0) {
          this.tryGetPulls()
        }
        break
      case 2:
        if (this.data.contributors.length === 0) {
          this.tryGetContributors()
        }
        break
      default:
        break
    }
  },

  urlClicked: function(url) {
    const repoRegExp = /^https:\/\/github.com\/(.*?\/.*?)(\/.*)?$/
    if (repoRegExp.test(url)) {
      const repoFullName = url.replace(repoRegExp, '$1')
      const repoUrl = `/pages/repo-detail/repo-detail?url=https://api.github.com/repos/${repoFullName}`
      wx.navigateTo({
        url: repoUrl,
      })
      return
    }
    wx.setClipboardData({
      data: url,
      success() {
        wx.showToast({
          title: '链接已复制',
          duration: 2000,
        })
      },
    })
  },

  toUserDetail: function() {
    const username = this.data.repo.owner.login
    wx.navigateTo({
      url: `/pages/user/user?username=${username}`,
    })
  },

  increaseRepoStar: function(num) {
    const {
      repo
    } = this.data
    repo.stargazers_count += num
    this.setData({
      repo,
      isStarred:num > 0?true:false
    })
  },

  increaseRepoWatcher: function(num) {
    const {
      repo
    } = this.data
    repo.subscribers_count += num
    this.setData({
      repo,
      isWatching: num > 0 ? true : false
    })
  },

  // 标星 toggleStar
  toggleStar: function() {
    if (!utils.ensureSignedIn()) return
    const isStarred = this.data.isStarred
    const repoFullName = this.data.repo.full_name
    if (isStarred) {
      wx.showLoading({
        title: '正在取消 Star',
        mask: true
      })
      github.user().starred(repoFullName).delete().then(res => {
        wx.hideLoading()
        this.increaseRepoStar(-1)
        this.loadStarStatus()
      }).catch(res => {
        wx.hideLoading()
        this.loadStarStatus()
      })
    } else {
      wx.showLoading({
        title: '正在添加 Star',
        mask: true
      })
      github.user().starred(repoFullName).put().then(res => {
        wx.hideLoading()
        this.increaseRepoStar(1)
        this.loadStarStatus()
      }).catch(res => {
        wx.hideLoading()
        this.loadStarStatus()
      })
    }
  },

  //标记 watch
  toggleWatching: function () {
    if (!utils.ensureSignedIn()) return
    const isWatching = this.data.isWatching
    const repoFullName = this.data.repo.full_name
    if (isWatching) {
      wx.showLoading({
        title: 'Stopping Watching',
        mask: true
      })
      github.repos(repoFullName).subscription().delete().then(res => {
        wx.hideLoading()
        this.increaseRepoWatcher(-1)
        this.loadWatchingStatus()
      }).catch(res => {
        wx.hideLoading()
        this.loadWatchingStatus()
      })
    } else {
      wx.showLoading({
        title: 'Starting Watching',
        mask: true
      })
      github.repos(repoFullName).subscription().put().then(res => {
        wx.hideLoading()
        this.increaseRepoWatcher(1)
        this.loadWatchingStatus()
      }).catch(res => {
        wx.hideLoading()
        this.loadWatchingStatus()
      })
    }
  },

  //标记 fork
  forkRepo: function () {
    if (!utils.ensureSignedIn()) return
    const repoFullName = this.data.repo.full_name
    wx.showModal({
      title: 'GitHub 热榜',
      content: `是否确认 Fork ${repoFullName}`,
      success: res => {
        if (res.confirm) {
          this.doForking()
        }
      }
    })
  },

  doForking: function () {
    const repoFullName = this.data.repo.full_name
    wx.showLoading({
      title: 'Forking',
      mask: true
    })
    github.repos(repoFullName).forks().post().then(success => {
      if (success) {
        wx.hideLoading()
        wx.showToast({
          title: 'Fork 成功'
        })
      } else {
        wx.showToast({
          title: 'Fork 失败',
          icon: 'none'
        })
      }
    }).catch(res => {
      wx.hideLoading()
    })
  },

  //监听收藏
  onStar: function (event) {
    let repo = event.currentTarget.dataset.repo;
    wxdb.getOpenid().then(openid => {
      if (repo.star_status) {
        this.canselStar(openid, repo);
      } else {
        this.addStar(openid, repo);
      }
    })
    //通知热榜刷新
    app.globalData.trendingLoad = true;

  },

  //添加收藏
  addStar: function (openid, repo) {
    let that = this;
    let star = {
      author: repo.owner.login,
      name: repo.name,
      full_name: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      language: repo.language,
      avatar: repo.owner.avatar_url,

    }
    wxdb.addStar(openid, star).then(data => {
      wx.showToast({
        title: '收藏成功',
      })
      //更新全局变量-我的收藏
      app.globalData.myStars.unshift(star);
      this.setData({
        "repo.star_status": true
      })
    })
  },

  //取消收藏
  canselStar: function (openid, repo) {
    let that = this;
    let stars = new Array();
    //过滤
    stars = app.globalData.myStars.filter((it, index) => {
      return repo.html_url != it.url
    });
    //重置我的收藏列表
    wxdb.setStar(openid, stars).then(data => {
      wx.showToast({
        title: '取消收藏成功',
      })
      //更新全局变量-我的收藏
      app.globalData.myStars = stars;
      this.setData({
        "repo.star_status" : false
      })
    })
  },

})