var app = getApp();

Page({
  data: {
    isShoot: !1,
    isProcessed: !1,
    devicePosition: "back"
  },
  takePhoto: function () {
    var e = this;
    wx.createCameraContext().takePhoto({
      success: function (t) {
        var o = t.tempImagePath;
        e.setData({
          src: o,
          isShoot: !0
        }), e.checkFileSize(o, function (t) {
          !0 === t ? e.processPhoto() : wx.getImageInfo({
            src: o,
            success: function (t) {
              var s = t.width, c = t.height, a = wx.createCanvasContext("photo", e);
              console.log(a), a.drawImage(o, 0, 0, s / 10, c / 10), a.draw(), setTimeout(function () {
                wx.canvasToTempFilePath({
                  canvasId: "photo",
                  success: function (t) {
                    var o = t.tempFilePath;
                    wx.getFileInfo({
                      filePath: o,
                      success: function (e) {
                        console.log("file size", e.size);
                      },
                      fail: function (e) {
                        console.log(e);
                      }
                    }), e.setData({
                      src: o
                    }), e.processPhoto();
                  },
                  fail: function (e) {
                    console.log(e);
                  }
                }, e);
              }, 200);
            },
            fail: function (e) {
              console.log(e);
            }
          });
        });
      }
    });
  },
  chooseAlbumPhoto: function () {
    var e = this;
    wx.chooseImage({
      count: 1,
      sourceType: ["album"],
      sizeType: ["compressed"],
      success: function (t) {
        var o = t.tempFilePaths[0];
        e.setData({
          src: o,
          isShoot: !0
        }), e.processPhoto();
      }
    });
  },
  reverseCamera: function () {
    this.setData({
      devicePosition: "back" === this.data.devicePosition ? "front" : "back"
    });
  },
  processPhoto: function () {
    var that = this;
    var width = this.data.spec.photo_width * 11.811;
    var height = this.data.spec.photo_height * 11.811;
    // 设置面部占整个照片比例
    if(width == height){
      var scale = 0.38;
    }else{
      var scale = 0.5;
    }
    var config = this.data.config;
    if (config.Zheng_api_from == 1){
      var apikey = config.Zheng_FaceFreeApiKey;
      var apiSecret = config.Zheng_FaceFreeApiSecret;
    }else{
      var apikey = config.Zheng_FaceApiKey;
      var apiSecret = config.Zheng_FaceApiSecret;
    }
    wx.showLoading({
      title: "制作中"
    });
    var img = this.data.src;
    wx.uploadFile({
      url: "https://api-cn.faceplusplus.com/facepp/v3/detect",
      filePath: img,
      name: "image_file",
      formData: {
        api_key: apikey,
        api_secret: apiSecret,
        return_landmark: 1
      },
      success: function (o) {
        var res = JSON.parse(o.data);
        console.log(res);
        if (res.faces.length !== 1) {
          that.hide();
          wx.showModal({
            title: '提示',
            content: "请上传单人证件照！",
          });
          return;
        }
        var face = res.faces[0].landmark;
        var dpi = (face.contour_right1.x - face.contour_left1.x) / (width * scale);
        if (dpi < 0.5) {
          that.hide();
          wx.showModal({
            title: '提示',
            content: "你的图片清晰度太低，为保证图片质量，请上传更清晰的照片！",
          });
          return;
        }
        console.log("dip=" + dpi);

        const ctx = wx.createCanvasContext("cut");

        if ((face.nose_tip.x - (width * 0.5 * dpi)) < 0 || (face.nose_tip.x + (width * 0.5 * dpi)) > (width * dpi)) {
          ctx.drawImage(img, 0, 0, width, height);
        }else{
          ctx.drawImage(img, face.nose_tip.x - (width * 0.5 * dpi), face.nose_tip.y - (height * 0.5 * dpi), width * dpi, height * dpi, 0, 0, width, height);
        }
        // ctx.draw();

        // ctx.rect(0, 0, width, height);
        // ctx.setFillStyle('red');
        // ctx.fill();
        ctx.draw(true, function () {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: width,
            height: height,
            destWidth: width,
            destHeight: height,
            canvasId: 'cut',
            fileType: 'jpg',
            quality: 1,
            success: function (res) {
              console.log(res.tempFilePath);
              that.koutu(res.tempFilePath);
            },
            fail: function (res) {
              console.log(res)
            }
          })
        });
      },
      complete: function () {
        
      }
    });
  },
  //抠图方法
  koutu: function (img) {
    var that = this;
    var config = this.data.config;
    if (config.Zheng_api_from == 1) {
      var apikey = config.Zheng_FaceFreeApiKey;
      var apiSecret = config.Zheng_FaceFreeApiSecret;
    } else {
      var apikey = config.Zheng_FaceApiKey;
      var apiSecret = config.Zheng_FaceApiSecret;
    }
    wx.uploadFile({
      url: "https://api-cn.faceplusplus.com/humanbodypp/v2/segment",
      filePath: img,
      name: "image_file",
      formData: {
        api_key: apikey,
        api_secret: apiSecret,
        return_grayscale: 0
      },
      success: function (o) {
        wx.hideLoading();
        var res = JSON.parse(o.data);
        console.log(res);
        that.setData({
          img: res.body_image
        })
        that.base64src(res.body_image);
        console.log(new Date());
      }
    });
  },
  // base64生成图片
  base64src: function (body_image) {
    var that = this;
    const fsm = wx.getFileSystemManager();
    const FILE_BASE_NAME = 'tmp_base64src';
    const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.png`;
    const buffer = wx.base64ToArrayBuffer(body_image);
    fsm.writeFile({
      filePath,
      data: buffer,
      encoding: 'binary',
      success(res) {
        that.hide();
        wx.navigateTo({
          url: 'preview?img=' + filePath + '&specId=' + that.data.specId
        })
        // that.create_photo(filePath);
        console.log(filePath);
        console.log(res);
      },
      fail(res) {
        
        console.log(res);
      },
    });
  },
  hide: function(){
    this.setData({
      isShoot: !1
    })
    wx.hideLoading();
  },
  onLoad: function (e) {


 



    var t = e.specId;
    //var config = wx.getStorageSync("zjz_config");
    var config={};
    config.Zheng_api_from=1;
    config.Zheng_FaceFreeApiKey ="ywXnovZM0ezjIJoUh_pgoPNQzVN7lIxk";
    config.Zheng_FaceFreeApiSecret = "CPuOiocN8YbKKScseQQjIZ8oELUURmSQ";
    config.Zheng_FaceApiKey = "hTOlAYF8IxegfPFQl-UWgR-j7LpGDDmN";
    config.Zheng_FaceApiSecret = "0vynnhSuIdWcIcIDF4cePfU96xtZesJI";





    var speclist = app.speclist;
    var spec = {};
    speclist.forEach(function(value, idx){
      if (value.spec_id == t){
        spec = value;
      }
    })
    this.setData({
      specId: t,
      config: config,
      spec: spec
    });
  },
  checkFileSize: function (e, t) {
    wx.getFileInfo({
      filePath: e,
      success: function (e) {
        t(e.size < 10485760);
      }
    });
  }
});