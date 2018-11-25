var app = getApp(), s = app.requirejs("core");
//var zhifu = require('../../order/create/index.js');
var uploadImage = require('../../utils/uploadFile.js');
var util = require('../../utils/util.js');
const env = require('../../utils/config.js'); //配置文件，在这文件里配置你的OSS keyId和KeySecret,timeout:87600;

const base64 = require('../../utils/base64.js');//Base64,hmac,sha1,crypto相关算法

const Crypto = require('../../utils/crypto.js');


const aliyunFileKey =  new Date().getTime() + Math.floor(Math.random() * 150) + '.jpg';

const aliyunServerURL = env.uploadImageUrl;//OSS地址，需要https
const accessid = env.OSSAccessKeyId;
 
const getPolicyBase64 = function () {
  let date = new Date();
  date.setHours(date.getHours() + env.timeout);
  let srcT = date.toISOString();
  const policyText = {
    "expiration": srcT, //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了 
    "conditions": [
      ["content-length-range", 0, 5 * 1024 * 1024] // 设置上传文件的大小限制,5mb
    ]
  };

  const policyBase64 = base64.encode(JSON.stringify(policyText));
  return policyBase64;
}
const policyBase64 = getPolicyBase64();
const getSignature = function (policyBase64) {
  const accesskey = env.AccessKeySecret;

  const bytes = Crypto.HMAC(Crypto.SHA1, policyBase64, accesskey, {
    asBytes: true
  });
  const signature = Crypto.util.bytesToBase64(bytes);

  return signature;
}
const signature = getSignature(policyBase64);//获取签名

