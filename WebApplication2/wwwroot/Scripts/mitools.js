/*!
 * mitools v1.3.9
 * Copyright 2013-2015 DT Mip, Inc.
 */
var mitoolsJS = {};
var t = document.getElementsByTagName("SCRIPT");
t = (mitoolsJS.scriptElement = t[t.length - 1]).src;
mitoolsJS.path = t.substring(0, t.lastIndexOf("/", t.lastIndexOf("/") - 1));

jQuery.fn.justtext = function () {
    return $(this).clone()
            .children()
            .remove()
            .end()
            .text();
};

(function ($) {
    $.mitools = $.mitools || {};
    $.extend($.mitools, {
        version: "1.3.9",
        queryString: {},
        path: "",
        init: function () {
            $.mitools.path = mitoolsJS.path;
            t = location.search.match(new RegExp("[\?\&][^\&]+=[^\&]+", "g"));
            if (t != null) {
                for (var i = 0; i < t.length; i++) {
                    t[i] = t[i].substring(1);
                    var t2 = t[i].split('=');
                    if (t2.length > 1)
                        $.mitools.queryString[t2[0]] = t2[1];
                }
            }

            $(function () {
                if (parent && parent != window && parent.$.mitools) {
                    $.mitools.dialog = parent.$.mitools.dialog;
                    return;
                }
                $.mitools.dialog.dialogModal = $('<div class="modal fade" role="dialog"><div class="modal-dialog"><div class="modal-content">' +
                    '<div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">关闭</span></button>' +
                    '<h4 class="modal-title"></h4></div><div class="modal-body">' +
                    '<div class="alert" role="alert"></div>' +
                    '</div><div class="modal-footer"><button type="button" class="btn">确定</button>' +
                    '<button type="button" class="btn">取消</button>' +
                    '</div></div></div></div>').appendTo(document.body);
                $(document).on('hidden.bs.modal', '.modal', function (event) {
                    $(this).removeClass('fv-modal-stack');
                    $('body').data('fv_open_modals', $('body').data('fv_open_modals') - 1);
                });
                $(document).on('shown.bs.modal', '.modal', function (event) {
                    // keep track of the number of open modals
                    if (typeof ($('body').data('fv_open_modals')) == 'undefined') {
                        $('body').data('fv_open_modals', 0);
                    }
                    // if the z-index of this modal has been set, ignore.
                    if ($(this).hasClass('fv-modal-stack')) {
                        return;
                    }
                    $(this).addClass('fv-modal-stack');
                    $('body').data('fv_open_modals', $('body').data('fv_open_modals') + 1);
                    $(this).css('z-index', 1040 + (10 * $('body').data('fv_open_modals')));
                    $('.modal-backdrop').not('.fv-modal-stack')
                            .css('z-index', 1039 + (10 * $('body').data('fv_open_modals')));
                    $('.modal-backdrop').not('fv-modal-stack')
                            .addClass('fv-modal-stack');
                });
                $.mitools.dialog.dialogModal.on("shown.bs.modal", function () {
                    $.mitools.dialog.dialogModal.find(".btn:first").focus();
                });
            });
        },
        hasPermission: function (perm) {
            if (!perm)
                return false;
            if (_gdata && _gdata.Permissions)
                return _gdata.Permissions.indexOf(perm.toLowerCase()) >= 0;
            else
                return false;
        },
        dialog: {
            busyModal: null,
            busyMode: "busy",
            dialogModal: null,
            Close: function (options) {
                options = options || {};
                if (options.immediate)
                    $.mitools.dialog.dialogModal.removeClass("fade");
                if (options.success)
                    $.mitools.dialog.dialogModal.on("hidden.bs.modal", function () {
                        $.mitools.dialog.dialogModal.off("hidden.bs.modal");
                        options.success();
                    });
                $.mitools.dialog.dialogModal.modal("hide");
                if (options.immediate)
                    $.mitools.dialog.dialogModal.addClass("fade");
                return false;
            },

            ShowInfo: function (message, funcOK) {
                $.mitools.dialog.ShowDetail("info", "提示", message, funcOK ? funcOK : $.mitools.dialog.Close);
            },

            ShowError: function (message) {
                $.mitools.dialog.ShowDetail("danger", "错误", message, $.mitools.dialog.Close);
            },

            ShowConfirm: function (title, notice, func) {
                $.mitools.dialog.ShowDetail("warning", title, notice, func, $.mitools.dialog.Close);
            },

            ShowDetail: function (type, title, message, funcOK, funcCancel) {
                var $modal = $.mitools.dialog.dialogModal, $alert = $modal.find(".alert");
                $alert.removeClass(function (index, css) {
                    return (css.match(/(^|\s)alert-\S+/g) || []).join(' ');
                });
                if (type)
                    $alert.addClass("alert-" + type);
                $alert.html(message);
                var buttons = [];
                if (funcOK) {
                    buttons.push({ text: "确定", click: funcOK, class: "btn-primary" });
                }
                if (funcCancel) {
                    buttons.push({ text: "取消", click: funcCancel });
                }
                $.mitools.dialog.ShowDialog(title, { buttons: buttons });
            },

            ShowDialog: function (title, options) {
                var $modal = $.mitools.dialog.dialogModal;
                $modal.find(".modal-title").text(title);
                var buttons = $modal.find(".btn");
                buttons.hide();
                if (options && options.buttons) {
                    $.each(options.buttons, function (i, n) {
                        var btn = buttons.get(i);
                        if (btn) {
                            var $btn = $(btn);
                            $btn.removeClass(function (index, css) {
                                return (css.match (/(^|\s)btn-\S+/g) || []).join(' ');
                            });
                            if (n.text)
                                $btn.text(n.text);
                            if (n.click) {
                                $btn.off();
                                $btn.on("click", n.click);
                            }
                            if (n.class)
                                $btn.addClass(n.class);
                            else
                                $btn.addClass("btn-default")
                            $btn.show();
                        }
                    })
                }
                $modal.modal("show");
            },
            busy: function (message) {
                if (!$.mitools.dialog.busyModal) {
                    if ($.mitools.dialog.busyMode == "busy") {
                        $.mitools.dialog.busyModal = $('<div class="modal fade" role="dialog" data-backdrop="false">' +
                '<div class="modal-dialog modal-sm">' +
                    '<div class="modal-content">' +
                        '<div class="modal-header">' +
                            '<h4 class="modal-title">正在处理中</h4>' +
                        '</div>' +
                        '<div class="modal-body">' +
                            '<div class="progress">' +
                                '<div class="progress-bar progress-bar-striped active" role="progressbar"' +
                                'aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">' +
                                '<span class="sr-only">45% Complete</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                '</div>' +
                '<!-- /.modal-content -->' +
            '</div>' +
                '<!-- /.modal-dialog -->' +
            '</div>').appendTo("form");
                    }
                    else {
                        $.mitools.dialog.busyModal = $('<div class="modal loading" role="dialog" data-backdrop="false">' +
            '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                    '<div class="modal-body">' +
                        '<div>' +
                        '<i class="glyphicon glyphicon-repeat fa-spin"></i>' +
                            '</div>' +
                        '<div>加载中</div>' +
                    '</div>' +
                '</div>' +
                '<!-- /.modal-content -->' +
            '</div>' +
            '<!-- /.modal-dialog -->' +
        '</div>').appendTo("form");
                    }
                }
                $.mitools.dialog.busyModal.modal("show");
            },
            idle: function () {
                if ($.mitools.dialog.busyModal)
                    $.mitools.dialog.busyModal.modal("hide");
            }
        },

        data: {
            formatters: {},
            Formatter: function (fid, obj) {
                if ($.isPlainObject(fid)) {
                    $.each(fid, function (i, n) {
                        $.mitools.data.formatters[i] = n;
                    });
                }
                else
                    $.mitools.data.formatters[fid] = obj;
            },
            LoadDatas: function (data, url) {
                var ret;
                $.wcf.invoke({
                    type: "GET",
                    url: url || ($.mitools.path + '/unis/Data') + '?t=' + new Date().valueOf(),
                    data: data,
                    async: false,
                    success: function (result) {
                        if (result) {
                            if (result.Code == 0 || $.isArray(result)) {
                                ret = result;
                            }
                            else
                                $.mitools.dialog.ShowError(result.Cause);
                        }
                    },
                    error: function (x, e, msg) {
                        $.mitools.dialog.ShowError(x.status + " " + msg);
                    }
                });
                return ret;
            },
            LoadRow: function(data, url){
                return $.mitools.data.GetRow($.mitools.data.LoadDatas(data, url));
            },
            GetRow: function (datas) {
                var ret = null;
                if (datas) {
                    if ($.isArray(datas))
                        ret = datas[0];
                    else
                        ret = datas;
                }
                return ret;
            },
            LoadData: function (container, data, not, url) {
                var ret = $.mitools.data.LoadRow(data, url);
                if (ret && container)
                    $.mitools.data.SetLine(container, ret, not);
                return ret;
            },

            BuildDefault: function (def, $this) {
                if (def) {
                    var fmt;
                    switch (def) {
                        case "$USRID":
                            def = _guserid;
                            break;
                        case "$TENANTID":
                            def = _gtenantid;
                            break;
                        case "$TENANTPOST":
                            if (_gtenantid && _gtenantid != "")
                                def = "@" + _gtenantid;
                            else
                                def = "";
                            break;
                        case "$CURDATE":
                            if (!(fmt = $this.attr("format")))
                                fmt = "yyyy-MM-dd";
                            break;
                        case "$CURDATETIME":
                            if (!(fmt = $this.attr("format")))
                                fmt = "yyyy-MM-dd HH:mm";
                            break;
                        case "$CURTIME":
                            if (!(fmt = $this.attr("format")))
                                fmt = "HH:mm:ss";
                            break;
                        case "$NOW":
                            if (!(fmt = $this.attr("format")))
                                fmt = "yyyy-MM-dd HH:mm:ss";
                            break;
                        default:
                            if (def.substr(0, 1) == "#") {
                                def = request.QueryString(def.substr(1));
                            }
                            break;
                    }
                    if (fmt)
                        def = $.format(new Date(), fmt);
                }
                return def;
            },

            SetValue: function ($this, val, fname, row) {
                $this = $($this);
                if ($this.length > 1) {
                    $this.each(function (i) {
                        $.mitools.data.SetValue(this, val, fname);
                    });
                    return;
                }
                if (!fname)
                    fname = $this.attr("fid");
                //console.log("%s mitools.SetValue fid=%s, val=%s...", $.format.date(new Date(), 'HH:mm:ss.SSS'), fname, val);
                //根据缺省值进行设置
                var def, edittype;
                if(!val && (def = $this.attr("default")))
                    val = $.mitools.data.BuildDefault(def, $this);
                val = val || '';
                
                if ($this.is(":input")) {
                    if ($this.is(":checkbox")) {
                        if ((val != "" && $this.val() == val) || val == true || val == 'Yes')
                            $this.prop("checked", true);
                        else
                            $this.prop("checked", false);
                        if ($this.parent(".bootstrap-switch-container").length)
                            $this.bootstrapSwitch('state', $this.prop("checked"));
                    }
                    else {
                        var postfix = $this.attr("postfix");
                        if (postfix) {
                            postfix = $.mitools.data.BuildDefault(postfix, $this);
                            var pos = val.lastIndexOf(postfix);
                            if (pos == val.length - postfix.length)
                                val = val.substr(0, pos);
                        }
                        if ($this.is("select")) {
                            if (!val)
                                $this.find("option:selected").prop("selected", false);
                            else if ($this.prop("multiple")) {
                                var lst = $.isArray(val) ? val : val.split($this.attr('separator') || ',');
                                $this.val(lst);
                            }
                            else
                                $this.val(val);
                            if ($this.is('[class^="chosen-select"], [class*=" chosen-select"]'))
                                $this.trigger("chosen:updated");
                        }
                        else
                            $this.val(val);
                        $this.trigger("change", true);
                    }
                }
                else if ($this.is("div, ul, ol") && (edittype = $this.attr("edittype"))) {
                    switch (edittype) {
                        case "pier":
                            $this.html("");
                            var lst = $.isArray(val) ? val : val.split($this.attr('separator') || ','),
                                target = $this.data("target");
                            if (target && $(target).length)
                                $(target).val(lst.join($this.attr('separator') || ","));
                            $.each(lst, function (i, n) {
                                if (n) {
                                    var fn = $.mitools.data.formatters[fname];
                                    if (fn && fn.formatter)
                                        $this.append(fn.formatter(n, $this));
                                    else
                                        $this.append("<div class='mini-block'><span data='" + n + "' >" + ($this.attr("data-left") || "") + n + ($this.attr("data-right") || "") + "</span>" +
                                            "<button class='close' data='" + n + "' action='remove' title='删除'><span aria-hidden='true'>×</span></button></div>");
                                }
                            });
                            break;
                        case "dynatree":
                            //dynatree
                            var tree = $this.dynatree("getTree"),
                                selectedNodes = tree.getSelectedNodes();
                            $.each(selectedNodes, function (i, n) {
                                n.select(false);
                            });
                            var lst = $.isArray(val) ? val : val.split($this.attr('separator') || ',');
                            $.each(lst, function (i, n) {
                                tree.selectKey(n);
                            });
                            if (fname == "parentid" && currentRow) {
                                var node = tree.getNodeByKey(currentRow["id"]);
                                if (node != null) {
                                    node.data.unselectable = true;
                                    lastNode = node;
                                }
                            }
                            break;
                        case "view":
                            $this.html(val);
                            break;
                        case "radio":
                            if (!$.isArray(val))
                                val = val.split($this.attr('separator') || ',');
                            $this.find("input[type='radio']").val(val);
                            break;
                    }
                }
                //else if ($this.is("table")) {
                //    var lst = $.isArray(val) ? val : val.split($this.attr('separator') || ',');
                //    $("input", $this).each(function (j, e) {
                //        if ($.inArray(e.value, lst) >= 0) {
                //            e.checked = true;
                //        }
                //        else
                //            e.checked = false;
                //    });
                //}
                else {
                    var fn = $.mitools.data.formatters[fname];
                    if (fn && fn.formatter)
                        $this.html(fn.formatter(val, $this, row));
                    else
                        $this.text(val);
                }
                //console.log("%s mitools.SetValue fid=%s, val=%s done.", $.format.date(new Date(), 'HH:mm:ss.SSS'), fname, val);
            },

            SetLine: function (container, row, not, ignore) {
                if (!container)
                    return;
                $(container).find("*[fid]").not(not).each(function (i, element) {
                    var $this = $(this);
                    var fname = $this.attr("fid");
                    if (fname) {
                        var val = null;
                        if (row != null) {
                            val = row[fname] || row[fname.toUpperCase()];
                        }
                        if (val || !ignore)
                            $.mitools.data.SetValue($this, val, fname, row);
                    }
                });
            },

            GetValue: function ($this, newRow) {
                $this = $($this);
                var fname = $this.attr("fid");
                if (fname) {
                    var val = $this.attr("val");
                    if (val == null) {
                        var edittype;
                        if ($this.is(":input")) {
                            if ($this.is(":checkbox")) {
                                if ($this.is(":checked")) {
                                    val = $this.val() || true;
                                }
                                else {
                                    val = $this.attr("offval") || false;
                                }
                            }
                            else {
                                var postfix = $this.attr("postfix");
                                if(postfix)
                                    postfix = $.mitools.data.BuildDefault(postfix, $this);
                                if ($this.is("select")) {
                                    var multi;
                                    if (!newRow || (multi = $this.prop("multiple"))) {
                                        val = $this.val();
                                        if (val && multi) {
                                            if ($this.attr("datatype") != "array")
                                                val = val.join($this.attr("separator") || ',');
                                        }
                                    }
                                    else {
                                        //获取选中项的其他属性
                                        val = null;
                                        if ($this.find("option:selected").length > 0) {
                                            var attrs = $this.find("option:selected").get(0).attributes, len = attrs.length;
                                            $.each(attrs, function (i, n) {
                                                if (n.name == "value")
                                                    val = n.value;
                                                else if (n.name.substr(0, 5) == 'data-')
                                                    newRow[n.name.substr(5)] = n.value;
                                            });
                                        }
                                    }
                                }
                                else {
                                    val = $this.val();
                                }
                                if (postfix)
                                    val += postfix;
                            }
                        }
                        else if ($this.is("div, ul, ol") && (edittype = $this.attr("edittype"))) {
                            switch (edittype) {
                                case "pier":
                                    var fn = $.mitools.data.formatters[fname];
                                    var lst = $this.children().map(function (i, n) {
                                        if (fn && fn.unformatter)
                                            return fn.unformatter(n, $this);
                                        else
                                            return $(n).children("span").attr("data");
                                    });
                                    if ($this.attr("datatype") == "array")
                                        val = lst.get();
                                    else
                                        val = lst.get().join($this.attr('separator') || ",");
                                    break;
                                case "dynatree":
                                    //dynatree
                                    var lst = $.map(
                                    $this.dynatree("getTree").getSelectedNodes($this.attr("stopOnParents") == "true"),
                                    function (node) {
                                        return node.data.key;
                                    });
                                    if ($this.attr("datatype") == "array")
                                        val = lst;
                                    else
                                        val = lst.join($this.attr('separator') || ",");
                                    break;
                                case "view":
                                    val = $this.html();
                                    break;
                                case "radio":
                                    val = $("input[type='radio']:checked", $this).val();
                                    break;
                            }
                        }
                            //else if ($this.is("table")) {
                            //    val = $("input:checked", $this).map(function (i, n) {
                            //        return $(this).val();
                            //    });
                            //    if (val && $this.attr("datatype") != "array")
                            //        val = val.get().join($this.attr('separator') || ",");
                            //}
                        else {
                            var fn = $.mitools.data.formatters[fname];
                            if (fn && fn.unformatter)
                                return fn.unformatter($this.html(), $this);
                            else
                                val = $this.text();
                        }
                    }
                    return val;
                }
                else
                    return null;
            },

            BuildInputValue: function (container, options) {
                var newRow = new Object();
                $(container).find("*[fid]").each(function (i, element) {
                    var val = $.mitools.data.GetValue($(this), newRow);
                    //if (val)
                    //if (options && options.seprator && $.isArray(val))
                    //    val = val.join(options.seprator);
                        newRow[$(this).attr("fid")] = val;
                });
                return newRow;
            },

            BuildInputData: function (oldRow, container) {
                var newRow = $.mitools.data.BuildInputValue(container);
                var ret = new Object();
                ret.old = oldRow;
                ret['new'] = newRow;
                return ret;
            },

            SaveData: function(options){
                //options: {
                //    old: currentRow,
                //    container: "#main-info",
                //    not: "",
                //    data: {
                //        type: "datafield",
                //        key: ope
                //    },
                //    success: function (result) {
                //        window.history.go(-1);
                //    },
                //    notice: "",
                //    extend: {}
                //}
                var dataSet;
                if (options.rows && $.isArray(options.rows))
                    dataSet = $.map(options.rows, function (n) {
                        return { type: n.data.type, key: n.data.key, data: $.extend(true, $.mitools.data.BuildInputData(n.old, n.container), n.extend) };
                    });
                else
                    dataSet = $.extend(true, $.mitools.data.BuildInputData(options.old, options.container), options.extend);
                $.mitools.data.PostCommand(
                    $.extend($.extend({}, options), {
                        url: (options.url || ($.mitools.path + '/unis/Data')) + '?' + $.param(options.data) + '&t=' + new Date().valueOf(),
                        data: dataSet,
                        success: function (result) {
                            if (result != null && result.Code == 0) {
                                if (options.success)
                                    options.success(result);
                                else
                                    $.mitools.dialog.ShowInfo(options.notice || "保存成功");
                            }
                            else {
                                $.mitools.dialog.ShowError(result.Cause);
                            }
                        }
                    }));
            },

            PostCommand: function (options, data, success) {
                if (typeof options === 'string') {
                    options = {
                        url: options,
                        data: data,
                        success: success,
                        type: "POST"
                    };
                }
                else
                    options = $.extend({
                        type: "POST"
                    }, options);
                var settings = $.extend($.extend({}, options), {
                    success: function (r) {
                        $.mitools.dialog.idle();
                        if (options.success)
                            options.success(r);
                    },
                    error: function (x, e, msg) {
                        $.mitools.dialog.idle();
                        $.mitools.dialog.ShowError(x.status + " " + msg);
                    }
                });
                $.mitools.dialog.busy();
                $.wcf.invoke(settings);
            },

            LoadList: function (container, options) {
                var lists = $(container).find("select[ftype][fkey], div[ftype][fkey], input[ftype][fkey]"), cbcount = lists.length, n = 0, cb = function (r) {
                    if (++n >= cbcount && options && options.onComplete)
                        options.onComplete(cbcount);
                };
                //console.log("%s mitools.LoadList cbcount=%d.", $.format.date(new Date(), 'HH:mm:ss.SSS'), cbcount);

                if (cbcount == 0)
                    cb();
                lists.each(function (i, element) {
                    var $this = $(this),
                    fname = $this.attr("fid"),
                    ftype = $this.attr("ftype"),
                    fkey = $this.attr("fkey"),
                    fpath = $this.attr("fpath"),
                    frid = $this.attr("frid");

                    if (ftype && fkey) {
                        var data = {
                            type: ftype,
                            key: fkey
                        };
                        if (frid)
                            data.rid = frid;
                        if (fpath != null)
                            data["path"] = fpath;
                        $.mitools.data.LoadListData($this, data, options && options.fields ? options.fields[fname] : null, null, cb);
                    }
                    else
                        ++i;
                });
            },

            LoadListData: function ($this, data, options, url, callback) {
                //console.log("%s mitools.LoadListData data=%o ...", $.format.date(new Date(), 'HH:mm:ss.SSS'), data);
                var isTree = false, $tree = null;
                $this = $($this);
                if ($this.is("div") && $this.attr("edittype") == "dynatree") {
                    isTree = true;
                    $tree = $this;
                }
                else if ($this.is("input") && $this.next(".droptree-container").length > 0)
                {
                    isTree = true;
                    $tree = $this.next(".droptree-container");
                }
                if(isTree){
                    var inited = $tree[0].element, option = options || {};
                    option.initAjax = {
                        url: (url || $.mitools.path + '/unis/Tree/Data') + '?t=' + new Date().valueOf(),
                        data: data
                    };
                    option.onPostInit = function (isReloading, isError) {
                        if (callback)
                            callback();
                    };
                    if (inited) {
                        $tree.dynatree("option", option);
                        $tree.dynatree("getTree").reload();
                    }
                    else
                        $tree.dynatree(option);
                    return;
                }
                if (!isTree)
                    $this.empty();
                //console.log("%s mitools.LoadListData wcf.invoke, istree=%s ...", $.format.date(new Date(), 'HH:mm:ss.SSS'), isTree);
                $.wcf.invoke({
                    async: true,
                    url: (url || ($.mitools.path + '/unis/' + (isTree?'Tree/':'') + 'Data')) + '?t=' + new Date().valueOf(),
                    data: data,
                    type: "GET",
                    success: function (result) {
                        //console.log("%s mitools.LoadListData wcf.invoke success.", $.format.date(new Date(), 'HH:mm:ss.SSS'));
                        if (result && (result.Code == null || result.Code == 0)) {
                            $this.empty();
                            if ($this.is("select")) {
                                if(!$this.prop("multiple"))
                                    $("<option value=''/>").appendTo($this);
                                var lastcat = "", parent = $this;
                                $.each(result, function (idx, element) {
                                    var opt = $("<option/>");
                                    $.each(element, function (i, n) {
                                        var lval = i.toLowerCase();
                                        switch (lval) {
                                            case "id":
                                                opt.attr("value", n);
                                                break;
                                            case "text":
                                                opt.text(n);
                                                break;
                                            case "disabled":
                                                opt.prop("disabled", n);
                                                break;
                                            case "selected":
                                                opt.prop("selected", n);
                                                break;
                                            case "category":
                                                if (n != lastcat) {
                                                    if (!n)
                                                        parent = $this;
                                                    else {
                                                        parent = $("<optgroup/>").appendTo($this);
                                                        parent.attr("label", n);
                                                    }
                                                    lastcat = n;
                                                }
                                                break;
                                            default:
                                                opt.attr("data-" + lval, n);
                                                break;
                                        }
                                    });
                                    opt.appendTo(parent);
                                });
                                //console.log("%s mitools.LoadListData select inited.", $.format.date(new Date(), 'HH:mm:ss.SSS'));
                                if ($this.is('[class^="chosen-select"], [class*=" chosen-select"]'))
                                    $this.trigger("chosen:updated");
                            }
                        }
                        if (callback)
                            callback(result);
                    },
                    error: function (x, e, msg) {
                        if (callback)
                            callback({ Code: x, Cause: msg });
                    }
                });
            }
        },

        ui: {
            validOptions: {},
            initChosen: function (options) {
                var container, settings;
                options = options || {};
                if (typeof options === 'string') {
                    container = options;
                    options = {};
                }
                else {
                    container = options.container || 'body';
                }
                settings = $.extend({
                    disable_search_threshold: 10, search_contains: true, no_results_text: '没有找到可选项',
                    allow_single_deselect: true
                }, options);
                var config = {
                    '.chosen-select-fix': settings,
                    '.chosen-select': $.extend({ width: "100%" }, settings)
                }
                $.each(config, function (i, n) {
                    var sel = $(container).find(i);
                    if(sel.length){
                        sel.not(":has(option)").append("<option value=''/>");
                        sel.chosen(n);
                        //兼容bootstrap theme
                        sel.next(".chosen-container").children("a.chosen-single").addClass("form-control");
                        //多选框
                        $.mitools.ui._chosenOpen(sel.filter("[multiple]"));
                    }
                });
            },
            _chosenOpen: function (chosenSelectClass) {
                var chosen = $(chosenSelectClass).chosen().data('chosen');
                if (!chosen)
                    return;
                var autoClose = false,
                    chosen_resultSelect_fn = chosen.result_select;
                chosen.search_contains = true;

                chosen.result_select = function (evt) {
                    var resultHighlight = null;

                    if (autoClose === false) {
                        evt['metaKey'] = true;
                        evt['ctrlKey'] = true;

                        resultHighlight = chosen.result_highlight;
                    }

                    var stext = chosen.get_search_text();

                    var result = chosen_resultSelect_fn.call(chosen, evt);

                    if (autoClose === false && resultHighlight !== null)
                        resultHighlight.addClass('result-selected');

                    this.search_field.val(stext);
                    this.winnow_results();
                    this.search_field_scale();

                    return result;
                };
            },

            validate: function (options) {
                options = options || {};
                options.ignore = options.ignore || ":hidden:not(.chosen-select, .chosen-select-fix, .pier-input)";
                $.mitools.ui.validOptions = $.extend({}, options);
                if (options.ignoreGrid)
                    options.ignore = options.ignore + ", " + options.ignoreGrid;
                return $("form").validate(options);
            },
            valid: function (container) {
                var validator = $("form").validate(), settings = validator.settings;
                if (!$.mitools.ui.validOptions.ignore)
                    $.extend($.mitools.ui.validOptions, settings);
                else
                    $.extend(settings, $.mitools.ui.validOptions);
                if (container)
                    settings.ignore += ", :not(" + container + " *)";
                else if ($.mitools.ui.validOptions.ignoreGrid)
                    settings.ignore = settings.ignore + ", " + settings.ignoreGrid;
                return validator.form();
            },
            validElement: function (element) {
                var validator = $("form").validate();
                return validator.element(element);
            },
            load: function (options) {
                if (!options)
                    return;
                var target = $(options.target);
                if (!target.length)
                    return;
                if (options.ignore && target.html()) {
                    if (options.onSuccess)
                        options.onSuccess(target.html());
                }
                else {
                    $.ajax({
                        url: options.url,
                        data: options.data,
                        type: 'GET',
                        contentType: 'application/json; charset=utf-8',
                        async: true,
                        success: function (result) {
                            //console.log("%s mitools.ui.load success.", $.format.date(new Date(), 'HH:mm:ss.SSS'));
                            if (result) {
                                //解析url querystring
                                if (options.search) {
                                    $.each(options.search, function (i, n) {
                                        $.mitools.queryString[i] = n;
                                    });
                                }
                                //替换所有参数
                                if (options.args) {
                                    $.each(options.args, function (i, n) {
                                        result = result.replace(new RegExp("\\{" + i + "\\}", "g"), n);
                                    });
                                }
                                //console.log("%s mitools.ui.load append...", $.format.date(new Date(), 'HH:mm:ss.SSS'));
                                if (options.append)
                                    target.append(result);
                                else
                                    target.html(result);
                                if (options.onSuccess)
                                    options.onSuccess(result);
                            }
                        },
                        error: function (x, e, msg) {
                            $.mitools.dialog.ShowError(x.status + " " + msg);
                        }
                    });
                }
            },
            catchKey: function(){
                $(document).on("keydown", function (e) {
                    if (e.keyCode == 8 && (!$(e.target).is("input") && !$(e.target).is("textarea") && !$(e.target).prop("contenteditable"))) //backspace
                        return false;
                    //})
                    //.on("keyup", function (e) {
                    if (e.keyCode != 13)
                        return;
                    var $this = $(e.target);
                    if ($this.is("input[fid]") && (!$this.hasClass("ui-autocomplete-input")) ||
                        ($this.hasClass("ui-autocomplete-input") && $this.catcomplete("widget").find("li").length == 0)) {
                        var parent = $this.closest("div[enter-target]");
                        if (parent.length) {
                            parent.find(parent.attr("enter-target")).click();
                            return false;
                        }
                    }
                    if ($this.is("textarea") || $this.is("button") || ($this.attr("autocomplete") && $this.is("input")))
                        return;
                    $.mitools.ui.sendTab(e);
                });

            },
            sendTab: function (e) {
                //转移焦点
                /* FOCUS ELEMENT */
                var inputs = $("form").find(":input:visible"),
                idx = inputs.index(e.target),
                next = null;

                if (idx == inputs.length - 1) {
                    next = inputs[0];
                } else {
                    next = inputs[idx + 1];
                }
                if (next) {
                    window.setTimeout(function () {
                        $(next).focus();
                    }, 1)
                    return false;
                }
            }
        }
    }
    );
    $.mitools.init();
})(jQuery);