var _gdata = {};
var _guserid = "", _gtenantid = "", _validIgnore = null;
var _ani = "", _dnis = "", _caseid = "", _calldata = "", _inout = "", _custid = "";
jQuery(function ($) {
    var $login = $(".head-login");
    if ($login.length) {
        var login = function () {
            $(".login-area").modal('show');
            return false;
        };
        _validIgnore = ":not(.login-area *)";
        $login.click(login);
        login();
    }
    else {
        $.mialerts.load();
        if (_gdata && _gdata.Image)
            $('.fileinput-button .megaheadimg').attr("src", _gdata.Image);
        if ($.mitools) {
            $('#main-head-fileupload').fileupload({
                url: $.mitools.path + "/unis/file?" + $.param({ root: "users", touuid: "true", dir: "images" }),
                dataType: 'json',
                acceptFileTypes: /(\.|\/)(jpg|png|gif|jpeg)$/i,
                done: function (e, data) {
                    if (data.result && data.result.files) {
                        var img = data.result.files[0].url;
                        $('.fileinput-button .megaheadimg').attr("src", img);
                        $.mitools.data.PostCommand(
                            $.mitools.path + '/unis/Data?' + $.param({ type: "user", key: "upimg", path: "user" }) + '&t=' + new Date().valueOf()
                            , { old: null, new: { "img": img } }
                            , function (result) {
                                if (!result || result.Code != 0) {
                                    $.mitools.dialog.ShowError((result || {}).Cause || "保存出错！");
                                }
                            });
                    }
                },
                progressall: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $('.nav .account-head .progress .progress-bar').css(
                        'width',
                        progress + '%'
                    );
                    if (progress == 100) {
                        $(".nav .account-head .progress").hide();
                    }
                },
                add: function (e, data) {
                    var uploadErrors = [];
                    var acceptFileTypes = /(\.|\/)(jpg|png|gif|jpeg)$/i;
                    if (data.originalFiles[0]['name'].length && !acceptFileTypes.test(data.originalFiles[0]['name'])) {
                        uploadErrors.push('文件类型不匹配');
                    }
                    if (data.originalFiles[0]['size'].length && data.originalFiles[0]['size'] > 50000000) {
                        uploadErrors.push('文件大小超过限制');
                    }
                    if (uploadErrors.length > 0) {
                        $.mitools.dialog.ShowError(uploadErrors.join("\n"));
                    } else {
                        $('.nav .account-head .progress').show();
                        $('.nav .account-head .progress .progress-bar').css(
                            'width',
                            '0%'
                        );
                        data.submit();
                    }
                }
            }).prop('disabled', !$.support.fileInput)
                .parent().addClass($.support.fileInput ? undefined : 'disabled');
        }
    }
    if (_gdata.Theme) {
        $(".js-theme-select li a[data-theme='" + _gdata.Theme + "']").parent().addClass("active");
    }
    //更换主题
    $(".js-theme-select a").on("click", function () {
        var theme = $(this).data("theme");
        if (theme) {
            $.mitools.data.PostCommand({
                url: $.mitools.path + '/unis/Data' + '?' + $.param({
                    type: 'theme',
                    key: 'set',
                    path: 'user'
                }) + '&t=' + new Date().valueOf(),
                data: {
                    'new': {
                        theme: theme
                    }
                },
                async: true,
                success: function (result) {
                }
            });
            $("link.js-theme").attr("href", $.mitools.path + "/Content/bootstrap/" + theme + "/bootstrap.min.css");
            $("#h-main-content iframe").each(function (i, n) {
                if (n.contentDocument) {
                    $("link.js-theme", n.contentDocument).attr("href", $.mitools.path + "/Content/bootstrap/" + theme + "/bootstrap.min.css");
                }
            });
            $(".js-theme-select li.active").removeClass("active");
            $(this).parent().addClass("active");
        }
    });
});
function _checkFake() {
    //window.open($.mitools.path + "/Customer/validcode.aspx", '_blank');
    OnRing('13911564311', '5666', '123456789', '');
}
function OnRing(ani, dnis, caseid, calldata) {
    _ani = ani;
    _dnis = dnis;
    _caseid = caseid;
    _calldata = calldata;
    _inout = 'IN';
    var url = "ani=" + ani + "&dnis=" + dnis + "&caseid=" + caseid + "&calldata=" + calldata + "&inout=IN&t=" + new Date().valueOf();
    //window.location.href = $.mitools.path + "/Customer/Main.aspx?" + url;
    if (dnis == '53767369')
    {
        $("#h-main-tabs").mitabs("add", {
            caption: "新来电",
            container: "#h-main-content",
            url: "Customer/DnisCusotmer.aspx?" + url,
            id: "dnismain",
            func: function (win) {
                win.OnRing(ani, dnis, caseid, calldata);
            }
        });
        return;
    }
    $("#h-main-tabs").mitabs("add", {
        caption: "新来电",
        container: "#h-main-content",
        url: "Customer/Main.aspx?" + url,
        id: "main",
        func: function (win) {
            win.OnRing(ani, dnis, caseid, calldata);
        }
    });

    //    $.mitools.data.PostCommand($.mitools.path + '/unis/Data?' + $.param({
    //                    path: "se",
    //                    type: "callback",
    //                    key: "savecall"
    //                }) + '&t=' + new Date().valueOf(),
    //                { old: null, "new": { "custid":_custid, "caseid": _caseid,"event": "ring" } },
    //                function (r) {

    //                });
}
function OnDialing(ani, dnis, caseid, calldata) {
    _ani = ani;
    _dnis = dnis;
    _caseid = caseid;
    _calldata = calldata;
    _inout = 'OUT';
    
    var content = $("#h-main-content .active").find("iframe");
    if (content.length && content[0].contentWindow.OnDialing) {
        content[0].contentWindow.OnDialing(ani, dnis, caseid, calldata);
    }

    //    $.mitools.data.PostCommand($.mitools.path + '/unis/Data?' + $.param({
    //                    path: "se",
    //                    type: "callback",
    //                    key: "savecall"
    //                }) + '&t=' + new Date().valueOf(),
    //                { old: null, "new": { "custid":_custid, "caseid": _caseid,"event": "dialing" } },
    //                function (r) {

    //                });
}
function OnDisconnect(caseid) {
    //    if( caseid)
    //        _caseid = caseid;

    //    alert("disconnect:" + _caseid);
    //    $.mitools.data.PostCommand($.mitools.path + '/unis/Data?' + $.param({
    //                    path: "se",
    //                    type: "callback",
    //                    key: "savecall"
    //                }) + '&t=' + new Date().valueOf(),
    //                { old: null, "new": { "custid":_custid, "caseid": caseid,"event": "disconnect" } },
    //                function (r) {

    //                });
}

