var e = getApp(), r = e.requirejs("core"), o = e.requirejs("biz/group_order");

Page({
    data: function(e, r, o) {
        return r in e ? Object.defineProperty(e, r, {
            value: o,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[r] = o, e;
    }({
        code: !1,
        consume: !1,
        store: !1,
        cancel: o.cancelArray,
        cancelindex: 0,
        diyshow: {},
        city_express_state: 0,
        order_id: 0,
        order: [],
        address: []
    }, "cancel", o.cancelArray),
    onLoad: function(e) {
        this.setData({
            order_id: e.order_id
        });
    },
    onShow: function() {
        this.get_list();
        var r = this;
        e.getCache("isIpx") ? r.setData({
            isIpx: !0,
            iphonexnavbar: "fui-iphonex-navbar",
            paddingb: "padding-b"
        }) : r.setData({
            isIpx: !1,
            iphonexnavbar: "",
            paddingb: ""
        });
    },
    get_list: function() {
        var e = this;
        r.get("groups/order/details", {
            orderid: e.data.order_id
        }, function(o) {
            o.error > 0 && (5e4 != o.error && r.toast(o.message, "loading"), wx.redirectTo({
                url: "/pages/groups/order/index"
            })), e.setData({
                show: !0,
                express: o.express,
                order: o.order,
                address: o.address,
                store: o.store,
                verify: o.verify,
                verifynum: o.verifynum,
                verifytotal: o.verifytotal,
                carrier: o.carrier,
                shop_name: o.sysset.shopname,
                goods: o.goods,
                goodRefund: o.goodRefund
            });
        });
    },
    more: function() {
        this.setData({
            all: !0
        });
    },
    code: function(e) {
        var o = this;
        console.log(o.data.verify), r.post("groups/verify/qrcode", {
            id: o.data.order.id,
            verifycode: o.data.order.verifycode
        }, function(e) {
            0 == e.error ? o.setData({
                code: !0,
                qrcode: e.url
            }) : r.alert(e.message);
        }, !0);
    },
    diyshow: function(e) {
        var o = this.data.diyshow, t = r.data(e).id;
        o[t] = !o[t], this.setData({
            diyshow: o
        });
    },
    close: function() {
        this.setData({
            code: !1
        });
    },
    toggle: function(e) {
        var o = r.pdata(e), t = o.id, a = o.type, i = {};
        i[a] = 0 == t || void 0 === t ? 1 : 0, this.setData(i);
    },
    phone: function(e) {
        r.phone(e);
    },
    finish: function(e) {
        var o = this, t = e.target.dataset.orderid;
        r.confirm("是否确认收货", function() {
            r.get("groups/order/finish", {
                id: t
            }, function(e) {
                0 == e.error ? o.get_list(!0) : r.alert(e.message);
            });
        });
    },
    delete_: function(e) {
        var o = e.target.dataset.orderid;
        r.confirm("是否确认删除", function() {
            r.get("groups/order/delete", {
                id: o
            }, function(e) {
                0 == e.error ? wx.reLaunch({
                    url: "/pages/groups/order/index"
                }) : r.alert(e.message);
            });
        });
    },
    cancel: function(e) {
        var r = this.data.order_id;
        o.cancel(r, e.detail.value, "/pages/groups/order_detail/index?order_id=" + r);
    },
    refundcancel: function(e) {
        r.post("groups.refund.cancel", {
            orderid: this.data.order_id
        }, function(e) {
            0 == e.error ? wx.navigateBack() : wx.showToast({
                title: e.error,
                icon: "none",
                duration: 2e3
            });
        });
    },
    onShareAppMessage: function() {
        return r.onShareAppMessage();
    }
});