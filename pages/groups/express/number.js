var e = getApp(), s = e.requirejs("core");

e.requirejs("foxui"), e.requirejs("jquery");

Page({
    data: {
        express: "",
        expresscom: "",
        expresssn: "",
        orderid: ""
    },
    onLoad: function(e) {
        var o = this;
        s.post("groups.refund", {
            orderid: e.orderid
        }, function(r) {
            0 == r.error ? (r.show = !0, o.setData(r), o.setData({
                options: e
            }), console.log(r)) : s.toast(r.message, "loading");
        });
    },
    inputPrickChange: function(e) {
        var s = this, o = s.data.express_list, r = e.detail.value, t = o[r].name, a = o[r].express;
        s.setData({
            expresscom: t,
            express: a,
            index: r
        });
    },
    inputChange: function(e) {
        var s = e.detail.value;
        this.setData({
            expresssn: s
        });
    },
    back: function() {
        wx.navigateBack();
    },
    submit: function(e) {
        console.log(1);
        var o = this, r = o.data.expresssn, t = o.data.options.refundid, a = o.data.options.orderid;
        if (console.log(t), console.log(r), console.log(a), "" != r) {
            var n = {
                express: o.data.express,
                expresscom: o.data.expresscom,
                expresssn: r,
                orderid: a
            };
            s.post("groups.refund.express", n, function(e) {
                0 == e.error ? wx.navigateBack() : wx.showToast({
                    title: e.error,
                    icon: "none",
                    duration: 2e3
                });
            }, !0);
        } else wx.showToast({
            title: "请填写快递单号",
            icon: "none",
            duration: 2e3
        });
    }
});