/*!
 * mediaupload v1.0.0
 * Copyright 2015 DT Mip, Inc.
 */
(function ($) {
    $.extend({
        slidemenu: {
            version: "1.0.0",
            sid: 1
        }
    });

    $.fn.slidemenu = function (options) {
        if (typeof options === 'string') {
            var fn = $.slidemenu[options];
            if (!fn) {
                throw ("slidemenu - No such method: " + options);
            }
            var args = $.makeArray(arguments).slice(1);
            return fn.apply(this, args);
        }
        return this.each(function () {
            $.slidemenu.init.call(this, options);
        });
    };
    $.extend($.slidemenu, {
        settings: {},
        init: function (options) {
            var obj = this,
                settings = {
                    
                };
            $.extend(settings, options);
            obj.settings = settings;
            var $this = $(obj);
            $this.find("li.slide > ul, li.slide-sub > ul").each(function (i, n) {
                var $this = $(this);
                $this.collapse({
                    parent: $this.parent().closest("ul"),
                    toggle: false
                });
            });
            var scroll = $.fn.niceScroll && $this.closest(".box-body").getNiceScroll();
            if (scroll) {
                $this.on("shown.bs.collapse", function (e) {
                    scroll.resize();
                });
                $this.on("hidden.bs.collapse", function (e) {
                    scroll.resize();
                });
            }
            $this.on("show.bs.collapse", function (e) {
                $(e.target).parent().addClass("in");
            });
            $this.on("hide.bs.collapse", function (e) {
                $(e.target).parent().removeClass("in");
            });

            $this.on("click", "li.slide > a, li.slide-sub > a", function (e) {
                var $ul = $(this).next("ul");
                $ul.collapse('toggle');
                return false;
            });
        }
    });
})(jQuery);