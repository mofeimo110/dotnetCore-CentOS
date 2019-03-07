(function ($) {
    $.extend({
        ministatis: {
            version: "1.0.1",
            id: 1
        }
    });

    $.extend($.ministatis, {
        call: function (options) {
            options = options || {};
            $.wcf.invoke({
                async: true,
                url: (options.url || ($.mitools.path + '/unis/Data')) + '?t=' + new Date().valueOf(),
                data: options.data || { type: "statis", key: "minicall", path: "user" },
                type: "GET",
                success: function (result) {
                    if (result && $.isArray(result)) {
                        var row = result[0];
                        $(".leftnavigator .mini-statis-call .js-count a").text(row["count"]||0);
                        $(".leftnavigator .mini-statis-call .js-in a").text((row["inconnect"]||0) + "/" + (row["in"]||0));
                        $(".leftnavigator .mini-statis-call .js-out a").text((row["outconnect"]||0) + "/" + (row["out"]||0));
                    }
                },
                error: function (x, e, m) {
                    //alert(x + " " + m);
                }
            });
        },
        lastcall: function (options) {
            options = options || {};
            $.wcf.invoke({
                async: true,
                url: (options.url || ($.mitools.path + '/unis/Data')) + '?t=' + new Date().valueOf(),
                data: options.data || { type: "statis", key: "lastcall", path: "user" },
                type: "GET",
                success: function (result) {
                    if (result && $.isArray(result)) {
                        $(".leftnavigator .js-last-call").empty();
                        $.each(result, function (i, n) {
                            $(".leftnavigator .js-last-call").append(
                                $("<a class='list-group-itme' target='tab'/>")
                                .attr("href", $.mitools.path + "/Customer/Main.aspx?ani=" + n["tel"])
                                .text(n["tel"])
                                .append($("<span class='pull-right'>" + (n["calltype"]=='IN'?'呼入':'呼出') + " " + n["time"] + "</span>")));
                        });
                    }
                },
                error: function (x, e, m) {
                    //alert(x + " " + m);
                }
            });
        },
        workstatis: function (options) {
            options = options || {};
            $.wcf.invoke({
                async: true,
                url: (options.url || ($.mitools.path + '/unis/Data')) + '?t=' + new Date().valueOf(),
                data: options.data || { type: "statis", key: "work", path: "user" },
                type: "GET",
                success: function (result) {
                    if (result && $.isArray(result)) {
                        var row = result[0];
                        $(".leftnavigator .js-work-statis .js-count").text(row["count"]||0);
                        $(".leftnavigator .js-work-statis .js-consult").text(row["consult"]||0);
                        $(".leftnavigator .js-work-statis .js-complain").text(row["complain"]||0);
                        $(".leftnavigator .js-work-statis .js-service").text(row["service"]||0);
                        $(".leftnavigator .js-work-statis .js-other").text(row["other"]||0);
                    }
                },
                error: function (x, e, m) {
                    //alert(x + " " + m);
                }
            });
        },
        freqmenu: function (options) {
            options = options || {};
            $.wcf.invoke({
                async: true,
                url: (options.url || ($.mitools.path + '/unis/Data')) + '?t=' + new Date().valueOf(),
                data: options.data || { type: "menu", key: "list", path: "user" },
                type: "GET",
                success: function (result) {
                    if (result && $.isArray(result)) {
                        $(".leftnavigator .js-frequently-menu").empty();
                        $.each(result, function (i, n) {
                            $(".leftnavigator .js-frequently-menu").append(
                                $("<a class='list-group-item mini-link' target='tab'/>")
                                .attr("href", n["url"])
                                .append("<button class='pull-right close' action='delete_freq_menu' rid='" + n["id"] + "'><span aria-hidden='true'>×</span></button>")
                                .append(n["name"])
                                );
                        });
                    }
                },
                error: function (x, e, m) {
                    //alert(x + " " + m);
                }
            });
        }
    });
})(jQuery);
