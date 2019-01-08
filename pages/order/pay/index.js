var t = getApp(), e = t.requirejs("core"), o = t.requirejs("foxui");
var uploadImage = require('utils/uploadFile.js');
var util = require('utils/util.js');
const env = require('utils/config.js'); //配置文件，在这文件里配置你的OSS keyId和KeySecret,timeout:87600;

const base64 = require('utils/base64.js');//Base64,hmac,sha1,crypto相关算法

const Crypto = require('utils/crypto.js');


const aliyunFileKey = new Date().getTime() + Math.floor(Math.random() * 150) + '.jpg';

const aliyunServerURL = env.uploadImageUrl;//OSS地址，需要https
const accessid = env.OSSAccessKeyId;

const getPolicyBase64 = function () {
  let date = new Date();
  date.setHours(date.getHours() + env.timeout);
  let srcT = date.toISOString();
  const policyText = {
    "expiration": srcT, //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了 
    "conditions": [
      ["content-length-range", 0, 30 * 1024 * 1024] // 设置上传文件的大小限制,30mb
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
        icons: t.requirejs("icons"),
        success: !1,
        successData: {},
        coupon: !1,
        imagenum: 0,
        total: "",
        username: "",
        orderdata: "",
        ordernum: "",
        orderid: "",
        goodstitle: "",
        isupload:"",
        imagelen:""
    },
    onLoad: function(i) {
        var r = this;
        r.setData({
            options: i
        }), t.url(i);

        var goodid = wx.getStorageSync('goodsid');
        e.get("order/isupload", {
          goodsid: goodid
        }, function (a) {
          r.setData({
            isupload: a.isupload.isupload
          });
        });

        var imgList = wx.getStorageSync("imgList");
        r.setData({
          imglist: imgList,
          imagelen: imgList.length

        })
        
    },
    onShow: function() {
        this.get_list();
    },
    get_list: function() {
      console.log('get_list:');
        var t = this;
        e.get("order/pay", t.data.options, function(o) {
            50018 != o.error ? (!o.wechat.success && "0.00" != o.order.price && o.wechat.payinfo && e.alert(o.wechat.payinfo.message + "\n不能使用微信支付!"), 
            
            t.setData({
                list: o,
                show: !0,
           
            })) : wx.navigateTo({                
                url: "/pages/order/details/index?id=" + t.data.options.id,
                success(res){                  
                },
                fail(res){                  
                  wx.showModal({
                    title: '提示',
                    content: '该订单已过期,再去首页看看吧',
                    showCancel:false,
                    success(res) {
                      if (res.confirm) {                        
                        wx.switchTab({
                          url: "/pages/index/index"
                        })

                      } else if (res.cancel) {
                        console.log('用户点击取消')
                      }
                    }
                  })
                }
                
            });
        });
    },
    pay: function(t) {
        var o = e.pdata(t).type, a = this, i = this.data.list.wechat;
        "wechat" == o ? e.pay(i.payinfo, function(t) {
            "requestPayment:ok" == t.errMsg && a.complete(o);
        }) : "credit" == o ? e.confirm("确认要支付吗?", function() {
            a.complete(o);
        }, function() {}) : "cash" == o ? e.confirm("确认要使用货到付款吗?", function() {
            a.complete(o);
        }, function() {}) : a.complete(o);
    },
    complete: function(t) {
        var a = this;
        e.post("order/pay/complete", {
            id: a.data.options.id,
            type: t
        }, function(t) {
            if (0 != t.error) o.toast(a, t.message); else {
                var e = Array.isArray(t.ordervirtual);

                a.setData({
                    success: !0,
                    successData: t,
                    order: t.order,
                    ordervirtual: t.ordervirtual,
                    ordervirtualtype: e
                });
                a.imgupload();

            }
        }, !0, !0);

      
      
    },
    imgupload: function(){
      var a=this;
      var imgList = a.data.imglist;
      console.log(a);

      var imagenum = a.data.imagenum;
      var imglength = wx.getStorageSync("imglengths");
      var optionname = wx.getStorageSync("optionname");
      var name = wx.getStorageSync("name");
      var datas = wx.getStorageSync("datas");
      var ordernums = wx.getStorageSync("ordernums");
      var titles = wx.getStorageSync("titles");

      if (imagenum < imgList.length) {
        if (imgList[imagenum].clipImg == undefined) {
          var imgsrc = imgList[imagenum].src;
        } else {
          var imgsrc = imgList[imagenum].clipImg;
        }
        var imgnum = imgList[imagenum].num;
      }
      wx.setNavigationBarTitle({
        title: "支付成功"
      });

       console.log("支付成功了111");
      var canupload = a.data.isupload;

      if (canupload == 1) {
        if (imagenum < imgList.length) {
          uploadImage(imgsrc, 'order/' + datas + ordernums + optionname + titles + name + '/' + '打印 ' + imgnum + ' 张的图片' + '/',
            function (result) {
              console.log("======上传成功图片地址为：", result);
              if (true) {
                if (imagenum == imgList.length) {
                  console.log("全部上传");
                } else {
                  imagenum++;
                  a.setData({
                    imagenum: imagenum,
            
                  })
                  wx.showLoading({
                    title: '已经上传' + imagenum + '/' + imgList.length,
                  })
                  setTimeout(function () {
                    wx.hideLoading();
                  }, 20000)
                  if (imagenum == imgList.length) {

                    wx.showToast({
                      title: '上传成功',
                      icon: 'success',
                      duration: 3000
                    })

                    wx.removeStorageSync("historyimglist");
                    wx.removeStorageSync("allhistoryimglist");
                  }

                  if (imglength == imagenum) {
                    console.log('停止上传')
                  } else {
                    a.imgupload();

                  }
                }
              } else {
                //打印错误信息
                console.log("图片上传错误")
              }


            }, function (result) {
              console.log("======上传失败======", result);
              wx.showModal({
                title: '上传失败',
                content: '您已付款，可以前往首页联系客服重新购买',
                success(res) {
                  if (res.confirm) {
                    wx.switchTab({
                      url: "/pages/index/index",
                    })

                  }
                }
              })
              wx.hideLoading()
            }
          )
        } 
        
        
      }

    },
    shop: function(t) {
        0 == e.pdata(t).id ? this.setData({
            shop: 1
        }) : this.setData({
            shop: 0
        });
    },
    phone: function(t) {
        e.phone(t);
    },
    closecoupon: function() {
        this.setData({
            coupon: !1
        });
    }
});