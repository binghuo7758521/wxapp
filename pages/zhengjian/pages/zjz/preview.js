// pages/zjz/preview.js
var app = getApp(), a = (app.requirejs("jquery"), app.requirejs("core")), o = app.requirejs("foxui");
const Base64 = require('../../aliyun/Base64.js');//Base64,hmac,sha1,crypto相关算法
//参考这里https://github.com/peterhuang007/weixinFileToaliyun.git

require('../../aliyun/hmac.js');
require('../../aliyun/sha1.js');
const Crypto = require('../../aliyun/crypto.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    zjzimgurllist:[]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var t = options.specId;
    var config = wx.getStorageSync("zjz_config");
    var speclist = app.speclist;
    var spec = {};
    var color = '#ffffff';

    //未传参数specid，给他一个默认值；默认第一个尺寸的第一个颜色 219-02-12 王   
      t = 11;
      speclist[0].bg_color[0].chosen = 1;
      console.log("t:", t);
     
     

     
   
    console.log("speclist:",speclist);
    speclist.forEach(function (value, idx) {
      console.log("value.spec_id:", value.spec_id);
      console.log("t:",t);
      if (value.spec_id == t) {
        spec = value;
      }
    })
    console.log("spec:", spec);
    spec.bg_color.forEach(function (value, idx) {
      if (value.chosen == 1) {
        color = value.color;
      }
    })
    this.setData({
      specId: t,
      img: options.img,
      config: config,
      spec: spec,
      color: color
    });
    this.create_photo();
  },
  chooseColor: function(e){
    // console.log(e);
    var idx = e.currentTarget.dataset.index;
    var spec = this.data.spec;
    spec.bg_color.forEach(function(value, key){
      spec.bg_color[key].chosen = !1;
    })
    spec.bg_color[idx].chosen = !0;
    var color = spec.bg_color[idx].color;
    this.setData({
      spec: spec,
      color: color
    })


    this.create_photo();
  },
  getPolicyBase64:function () {
    let date = new Date();
    date.setHours(date.getHours() + 87600);
    let srcT = date.toISOString();
    const policyText = {
      "expiration": srcT, //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了 
      "conditions": [
        ["content-length-range", 0, 5 * 1024 * 1024] // 设置上传文件的大小限制,5mb
      ]
    };

    const policyBase64 = Base64.encode(JSON.stringify(policyText));
    return policyBase64;
  },
  getSignature:function (policyBase64) {
    const accesskey = this.data.config.Zheng_AccessKeySecret;

    const bytes = Crypto.HMAC(Crypto.SHA1, policyBase64, accesskey, {
      asBytes: true
    });
    const signature = Crypto.util.bytesToBase64(bytes);

    return signature;
  },
  getRandomCode: function(){
    var codeLength = 6;
    var randoms = [0,1,2,3,4,5,6,7,8,9];
    var code = "";
    for(var i=0; i< codeLength; i++){
      var index = Math.floor(Math.random() * 10);
      code += randoms[index];
    }
    return code;
  },
  timeFormat: function(num) {
    return num < 10 ? '0' + num : num;
  },
  payPrintPhoto: function(){
    var that =this;
    var config = this.data.config;
    var policy = this.getPolicyBase64();
    var signature = this.getSignature(policy);
    var filename,dir;
    if (config.Zheng_ossdir){
      dir = config.Zheng_ossdir;
    }else{
      dir = '';
    }
    if (config.Zheng_filename){
      filename = dir +'/'+ config.Zheng_filename;
    }else{
      var mydate = new Date();
      var code = this.getRandomCode();
      filename = dir + mydate.getFullYear() + this.timeFormat(mydate.getMonth() + 1) + this.timeFormat(mydate.getDate()) + this.timeFormat(mydate.getHours()) + this.timeFormat(mydate.getMinutes()) + this.timeFormat(mydate.getSeconds()) + code + '.jpg';
    }
    console.log(filename);
    if (config.Zheng_save_to == 2){
      wx.uploadFile({
        url: config.Zheng_osshost,
        filePath: that.data.print_img,
        name: 'file',
        formData: {
          key: filename,
          policy: policy,
          OSSAccessKeyId: config.Zheng_OSSAccessKeyId,
          success_action_status: "200",
          signature: signature,
        },
        success: function (res) {
          console.log(res);
          wx.showToast({
            title: "已保存到服务器！",
            icon: 'success',
            duration: 1000
          })
        },
        fail: function ({ errMsg }) {
          console.log('upladImage fail, errMsg is: ', errMsg)
          wx.showToast({
            title: "上传失败",
            duration: 1000
          })
        },
      })
    }else{
      wx.saveImageToPhotosAlbum({
        filePath: that.data.print_img,
        success: function(res){
          console.log(res);
          wx.showModal({
            title: '提示',
            content: '打印照片已保存到本地相册'
          })
        }
      })
    }
  },
  // 生成证件照
  create_photo: function(){
    wx.showLoading({
      title: '加载中……',
    })     
    var that = this;
    var img = this.data.img;
    var ctx = wx.createCanvasContext("photo");
    var color = this.data.color;
    var spec = this.data.spec;
    var photo_width = spec.photo_width * 11.811;
    var photo_height = spec.photo_height * 11.811;
    console.log("data.img:",img);
    ctx.rect(0, 0, photo_width, photo_height);

    // ctx.fillStyle(color);
    ctx.setFillStyle(color);
    ctx.fill();
    console.log("11111 :");
    ctx.drawImage(img, 0, 0, photo_width, photo_height);
    ctx.draw(true, function () {
      wx.canvasToTempFilePath({
        canvasId: 'photo',
        fileType: 'jpg',
        quality: 1,
        success: function (res) {
          that.setData({
            photo_img: res.tempFilePath
          })
          console.log("66666 :", res.tempFilePath);
          that.create_print();
          
        },
        fail: function (res) {
          console.log("88888 :");
          console.log(res)
        }
      })
    });
  },
  // 生成打印图片
  create_print: function(){
    var that = this;
    var photo_img = this.data.photo_img;
    var spec = this.data.spec;
    var color = this.data.color;
    // 设置打印出血
    var border_width = 18; 
    var photo_width = spec.photo_width * 11.811;
    var photo_height = spec.photo_height * 11.811;
    var print_width = spec.print_height * 11.811;
    var print_height = spec.print_width * 11.811;
    switch(spec.print_num){
      case 8:
        var rows = 2;
        var cols = 4;
        break;
      case 4:
        var rows = 2;
        var cols = 2;
        break;
      case 2:
        var rows = 1;
        var cols = 2;
        break;
      default:
        var rows = 1;
        var cols = 1;
        break;
    }

    var x = (print_width - photo_width * cols - border_width * (cols - 1)) / 2;
    var y = (print_height - photo_height * rows - border_width * (rows - 1)) / 2;
    if(x<0 || y<0){
      this.create_print2();
      return;
    }
    var ctx = wx.createCanvasContext("print");

    ctx.rect(0, 0, print_width, print_height);
    ctx.setFillStyle("#ffffff");
    ctx.fill();
    console.log("(x,y)为（"+x+','+y+');');

    for(var i=0; i<rows; i++){
      for(var j=0; j<cols; j++){
        var new_x = x + j*(photo_width+border_width)
        var new_y = y + i * (photo_height + border_width)

        if (color == '#ffffff') {
          ctx.rect(new_x, new_y, photo_width, photo_height);
          ctx.stroke();
        }
        ctx.drawImage(photo_img, new_x, new_y, photo_width, photo_height);
      }
    }

    ctx.draw(true, function () {
      wx.canvasToTempFilePath({
        canvasId: 'print',
        fileType: 'jpg',
        quality: 1,
        success: function (res) {
          wx.hideLoading();
          that.setData({
            print_img: res.tempFilePath
          })
          console.log("create_print;tempFilePath",res.tempFilePath);
        },
        fail: function (res) {
          console.log(res)
        }
      })
    });
  },
  // 生成打印图片
  create_print2: function () {
    var that = this;
    var photo_img = this.data.photo_img;
    var spec = this.data.spec;
    var color = this.data.color;
    // 设置打印出血
    var border_width = 18;
    var photo_width = spec.photo_width * 11.811;
    var photo_height = spec.photo_height * 11.811;
    var print_width = spec.print_width * 11.811;
    var print_height = spec.print_height * 11.811;
    switch (spec.print_num) {
      case 8:
        var rows = 2;
        var cols = 4;
        break;
      case 4:
        var rows = 2;
        var cols = 2;
        break;
      case 2:
        var rows = 1;
        var cols = 2;
        break;
      default:
        var rows = 1;
        var cols = 1;
        break;
    }

    var x = (print_width - photo_width * cols - border_width * (cols - 1)) / 2;
    var y = (print_height - photo_height * rows - border_width * (rows - 1)) / 2;
    var ctx = wx.createCanvasContext("print2");

    ctx.rect(0, 0, print_width, print_height);
    ctx.setFillStyle("#ffffff");
    ctx.fill();
    console.log("(x,y)为（" + x + ',' + y + ');');

    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        var new_x = x + j * (photo_width + border_width)
        var new_y = y + i * (photo_height + border_width)

        if(color == '#ffffff'){
          ctx.rect(new_x, new_y, photo_width, photo_height);
          ctx.stroke();
        }
        ctx.drawImage(photo_img, new_x, new_y, photo_width, photo_height);
      }
    }

    ctx.draw(true, function () {
      wx.canvasToTempFilePath({
        canvasId: 'print2',
        fileType: 'jpg',
        quality: 1,
        success: function (res) {
          wx.hideLoading();
          //在这里添加保存临时文件 

          that.setData({
            print_img: res.tempFilePath
          })
          console.log(res.tempFilePath);
        },
        fail: function (res) {
          console.log(res)
        }
      })
    });
  },
  gobuy: function(){
    var t=this
    console.log("data.img01:", this.data.img);
    var speclist = app.speclist;
    var spec={};
    var zjzimgurllist=[];



    /*
     speclist.forEach(function(v,indexx){
       spec=v;
       t.data.spec = spec;
       spec.bg_color.forEach(function (value, key) {
        t.data.spec.bg_color=value; 
         console.log("gobuy color list:", t.data.spec.bg_color);
         t.create_photo(); 
       })

     })*/
  
     

       
    


   





    app.setCache("zjzimgupload", this.data.img);

    var glist=[
      { "gid":213,"optionid":[760,761,762]},
      { "gid":214, "optionid": [763, 764, 765] },
      { "gid":215, "optionid": [766, 767, 768] },
      { "gid":217, "optionid": [772, 773, 774] },
      { "gid":218, "optionid": [775, 776, 777] },
      { "gid":219, "optionid": [778, 779, 780] }

    ];
    var isok=1;
    for (var i = 0; i < glist.length; i++) {
       var fgid=   glist[i].gid;
      for (var ii = 0; ii < glist[i].optionid.length; ii++) {
        var foptionid = glist[i].optionid[ii];
        a.post("member/cart/add", {
          id: fgid,
          total: 1,
          optionid: foptionid
        }, function (t) {
          if (0 == t.error) {            

          } else  {
            isok=0;
          }
        });
       }
       

    }   
    
    if (isok==1) {
      console.log("go to cart");
      wx.navigateTo({
        url: '/pages/member/cart/index',
      })
      wx.switchTab({
        url: '/pages/member/cart/index'
      })

    }else{
      wx.showToast({
        title:"购买出现错误"

      })

    }




  },
  goBack: function(){
    wx.navigateBack({
      delta: 1,
    })
  }
})