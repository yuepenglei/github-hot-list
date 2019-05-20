const util = require('../../utils/util.js')
const wxdb = require('../../utils/wxdb.js')

Component({

  properties: {

  },

  data: {

  },

  methods: {
    getFormId: function (e) {
      let bol = util.isUpdateFormId();
      if(bol){
        wxdb.getOpenid().then(data => {
          wxdb.updateFormId(data, e.detail.formId).then(data => {
            util.updateFormId();
          });
        })
      }
      console.log(e.detail.formId)
    }
  }
})
