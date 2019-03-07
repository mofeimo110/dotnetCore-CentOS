(function ($) {
    $.extend({
        mialerts: {
            version: "1.0.1",
            tid: 1
        }
    });

    $.extend($.mialerts, {
        amount: { info: 0, task: 0, flow: 0 },
        load: function (options) {
            if (!$.mitools)
                return;
            options = $.extend({
                url: $.mitools.path + "/unis/data",
                data: { type: "alert", key: "get", path: "message" },
                interval: 300
            }, options);
            if (!$.isPlainObject(options))
                return;
            Messenger.options = {
                extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
                theme: 'future'
            };
            var loadalert = function (init) {
                $.wcf.invoke({
                    async: true,
                    url: options.url + '?t=' + new Date().valueOf(),
                    data: $.extend(options.data, { init: init||null }),
                    type: "GET",
                    success: function (result) {
                        if (result) {
                            if ($.isArray(result)) {
                                var href = "", amount = 0, type = "";
                                
                                $.mialerts.amount = { info: 0, task: 0, flow: 0 };
                                $.each(result, function (i, n) {
                                    switch (n.type) {
                                        case 1:
                                            href = $.mitools.path + "/Messager/MyTaskList.aspx";
                                            $.mialerts.amount.task += n.count;
                                            type = "task";
                                             $("#sysmsg-" + type).find(".badge").text($.mialerts.amount.task || "");
                                            break;
                                        case 2:
                                            href = $.mitools.path + "/Messager/AnnouceViewList.aspx";
                                            $.mialerts.amount.info += n.count;
                                            type = "info";
                                             $("#sysmsg-" + type).find(".badge").text($.mialerts.amount.info || "");
                                            break;
                                        default:
                                            href = $.mitools.path + "/Messager/MyTaskList.aspx";
                                            $.mialerts.amount.flow += n.count;
                                            type = "flow";
                                             $("#sysmsg-" + type).find(".badge").text($.mialerts.amount.flow || "");
                                            break;
                                    }
                                    if (n["new"]) {
                                        Messenger().post({
                                            message: '消息通知：<a href="' + href + '?msgid='+n.msgid+ '" target="tab">' + n["new"] + '条' + n.typedsc + '</a>',
                                            type: 'info'
                                        });
                                    }
                                    //$("#sysmsg-" + type).find(".badge").text(n.count || "");
                                    amount += n.count;
                                });
                                //else
                                //    $.mitools.dialog.ShowError(result.Cause);
                                $("#sysmsg-amount").find(".badge").text(amount || "");
                            }
                        }
                    }
                }
                );
            };
            if (options.interval) {
                loadalert("1");
                return window.setInterval(loadalert, options.interval * 1000);
            }
            else
                return loadalert();
        }
    });
})(jQuery);
