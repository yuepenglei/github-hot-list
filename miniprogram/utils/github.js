
const utils = require('../utils/util.js')
const repos = require('../api/repos/index.js')

//获取热榜数据
const trendings = (since, language) => new Promise((resolve, reject) => {
  const url = 'https://github-trending-api.now.sh/repositories';
  wx.request({
    url: url, 
    method:"GET",
    header: {
      'content-type': 'application/json' 
    },
    data: { since, language },
    success(res) {
      const trends = res.data.map((it, index) => {
        it.stargazers_count = it.stars
        it.full_name = `${it.author}/${it.name}`
        it.item_index = index + 1
        it.star_status = false
        return it
      })
      resolve(trends) 
    },
    fail(error){
      errorHandler()
      reject(error)
    }
  })
})

//获取项目详情
const getRepo = (url) => new Promise((resolve, reject) => {
  wx.request({
    url: url, 
    method: "GET",
    header: {
      'content-type': 'application/json' // 默认值
    },
    data: { url },
    success(res) {
      const repo = res.data
      repo.created_at = utils.toReadableTime(repo.created_at)
      repo.updated_at = utils.toReadableTime(repo.updated_at)
      repo.pushed_at = utils.toReadableTime(repo.pushed_at)
      resolve({
        repo
      })
    },
    fail(error) {
      errorHandler()
      reject(error)
    }
  })
})

//读取ReadMe
const getFile = (url) => new Promise((resolve, reject) => {
  wx.request({
    url: url,
    method: "GET",
    header: {
      'content-type': 'application/json' // 默认值
    },
    data: { url },
    success(res) {
      const data = res.data
      //debugger
      if (res.statusCode !== 200) {
        reject(new Error(data))
      }
      resolve(data)
    },
    fail(error) {
      errorHandler()
      reject(error)
    }
  })
})


function errorHandler() {
  wx.showToast({
    title: '网络异常, 稍后再试',
    icon: 'none'
  })
}

module.exports = {
  trendings, getRepo, getFile, repos
}