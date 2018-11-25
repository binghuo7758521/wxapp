Page({
    data: {
        paperplane: !1
    },
    onLoad: function(a) {},
    transmit: function() {
        this.setData({
            paperplane: !0
        });
    },
    hidepaperplane: function() {
        this.setData({
            paperplane: !1
        });
    }
});