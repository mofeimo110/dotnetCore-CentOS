var _gdata = {};
var _guserid = "", _gtenantid = "", _validIgnore = null;
$(function () {
    if (parent && parent != window) {
        $(document).on("click", "a[target='tab']", function (e) {
            e.preventDefault();
            var obj = this, a = $(obj);
            if (parent.addTab) {
                parent.addTab({
                    caption: a.attr("caption") || a.justtext(),
                    anchor: obj,
                    id: a.attr("tabid")
                });
            }
        });
    }
});