Page({
  data: {
    waitUploadNum: 0,

    imgList: [
      // {
      //   src: '',
      //   clipImg: '',
      //   num: 1,
      // }
    ],
    total: "",
    allnum: "",
    imgnum: "",
    imagenum: 0,
    username: "",
    orderdata: "",
    ordernum: "",
    goodstitle: "",
    imgs:"",
    isShow:"true"
  },
  
  onLoad: function (opt) {
    let t = this;
    console.log(t)
    let pages = wx.getStorageSync('imgUrl');
    t.setData({
      imgList: pages
    });
    
    s.get("order/ordertotal", "", function (e) {
      console.log(e)
      console.log(e.order_goods.total)
      
      t.setData({
        total: e.order_goods.total
      });
    });

    
    s.get("order/orderdata", "", function (e) {
      console.log(e)
      t.setData({
        username: e.nickname.nickname,
        orderdata: e.data,
        ordernum: e.ordersn,
        goodstitle: e.title.title,
        orderid:e.orderid
      });
      

    });
  },
  onShow: function () {
    let mm = this;
    console.log(mm)
    console.log(6666666666666666666)
    let cropperImg = app.globalData.cropperImg;
 
    if ( cropperImg ) {
      // 如果有说明是裁剪好的
    } else {
      // 没有裁剪过图片
    }
  },

  // 三 进入所点图片
  goCropperImg: function (e) {
    let { idx, num } = e.currentTarget.dataset;
    let goCropperImg = this.data.imgList[idx];
  
    wx.navigateTo({
      url: '../index/index?idx=' + idx + '&src=' + goCropperImg.src + '&num=' + num
    });
  },

 
  deleteImg: function (e) {
    //var imgs = this.data.imgs; 
   
    var imgs = this.data.imgList;
    console.log(this)
    console.log(imgs)
    //console.log(10101010101)
    var index = e.currentTarget.dataset.index; 
    imgs.splice(index, 1); 
    this.setData({ 
      imgList: imgs,
      
    });
  },


  // 一 弹出选择图片
  onChooseImg: function () {
    let that = this;
  
    wx.chooseImage({
      count: 9,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success (res) {
        console.log(res)
        console.log(9191919191)
        let tempFiles = res.tempFiles;
        //var tempFilePaths = res.tempFilePaths;
        that.setData({
          waitUploadNum: tempFiles.length
        });

        for (let index in tempFiles) {
          // that.upload_file(config.upLoadFile, tempFiles[index].path);
          that.upload_file('', tempFiles[index].path);
        }
    
      }
    })
    //let imgarr = that.data.imgList;
   
    let allnum = that.data.total;

  },
      
   
  // 上传
  choose: function (url, filePath) {
    var that = this
    var imgList = that.data.imgList;
    var imagenum = that.data.imagenum;
    var imglength = parseInt(that.data.imgList.length) + 1;
    var total = that.data.total;
    // console.log(that);
    console.log(imgList);
    console.log(imgList.length);
    console.log(imagenum);
    // console.log(imglength);

    that.setData({
      imgList: imgList
    })

    var allnum = 0;
    for (var a = 0; a < imgList.length; a++) {
      allnum = allnum + imgList[a].num;
    }


    that.setData({
      allimgnum: allnum
    })

    var nowTime = util.formatTime(new Date());
    var name = that.data.username;
    var datas = that.data.orderdata;
    var ordernums = that.data.ordernum;
    var titles = that.data.goodstitle;
    var orderid = that.data.orderid;

    if (allnum <= total) {
      wx.setStorageSync("imgList", imgList);
      wx.setStorageSync("imagenum", imagenum);
      wx.setStorageSync("imglength", imglength);
      wx.setStorageSync("name", name);
      wx.setStorageSync("datas", datas);
      wx.setStorageSync("ordernums", ordernums);
      wx.setStorageSync("titles", titles);

      wx.navigateTo({
        url: "/pages/order/pay/index?id=" + orderid
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您上传的照片数超过购买的图片张数，去删几张吧',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  // choose: function (url, filePath) {
  //   var that = this
  //   var imgList = that.data.imgList;
  //   var imagenum = that.data.imagenum;
  //   var imglength = parseInt(that.data.imgList.length) + 1;
  //   var total = that.data.total;
  //   // console.log(that);
  //   console.log(imgList);
  //   console.log(imgList.length);
  //   console.log(imagenum);
  //   // console.log(imglength);
    
  //   that.setData({
  //     imgList: imgList
  //   })

  //   var allnum = 0;  
  //   for (var a = 0; a < imgList.length; a++) {
  //     allnum = allnum + imgList[a].num;
  //   }


  //   that.setData({
  //     allimgnum: allnum
  //   })
    
  //   var nowTime = util.formatTime(new Date());
  //   var name = that.data.username;
  //   var datas = that.data.orderdata;
  //   var ordernums = that.data.ordernum;
  //   var titles = that.data.goodstitle;
  //   var orderid = that.data.orderid;

  //   if ( imagenum == imgList.length ){
  //     console.log("全部上传");
  //     wx.showModal({
  //       title: '提示',
  //       content: '上传成功',
  //       showCancel: true,
  //       cancelText: '再传几张',
  //       confirmText: '去付款',

  //       success: function (res) {
  //         if (res.confirm) {
  //           console.log('用户点击确定')
  //           wx.navigateTo({
  //             url: "/pages/order/pay/index?id=" + orderid
  //           })
            
  //         } else if (res.cancel) {
  //           console.log('用户点击取消')
  //         }

  //       }
  //     })
  //   }else{
  //     if (imgList[imagenum].clipImg == undefined) {
  //       console.log("biubiubiu")
  //       var imgsrc = imgList[imagenum].src;
  //     } else {
  //       console.log("sarsarsar")
  //       var imgsrc = imgList[imagenum].clipImg;
  //     }
  //     var imgnum = imgList[imagenum].num;

  //     if (allnum <= total) {
  //       // for (var n = 0; n < imgnum; n++) {
  //       uploadImage(imgsrc, 'abb/' + datas + titles + ordernums + name + '/' + '打印 ' + imgnum + ' 张的图片' + '/',
  //         function (result) {
  //           console.log("======上传成功图片地址为：", result);
  //           console.log(212121212121);
  //           if (true) {
  //             // console.log(imagenum);
  //             // console.log(imgList.length);
  //             // console.log(789789789);
  //             if (imagenum == imgList.length) {
  //               console.log("全部上传");

  //             } else {
  //               imagenum++;
  //               that.setData({
  //                 imagenum: imagenum
  //               })
  //               console.log(imagenum);
  //               console.log(imglength);
  //               if (imglength == imagenum) {
  //                 console.log('停止上传')
  //               } else {
  //                 that.choose();
  //               }
  //             }
  //           } else {
  //             //打印错误信息
  //             console.log("图片上传错误")
  //           }

  //           setTimeout(function () {
  //             wx.hideToast()
  //           }, 2000)
  //           wx.hideLoading();
  //         }, function (result) {
  //           console.log("======上传失败======", result);
  //           wx.hideLoading()
  //         }
  //       )
  //       // }
  //     } else {
  //       wx.showModal({
  //         title: '提示',
  //         content: '您上传的照片数超过购买的图片张数，去删几张吧',
  //         success(res) {
  //           if (res.confirm) {
  //             console.log('用户点击确定')
  //           } else if (res.cancel) {
  //             console.log('用户点击取消')
  //           }
  //         }
  //       })
  //     }
  //   }

    
  // },

  // 二  将所选图片遍历出来
  upload_file: function (url, filePath,res) {
    let that = this;
    let { imgList, waitUploadNum } = this.data;
  
    var imglength=0;
    setTimeout(() => {
      // 模拟网络请求
      imgList.push({ src: filePath, num: 1 });
     
      wx.setStorageSync(imglength, imgList.length);
         
      this.setData({imgList:imgList });
     
      this.setData({ waitUploadNum: --that.data.waitUploadNum });
    }, 500)
  },
  
})
