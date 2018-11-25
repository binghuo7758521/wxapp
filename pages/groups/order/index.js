var t = getApp(), e = t.requirejs("core"), a = (t.requirejs("jquery"), t.requirejs("biz/diyform"), 
t.requirejs("biz/goodspicker"), t.requirejs("foxui"), t.requirejs("biz/group_order"));

Page({
    data: {
        type_: "",
        page: 1,
        list: [],
        cancel: a.cancelArray
    },
    onLoad: function(e) {
        var a = this;
        t.getCache("isIpx") ? a.setData({
            isIpx: !0,
            iphonexnavbar: "fui-iphonex-navbar"
        }) : a.setData({
            isIpx: !1,
            iphonexnavbar: ""
        }), this.setData({
            options: e
        }), this.get_list();
    },
    get_list: function(t) {
        var a = this;
        if (t) {
            if (t.target) {
                if (a.data.type_ == t.target.dataset.type_) return;
                a.setData({
                    type_: t.target.dataset.type_
                });
            }
            a.setData({
                page: 1,
                list: []
            });
        }
        e.get("groups/order", {
            status: a.data.type_,
            page: a.data.page
        }, function(t) {
            console.log(t), 0 == t.error && (a.setData({
                list: a.data.list.concat(t.list)
            }), wx.stopPullDownRefresh());
        });
    },
    finish: function(t) {
        var a = this, r = t.target.dataset.orderid;
        e.confirm("是否确认收货", function() {
            e.get("groups/order/finish", {
                id: r
            }, function(t) {
                0 == t.error ? a.get_list(!0) : e.alert(t.result.message);
            });
        });
    },
    delete_: function(t) {
        var a = this, r = t.target.dataset.orderid;
        e.confirm("是否确认删除", function() {
            e.get("groups/order/delete", {
                id: r
            }, function(t) {
                0 == t.error ? a.get_list(!0) : e.alert(t.result.message);
            });
        });
    },
    cancel: function(t) {
        var e = t.target.dataset.orderid;
        a.cancel(e, t.detail.value, "/pages/groups/order_detail/index?order_id=" + e);
    },
    close: function() {
        this.setData({
            code: !1
        });
    },
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {
        this.setData({
            page: 1,
            list: []
        }), this.get_list();
    },
    onReachBottom: function() {
        this.setData({
            page: this.data.page + 1
        }), this.get_list();
    },
    onShareAppMessage: function() {},
    code: function(t) {
        var a = this, r = e.data(t).orderid, i = e.data(t).verifycode;
        e.post("groups/verify/qrcode", {
            id: r,
            verifycode: i
        }, function(t) {
            0 == t.error ? a.setData({
                code: !0,
                qrcode: t.url
            }) : e.alert(t.message);
        }, !0);
    }
});