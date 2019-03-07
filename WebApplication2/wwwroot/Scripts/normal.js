var MyPhone = null;
var webchat = null;

$(function () {
    MyPhone = $(".miphone").miphoneUI({
       // var phone = (typeof MiPhoneCore != "undefined") ? MiPhoneCore : null || Object.create($.miphone);
    //phone.init({ "url": "http://localhost/Cti/cta.svc/" });
        // Aspect CTI服务器
        //serverPath: "http://180.149.152.10/Cti/cta.svc/",
        //serverPath: "http://118.178.231.52/Cti/cti.svc/",
        //serverPath: "http://121.199.14.232:8276/cti.svc/",
        acdGroup: _gdata?_gdata.Empid:'5000',
        agentId:_gdata?_gdata.AgentId:''
    });
    if (_gdata && _gdata.Image)
        $('.leftnavigator .headimg').attr("src", _gdata.Image);
    var anti_fake_working = null;
    $(".leftnavigator").on("click", "[action]", function (e) {
        switch ($(this).attr("action")) {
            case "search_anti_fake":
                $("#anti-fake-code").rules("add", {
                    required: true,
                    digits: true,
                    maxlength: 16,
                    minlength: 15
                });
                if ($.mitools.ui.valid(".js-anti-fake")) {
                    if (!anti_fake_working) {
                        anti_fake_working = $('<div class="progress">' +
                            '<div class="progress-bar progress-bar-striped active" role="progressbar"' +
                            'aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">' +
                            '<span class="sr-only">45% Complete</span>' +
                            '</div>' +
                        '</div>').appendTo(".js-anti-fake");
                    }
                    anti_fake_working.show();
                    $(".js-anti-fake .alert").remove();
                    $.wcf.invoke({
                        async: true,
                        url: ($.mitools.path + '/OA/codevalid'),
                        data: { inputcode: $("#anti-fake-code").val(), t: new Date().valueOf() },
                        type: "GET",
                        success: function (result) {
                            if (result) {
                                showValidResult(result.ret + result.remark + result.remark1);
                            }
                            
                            else
                                showValidResult('查询发生故障，没有查询到数据！');
                        },
                        error: function (x, e, m) {
                            showValidResult(x.statusText + ' ' + m);
                        }
                    });
                }

                break;
            case "add_freq_menu":
                var data = {}, pathname =
                window.location.pathname;
                if (pathname.toLowerCase() == "/home.aspx") {
                    var tab = $("#h-main-tabs > li.active a");
                    data = {
                        url: $(tab.attr("href")).find("iframe").attr("src"),
                        name: tab.contents().eq(0).text()
                    }
                }
                else {
                    data = {
                        url: window.location.href,
                        name: document.title
                    };
                }
                $.mitools.data.PostCommand($.mitools.path + '/unis/Data?' + $.param({
                    path: "user",
                    type: "menu",
                    key: "add",
                    t: new Date().valueOf()
                }),
                { old: null, new: data },
                function (r) {
                    if (r != null && r.Code == 0) {
                        $.ministatis.freqmenu();
                    }
                    else {
                        $.mitools.dialog.ShowError(r.Cause);
                    }
                }); break;
            case "delete_freq_menu":
                var rid = $(e.target).attr("rid");
                if (rid) {
                    $.mitools.data.PostCommand($.mitools.path + '/unis/Data?' + $.param({
                        path: "user",
                        type: "menu",
                        key: "delete",
                        t: new Date().valueOf()
                    }),
                    { old: null, new: { "id": rid } },
                    function (r) {
                        if (r != null && r.Code == 0) {
                            $.ministatis.freqmenu();
                        }
                        else {
                            $.mitools.dialog.ShowError(r.Cause);
                        }
                    });
                }
                break;
            case "collapse_toggle":
                var $obj = $(this);
                if ($obj.hasClass("collapsed")) {
                    $(".main").css({
                        "margin-left": ""
                    });
                    $(".leftnavigator .box-home").show();
                    $(".leftnavigator").css({
                        width: "",
                        borderWidth: ""
                    });
                    $obj.removeClass("collapsed");
                    $obj.find("i").removeClass().addClass("icon-arrow-left3");
                }
                else {
                    $(".leftnavigator .box-home").hide();
                    $(".leftnavigator").css({
                        width: "0",
                        borderWidth: "0"
                    });
                    $obj.addClass("collapsed");
                    $(".main").css({
                        "margin-left": "0"
                    });
                    $obj.find("i").removeClass().addClass("icon-arrow-right3");
                }
                break;
        }
        if (e.target.tagName == "BUTTON")
            return false;
    });
    function showValidResult(message) {
        anti_fake_working.hide();
        $("#anti-fake-code").rules("remove");
        $(".js-anti-fake").append('<div class="alert alert-warning alert-dismissible" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">关闭</span></button>' +
            message + '</div>');
    }
    $.ministatis.freqmenu();
    if ($.mitools.hasPermission('menu.todaycontact_list')) {
        $.ministatis.call();
        $.ministatis.lastcall();
    }
    if ($.mitools.hasPermission('menu.todaycase_list')) {
        $.ministatis.workstatis();
    }
    $(".leftnavigator .box-body").niceScroll();
    $(".slide-menu").slidemenu();
    if ($(".slide-chat").length) {
        webchat = $(".slide-chat").webchat();
        $(".slide-chat").on("message", function (msg) {
            //alert(msg);
        });
    }
});
