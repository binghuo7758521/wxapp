var r = getApp().requirejs("core");

module.exports = {
  url: function(r) {
    wx.redirectTo({
      url: r
    });
  },
  cancelArray: ["我不想买了", "信息填写错误，重新拍", "同城见面交易", "其他原因"],
  order: ["确认要取消该订单吗?", "确认要删除该订单吗?", "确认要彻底删除该订单吗?", "确认要恢复该订单吗?", "确认已收到货了吗?", "确定您要取消申请?"],
  cancel: function(e, o, t, iii) {
    var i = this,
      n = this.cancelArray[o];
    r.post("order/op/cancel", {
      id: e,
      remark: n
    }, function(r) {
      0 == r.error && i.url(t);



      //2019-01-09王庆国增加代码，取消订单后刷新页面；
      if (JSON.stringify(iii) != '{}') {
        iii.setData({
          page: 0,
          list: []
        });
        iii.get_list();
      }




    }, !0);
  },
  delete: function(e, o, t, i) {
    var n = this;
    r.confirm(0 == o ? this.order[3] : this.order[o], function() {
      r.post("order/op/delete", {
        id: e,
        userdeleted: o
      }, function(e) {
        0 != e.error ? r.toast(e.message, "loading") : void 0 !== i ? (i.setData({
          page: 1,
          list: []
        }), i.get_list()) : n.url(t);
      }, !0);
    });
  },
  finish: function(e, o) {
    var t = this;
    r.confirm(this.order[4], function() {
      r.post("order/op/finish", {
        id: e
      }, function(e) {
        0 != e.error ? r.toast(e.message, "loading") : t.url(o);
      }, !0);
    });
  },
  refundcancel: function(e, o) {
    var t = this;
    r.confirm(this.order[5], function() {
      r.post("order/refund/cancel", {
        id: e
      }, function(e) {
        0 != e.error ? r.toast(e.message, "loading") : "function" == typeof o ? o() : t.url(o);
      }, !0);
    });
  },
  codeshow: function(e, o) {
    var t = r.data(o).orderid;
    r.post("verify/qrcode", {
      id: t
    }, function(e) {
      0 == e.error ? $this.setData({
        code: !0,
        qrcode: e.url
      }) : r.alert(e.message);
    }, !0);
  },
  codehidden: function(r) {
    r.setData({
      code: !1
    });
  }
};