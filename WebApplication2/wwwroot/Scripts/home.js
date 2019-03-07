function addTab(options) {
    options = $.extend({ container: "#h-main-content" }, options);
    $("#h-main-tabs").mitabs("add", options);
}
function removeTab(options) {
    $("#h-main-tabs").mitabs("remove", options);
}
function setTab(options) {
    $("#h-main-tabs").mitabs("set", options);
}
function getTab(options, type) {
    var ret = $("#h-main-tabs").mitabs("getFrame", options, type);
    return ret;
}
$(function () {
    $(document).on("click", "a[target='tab']", function (e) {
        e.preventDefault();
        var obj = this, a = $(this);
        addTab({
            caption: a.attr("caption") || a.justtext(),
            anchor: obj,
            id: a.attr("tabid")
        });
    });
    $('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
        $($(this).attr("href")).find("table.ui-jqgrid-btable").each(function (i, n) {
            n.resizeGrid();
        });
    });
    addTab({
        caption: "工作中心",
        url: $.mitools.path + "/User/WorkCenter.aspx",
        close: false
    });
    $(window).on('beforeunload', function () {
        return '您确定要离开工作中心页面吗？';
    });
    $.mitools.ui.validate({
        ignore: ":hidden:not(.chosen-select, .chosen-select-fix, .pier-input), .js-form *"
    });
});
