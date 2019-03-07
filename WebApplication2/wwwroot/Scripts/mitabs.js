/*!
 * mitabs v1.0.1
 * Copyright 2014 DT Mip, Inc.
 */
(function ($) {
    $.extend({
        mitabs: {
            version: "1.0.1",
            tid: 1
        }
    });

    $.fn.mitabs = function (options) {
        if (typeof options === 'string') {
            var fn = $.mitabs[options];
            if (!fn) {
                throw ("mitabs - No such method: " + options);
            }
            var args = $.makeArray(arguments).slice(1);
            return fn.apply(this, args);
        }
        return $.mitabs.init.call(this, options);
    };
    $.extend($.mitabs, {
        init: function (options) {
            return this.each(function () {
                //if (!$.isPlainObject(options))
                //    return;
                if (this.mitabs)
                    return;
                this.mitabs = true;
                return;
            });
        },
        add: function (options) {
            options = $.extend({
                caption: "新选项卡",
                container: "",
                url: "",
                anchor: null,
                close: true,
                id: null,
                func: null
            }, options);
            //对url进行检查
            if (options.anchor)
                options.url = options.anchor.href;
            if (!options.url)
                return;
            options.id = options.id || options.url.split("#")[0];
            return this.each(function () {
                if (!this.mitabs) {
                    $.mitabs.init.call($(this));
                }
                var $tabs = $(this);
                var id = $tabs.data("url-" + options.id.toLowerCase());
                if (id) {
                    $tabs.find("a[href='#mitabs-a-" + id  + "']").tab("show");
                    var content = $("#mitabs-a-" + id).find("iframe");
                    if (content.length) {
                        if (options.func)
                            options.func(content[0].contentWindow);
                        else if (content.attr("src").toLowerCase() != options.url.toLowerCase())
                            content.attr("src", options.url);
                    }
                    return;
                }
                id = $.mitabs.tid++;
                var self = this, $li = $('<li><a href="#mitabs-a-' + id + '" role="tab" data-toggle="tab">'
                    + options.caption + (options.close?'<button class="close" type="button">×</button>':'')+'</a></li>').appendTo(this),
                    $content = $('<div class="tab-pane in active full-height" id="mitabs-a-' + id + '"></div>').appendTo(options.container)
                .append($('<iframe class="frame-auto full-height" frameborder="0"> 页面加载中 ...</iframe>').attr("src", options.url));
                $tabs.data("url-" + options.id.toLowerCase(), id);
                $li.find(".close").on("click", function (e) {
                    e.preventDefault();
                    if ($li.hasClass("active"))
                        $li.prev().find("a").tab('show');
                    $tabs.removeData("url-" + options.id.toLowerCase());
                    $li.remove();
                    $content.remove();
                    return false;
                });
                $li.find("a").on("show.bs.tab", function (e) {
                    if (!e.relatedTarget)
                        return;
                    try{
                        var $prev = $(e.relatedTarget),
                            selector = $.mitabs._target($prev),
                            contents = $(selector).find("iframe").contents();
                        $prev.data("scrollTop", contents.find("html, body").scrollTop());
                        contents.find(".ui-jqgrid-view[role='grid'] .ui-jqgrid-bdiv").each(function (i, n) {
                            $(n).data("scrollTop", $(n).scrollTop());
                            $(n).data("scrollLeft", $(n).scrollLeft());
                        });
                    }
                    catch (e) {}
                }).on("shown.bs.tab", function (e) {
                    if (!e.target)
                        return;
                    var $this = $(this),
                        scrollTop = $this.data("scrollTop");
                    if (scrollTop != null) {
                        var selector = $.mitabs._target($this),
                        contents = $(selector).find("iframe").contents();
                        contents.find("html, body").scrollTop(scrollTop);
                        contents.find(".ui-jqgrid-view[role='grid'] .ui-jqgrid-bdiv").each(function (i, n) {
                            if ($(n).data("scrollTop"))
                                $(n).scrollTop($(n).data("scrollTop"));
                            if ($(n).data("scrollLeft"))
                                $(n).scrollLeft($(n).data("scrollLeft"));
                        });
                    }
                }).tab("show");
            });
        },
        remove: function (options) {
            options = $.mitabs._buildId(options);
            if (!options.id)
                return;
            return this.each(function () {
                if (!this.mitabs) {
                    return;
                }
                var $tabs = $(this);
                var id = $tabs.data("url-" + options.id.toLowerCase());
                if (!id)
                    return;
                $tabs.find("a[href='#mitabs-a-" + id + "'] .close").trigger("click");
                return;
            });
        },
        _buildId: function (options) {
            options = $.extend({
                url: "",
                anchor: null,
                id: null
            }, options);
            //对url进行检查
            if (options.anchor)
                options.url = options.anchor.href;
            options.id = options.id || options.url.split("#")[0];
            return options;
        },
        set: function (options) {
            options = $.mitabs._buildId(options);
            if (!options.id)
                return;
            return this.each(function () {
                if (!this.mitabs) {
                    return;
                }
                var $tabs = $(this);
                var id = $tabs.data("url-" + options.id.toLowerCase());
                if (!id)
                    return;
                if (options.caption) {
                    var conts = $tabs.find("a[href='#mitabs-a-" + id + "']").contents();
                    if (conts && conts.length)
                        conts[0].textContent = options.caption;
                }
                return;
            });
        },
        _target: function (a) {
            var $a = $(a),
                selector = $a.data('target');
            if (!selector) {
                selector = $a.attr('href');
                selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
            }
            return selector;
        },
        isActive: function (options) {
            options = $.mitabs._buildId(options);
            if (!options.id)
                return;
            var ret = false;
            this.each(function () {
                if (!this.mitabs) {
                    return true;
                }
                var $tabs = $(this);
                var id = $tabs.data("url-" + options.id.toLowerCase());
                if (!id)
                    return true;
                var $li = $tabs.find("a[href='#mitabs-a-" + id + "']").closest("li");
                if ($li.hasClass("active")) {
                    if (options.url) {
                        var content = $("#mitabs-a-" + id).find("iframe");
                        if (content.length) {
                            if (content.attr("src").toLowerCase().split("#")[0] == options.url.toLowerCase()) {
                                ret = true;
                            }
                        }
                    }
                    else {
                        ret = true;
                    }
                    return false;
                }
            });
            return ret;
        },
        getFrame: function(options){
            options = $.mitabs._buildId(options);
            if (!options.id)
                return;
            var ret = false;
            this.each(function () {
                if (!this.mitabs) {
                    return true;
                }
                var $tabs = $(this);
                var id = $tabs.data("url-" + options.id.toLowerCase());
                if (!id)
                    return true;
                var $li = $tabs.find("a[href='#mitabs-a-" + id + "']").closest("li");
                if ($li.length) {//.hasClass("active")) {
                    var frame = $("#mitabs-a-" + id).find("iframe");
                    if (options.url) {
                        if (frame.length) {
                            if (frame.attr("src").toLowerCase().split("#")[0] == options.url.toLowerCase()) {
                                ret = frame;
                                return false;
                            }
                        }
                    }
                    else {
                        ret = frame;
                        return false;
                    }
                }
            });
            return ret;
        },
        getTab: function (options) {
            options = $.mitabs._buildId(options);
            if (!options.id)
                return;
            var ret = false;
            this.each(function () {
                if (!this.mitabs) {
                    return true;
                }
                var $tabs = $(this);
                var id = $tabs.data("url-" + options.id.toLowerCase());
                if (!id)
                    return true;
                var li = $tabs.find("a[href='#mitabs-a-" + id + "']").closest("li");
                if (li.length){
                    if (options.url) {
                        var content = $("#mitabs-a-" + id).find("iframe");
                        if (content.length) {
                            if (content.attr("src").toLowerCase().split("#")[0] == options.url.toLowerCase()) {
                                ret = li;
                            }
                        }
                    }
                    else {
                        ret = li;
                    }
                    return false;
                }
                return true;
            });
            return ret;
        }
    });
})(jQuery);