function OnHook(caseid) {
    //在这里保存呼叫历史，不再放到Cust页面做
    //if (caseid)
    //    _caseid = caseid;
    //$.wcf.invoke({
    //    async: true,
    //    url: $.mitools.path + "/unis/Data?t=" + new Date().valueOf(),
    //    type: "GET",
    //    data: {
    //        path: "se",
    //        type: "callback",
    //        key: "savecall",
    //        custid: _custid,
    //        caseid: _caseid, 
    //        event: "onhook"
    //    },
    //    success: function (result) {

    //    }
    //});
   
   
}

function SetCustID(custid) {
    _custid = custid;
    //    alert(_custid);
}

function GetCallInfo() {
    return { ani: _ani, dnis: _dnis, caseid: _caseid, calldata: _calldata, inout: _inout };
}
//function GetAni()
//{
//    return _ani;
//}

//function GetDnis()
//{
//    return _dnis;
//}

//function GetCaseid()
//{
//    return _caseid;
//}

//function GetCalldata()
//{
//    return _calldata;
//}

//function GetInout()
//{
//    return _inout;
//}

function clearCtiInfo() {
    var content = $("#h-main-content").find("iframe");
    for (var i = 0; i < content.length; i++) {
        if (ontent[i].contentWindow.clearCtiInfo)
            content[i].contentWindow.clearCtiInfo();
    }
}


function opentabbyani(ani)
{
     $("#h-main-tabs").mitabs("add", {
        caption: ani,
        container: "#h-main-content",
        url: "Customer/Main.aspx?ani=" + ani,
        id: "main"+ani
    });

}