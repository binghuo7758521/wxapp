var t = getApp(),
  e = t.requirejs("core"),
  o = t.requirejs("foxui");
var uploadImage = require('utils/uploadFile.js');
var util = require('utils/util.js');
const env = require('utils/config.js'); //配置文件，在这文件里配置你的OSS keyId和KeySecret,timeout:87600;

const base64 = require('utils/base64.js'); //Base64,hmac,sha1,crypto相关算法

const Crypto = require('utils/crypto.js');


const aliyunFileKey = new Date().getTime() + Math.floor(Math.random() * 150) + '.jpg';

const aliyunServerURL = env.uploadImageUrl; //OSS地址，需要https
const accessid = env.OSSAccessKeyId;

const getPolicyBase64 = function() {
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
const getSignature = function(policyBase64) {
  const accesskey = env.AccessKeySecret;

  const bytes = Crypto.HMAC(Crypto.SHA1, policyBase64, accesskey, {
    asBytes: true
  });
  const signature = Crypto.util.bytesToBase64(bytes);

  return signature;
}
const signature = getSignature(policyBase64); //获取签名

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
    isupload: "",
    overpercent: 0, //上传进度
    goodsnum: 1, //购买的商品数量；如果大于1 来自购物车；上传证件照；    
    goodslist: {},
    imagelen: ""
  },
  onLoad: function(i) {
    var r = this;
    console.log("onload i：", i);
    var gslist = t.getCache("goodsInfo");
    console.log("gslist：", gslist);
    r.setData({
      options: i,
      goodslist: gslist
    }), t.url(i);

    var goodid = wx.getStorageSync('goodsid');

    e.get("order/isupload", {
      goodsid: goodid
    }, function(a) {
      r.setData({
        isupload: a.isupload.isupload,
        datas: a.datas //服务器当前日期
      });
      console.log("服务器当前日期datas：", a.datas);
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
        success(res) {},
        fail(res) {
          wx.showModal({
            title: '提示',
            content: '该订单已支付，返回首页',
            showCancel: false,
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
    var o = e.pdata(t).type,
      a = this,
      i = this.data.list.wechat;
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
      if (0 != t.error) o.toast(a, t.message);
      else {
        var e = Array.isArray(t.ordervirtual);

        a.setData({
          success: !0,
          successData: t,
          order: t.order,
          ordervirtual: t.ordervirtual,
          overpercent: 1,
          ordervirtualtype: e
        });
        wx.setStorageSync("uploadingnum", 0)

        a.imgupload();

      }
    }, !0, !0);



  },
  imgupload: function() {
    var a = this;
    var imgList = a.data.imglist;
    console.log(a);

    var imagenum = a.data.imagenum;
    var imglength = wx.getStorageSync("imglengths");
    ///var optionname = wx.getStorageSync("optionname");
    var name = wx.getStorageSync("name");
    //var datas = wx.getStorageSync("datas");
    //var ordernums = wx.getStorageSync("ordernums");
    // var titles = wx.getStorageSync("titles");
    var ordernums = a.data.list.order.ordersn;
    var titles = a.data.goodslist.goodslist[0].title;
    var optionname = a.data.goodslist.goodslist[0].optiontitle;
    var datas = a.data.datas;

    


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

    //来自购物车；需要上传抠图结果
    console.log(a.data.goodslist.goodslist.length);
    //220 为证件照链接id
    if (a.data.goodslist.goodslist[0].id == 220) {



      var imgzjzurl = t.getCache("zjzimgupload");
      var imgzjzurllist = t.getCache("zjzimgurllist");
      var zjztitle = t.getCache("zjzsel_title");
      var gslist = t.getCache("goodsInfo");
      imgnum = imgzjzurllist.length;
      console.log("goodsinfo cache", gslist);
      console.log("goodsinfo cache", gslist.goodslist);

      wx.showLoading({
        mask: true,
        title: ' 努力上传中...',
      });
      //上传列表；zjzimgurllist；需要处理异步，原来的图片上传用的是递归；
      
      uploadImage(a, imgzjzurllist[imagenum].url, 'order/' + datas+ a.data.list.order.ordersn +'证件照'+ zjztitle + '/' + '打印' + imgzjzurllist[imagenum].num + '张的证件照' + '/', imgzjzurllist.length,
          function(rr) {
            console.log("上传图片地址为：", rr);
             
            if (imagenum == (imgzjzurllist.length-1)){
              console.log("全部上传ok");
            //  wx.hideLoading();
            } else {
              imagenum++;
              a.setData({
                imagenum: imagenum
              })
              a.imgupload();
              

            }

          }
        )

      




    }

    if (canupload == 1) {
      if (imagenum < imgList.length) {
        //文件路径不包含微信名，容易有乱码；
        //uploadImage(imgsrc, 'order/' + datas + ordernums + optionname + titles + name + '/' + '打印 ' + imgnum + ' 张的图片' + '/',
        wx.showLoading({
          mask: true,
          title: ' 努力上传中...',
        });
        uploadImage(a, imgsrc, 'order/' + datas + ordernums + optionname + titles + '/' + '打印 ' + imgnum + ' 张的图片' + '/',
          imgList.length,
          function(result) {
            console.log("======上传成功图片地址为：", result);
            if (true) {
              if (imagenum == imgList.length) {
                console.log("全部上传");
              } else {
                imagenum++;
                a.setData({
                  imagenum: imagenum,

                })



                if (imagenum == imgList.length) {


                  /* wx.showToast({
                  title: '上传成功1',
                     icon: 'success',
                     duration: 3000
                   })*/


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


          },
          function(result) {
            console.log("======上传失败======", result);
            wx.showModal({
              title: '上传失败',
              content: '您已付款，可以联系客服重新购买',
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