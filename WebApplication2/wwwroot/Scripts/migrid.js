/*!
 * migrid v1.3.2
 * Copyright 2013-2014 DT Mip, Inc.
 */
(function ($) {
    $.extend({
        migrid: {
            version: "1.3.2",
            gid: 1
        }
    });

    $.fn.migrid = function (options) {
        if (typeof options === 'string') {
            var fn = $.migrid[options];
            if (!fn) {
                throw ("migrid - No such method: " + options);
            }
            var args = $.makeArray(arguments).slice(1);
            return fn.apply(this, args);
        }
        return this.each(function () {
            $.migrid.init.call(this, options);
        });
    };

    $.extend($.migrid, {
        init: function (options) {
            if (!$.isPlainObject(options))
                return;
            if (this.migrid)
                return;
            var obj = this, currentId = null,
                $grid = $(this),
                getSels = function () {
                    var sels = [];
                    if (settings.multiselect)
                        sels = $grid.jqGrid('getGridParam', 'selarrrow');
                    else
                        sels = [$grid.jqGrid('getGridParam', 'selrow')];
                    return sels;
                },
                getPierValues = function () {
                    if (!settings.pier)
                        return [];
                    var sels = getSels(),
                    vals = $.map(sels, function (n) {
                        var row = $grid.jqGrid('getRowData', n);
                        return $.map(settings.pier.values, function (n) {
                            return row[n];
                        }).join(":");
                    });
                    return vals;
                },
                settings = $.extend(
                {
                    datatype: 'json',
                    url: $.mitools.path + '/unis/Grid/Data',
                    mtype: 'GET',
                    rowNum: 15,
                    rowList: [15, 30, 60],
                    viewrecords: true,
                    gridview: true,
                    //caption: 'My first grid',
                    //autowidth: true,
                    //width: "auto",
                    height: "auto",
                    "grouping": false,
                    caption: "",
                    hidegrid: false,
                    //groupingView: null,
                    multiselect: false,
                    altRows: true,
                    styleUI: 'Bootstrap',

                    //treeGrid: false,
                    //treeGridModel: "adjacency",
                    //ExpandColumn: null,
                    minMinusHeight: null,
                    hideHeader: false,
                    buttonselector: "",
                    loadComplete: function (data) {
                        //currentRow = null;
                        currentId = null;
                        $(settings.buttonselector).filter(".js-select").toggleClass("hide", true);
                        $(settings.buttonselector).filter("[action=export]").toggleClass("hide", !data || data.rows.length == 0);
                        if (editOptions.container && editOptions.toggle) {
                            if ($(editOptions.container).hasClass("in"))
                                $(editOptions.container).collapse('hide');
                        }
                        if (settings.pier) {
                            //设置选中行
                            if (obj.selections) {
                                $.each(obj.selections, function (i, n) {
                                    $grid.jqGrid("setSelection", n, false);
                                });
                                $.mitools.data.SetValue($(settings.pier.input), getPierValues());
                            }
                        }
                        resizeGrid();
                        if (settings.onLoaded)
                            settings.onLoaded(data);
                    },
                    ajaxGridOptions: null,
                    onSelectRow: function (rowid, status, e) {
                        if (!settings.multiselect)
                            status = true;
                        if (status)
                            currentId = rowid;
                        else
                            currentId = null;
                        $(settings.buttonselector).filter(".js-select").toggleClass("hide", !status);
                        if (settings.multiselect)
                            $(settings.buttonselector).filter("[action=deleteall]").toggleClass("hide", !status);
                        if (settings.pier) {
                            $.mitools.data.SetValue($(settings.pier.input), getPierValues());
                        }
                        if (status && settings.stateCol) {
                            var rowData = $grid.jqGrid("getRowData", rowid);
                            if (rowData[settings.stateCol] == '0') {
                                $(".js-ope-enable").show();
                                $(".js-ope-disable").hide();
                            } else {
                                $(".js-ope-disable").show();
                                $(".js-ope-enable").hide();
                            }
                        }
                        if (settings.onRowSelected)
                            settings.onRowSelected(rowid, status, e);
                    },
                    onSelectAll: function (aRowids, status) {
                        if (settings.multiselect)
                            $(settings.buttonselector).filter("[action=deleteall]").toggleClass("hide", !status);
                        if (settings.pier) {
                            $.mitools.data.SetValue($(settings.pier.input), getPierValues());
                        }
                        if (settings.onAllSelected)
                            settings.onAllSelected(aRowids, status);
                    },
                    ondblClickRow: function (rowid, iRow, iCol, e) {
                        currentId = rowid;
                        doOpe('edit', rowid);
                        if (settings.onRowDblClicked)
                            settings.onRowDblClicked(rowid, iRow, iCol, e);
                    }
                }, options),
                gridParent = options.container ? $(options.container) : $grid.parent();
            settings.sqltype = settings.sqltype || (settings.postData || {}).type;
            settings.sqlpath = settings.sqlpath || (settings.postData || {}).path;
            var editOptions = {};
            if ($.isFunction(settings.editUrl)) {
                editOptions.func = settings.editUrl;
            }
            else if ($.isPlainObject(settings.editUrl)) {
                editOptions = settings.editUrl;
            }
            else
                editOptions.url = settings.editUrl;
            var resizeGrid = function () {
                $grid.jqGrid('setGridWidth', gridParent.width());
                if (settings.minMinusHeight || settings.maxHeight) {
                    var maxHeight = 0, currentHeight = gridParent.find(".ui-jqgrid").height(),
                        contentBox = gridParent.find(".ui-jqgrid-bdiv"),
                        contentTable = contentBox.find(".ui-jqgrid-btable"),
                        outerHeight = currentHeight - contentBox.height();
                    if (settings.minMinusHeight)
                        maxHeight = $(window).height() - settings.minMinusHeight;
                    else
                        maxHeight = settings.maxHeight;
                    if ((contentTable.height() + outerHeight) > maxHeight)
                        $grid.jqGrid("setGridHeight", maxHeight);
                    else
                        $grid.jqGrid("setGridHeight", "auto");
                }
                else if (settings.minusHeight)
                    $grid.jqGrid("setGridHeight", ($(window).height() - settings.minusHeight));

            }
            $grid.jqGrid($.extend({}, settings));
            $.each(settings.colModel, function (i, n) {
                if (n.align) {
                    $("#" + $grid.attr("id") + "_" + n.name).addClass("text-" + n.align);
                }
            });
            if (settings.headerGrouping) {
                $grid.setGroupHeaders(settings.headerGrouping);
            }
            if (settings.hideHeader) {
                gridParent.find("div.ui-jqgrid-hdiv").addClass("hide");
            }
            if (!settings.width)
                resizeGrid();
            $(window).resize(resizeGrid);
            this.gid = $.migrid.gid++;
            this.migrid = true;
            this.resizeGrid = resizeGrid;
            $grid.on("click", ".btn", function (e) {
                doOpe($(this).attr("action"), $(this).attr("rid"), e);
                return false;
            });
            $(settings.buttonselector).click(function (e) {
                doOpe($(this).attr("action"), currentId, e);
                return false;
            });
            var reloadGrid = function () {
                if (settings.pier)
                    obj.selections = getSels();
                $grid.trigger('reloadGrid');
            },
            doOpe = function (ope, id, e) {
                if (settings.operation && $.isFunction(settings.operation)) {
                    if (settings.operation(ope, id, e))
                        return false;
                }
                switch (ope) {
                    case "add":
                        doEdit(ope, null, null);
                        break;
                    case "refresh":
                        $grid.jqGrid("setGridParam", {
                            url: settings.url || ($.mitools.path + '/unis/Grid/Data'),
                            postData: $.extend({}, settings.postData, { filters: JSON.stringify({ groupOp: "AND", rules: [] }) }),
                            page: 1
                        }, true);
                        reloadGrid();
                        //复位查询条件
                        $.mitools.data.SetLine(settings.containerQuery, null);
                        break;
                    case "edit":
                        var row = $grid.jqGrid("getRowData", id);
                        doEdit(ope, id, row);
                        break;
                    case "delete":
                        if (id != null && id != "")
                            DoDelete(ope, id);
                        break;
                    case "deleteall":
                        DoDelete(ope);
                        break;
                    case "query":
                        DoQuery();
                        break;
                    case "search":
                        DoSearch();
                        break;
                    case "export":
                        DoExport();
                        break
                    case "copy":
                        var row = $grid.jqGrid("getRowData", id);
                        doEdit(ope, id, row);
                        break;
                    case "enable":
                        if (editOptions.func)
                            editOptions.func(ope, id);
                        else
                            updateState("1", id);
                        break;
                    case "disable":
                        if (editOptions.func)
                            editOptions.func(ope, id);
                        else
                            updateState("0", id);
                        break;
                    case "chooser":
                        DoChooser();
                        break;
                    case "view":
                        ShowView();
                        break;
                    case "view_delete":
                        viewDelete();
                        break;
                    case "view_save":
                        viewSave();
                        break;
                    case "view_select":
                        viewSelect();
                        break;

                }
                if (settings.onOpe && $.isFunction(settings.onOpe)) {
                    settings.onOpe(ope, id, e);
                }
                return false;
            },
            getSelectedKeys = function () {
                var sels = $grid.jqGrid('getGridParam', 'selarrrow');
                if (sels) {
                    return $.map(
                    sels,
                    function (node) {
                        return getId(node);
                    });
                }
                else
                    return [];
            },

            getId = function (id, row) {
                if (settings.keycols) {
                    if (!row)
                        row = $grid.jqGrid('getRowData', id);
                    if ($.isArray(settings.keycols)) {
                        return $.map(settings.keycols, function (n) {
                            return row[n];
                        }).join(":");
                    }
                    else
                        return row[settings.keycols];
                }
                else
                    return id;
            },
            DoDelete = function (ope, id) {
                var dataSet = { "old": {}, "new": {} }, type = settings.sqltype, row = null, ids0, ids1 = [], notice;
                switch (ope) {
                    case "delete":
                        row = $grid.jqGrid("getRowData", id);
                        dataSet["new"].id = getId(id, row);
                        if (row["deletable"] && row["deletable"].toLowerCase() == "false") {
                            $.mitools.dialog.ShowError("当前记录不允许删除");
                            return;
                        }
                        else
                            dataSet["old"] = row;
                        notice = "您确认删除当前一条记录吗？";
                        break;
                    case "deleteall":
                        ids0 = getSelectedKeys();
                        if (ids0.length == 0)
                            return;
                        $.each(ids0, function (i, id) {
                            row = $grid.jqGrid("getRowData", id.split(":")[0]);
                            if (!row["deletable"] || row["deletable"].toLowerCase() != "false") {
                                ids1.push(id);
                            }
                        });
                        if (ids1.length == 0) {
                            $.mitools.dialog.ShowError("当前选中的" + ids0.length + "条记录不允许删除");
                            return;
                        }
                        dataSet["new"].id = ids1;
                        ope = "delete";
                        if (ids1.length == ids0.length)
                            notice = "您确认要删除选中的" + ids1.length + "条记录吗？";
                        else
                            notice = "当前选中" + ids0.length + "条记录，允许删除" + ids1.length + "条记录，确定要删除吗？";
                        break;
                    default:
                        return;
                }
                $.mitools.dialog.ShowConfirm("删除记录", notice, function () {
                    $.mitools.data.PostCommand((settings.dataUrl || ($.mitools.path + '/unis/Data')) + '?' + $.param({
                        type: type,
                        key: ope,
                        path: settings.sqlpath,
                        t: new Date().valueOf()
                    }),
                    dataSet,
                    function (result) {
                        if (result != null && result.Code == 0) {
                            $.mitools.dialog.ShowInfo("记录已删除");
                            reloadGrid();
                            if (settings.onDeleted && $.isFunction(settings.onDeleted))
                                settings.onDeleted(ope, id, result);
                        }
                        else {
                            $.mitools.dialog.ShowError(result.Cause);
                        }
                    });
                });
            },
            DoQuery = function () {
                //var canpost = $(".form-actions").valid();
                if (!$.mitools.ui.valid(settings.containerQuery))
                    return;
                var dataSet = $.mitools.data.BuildInputValue(settings.containerQuery), valid = false;
                //$.each(dataSet, function (i, n) {
                //    if (n != null && n != "") {
                //        valid = true;
                //        return false;
                //    }
                //});
                //if (!valid)
                //    $.mitools.dialog.ShowError("至少输入一个查询值!");
                //else {
                dataSet.filters = JSON.stringify({ groupOp: "AND", rules: [] });
                $grid.jqGrid("setGridParam", {
                    url: settings.url || ($.mitools.path + '/unis/Grid/Data'),
                    datatype: "json",
                    postData: $.extend({ type: settings.sqltype, key: "query", path: settings.sqlpath }, dataSet),
                    page: 1
                }).trigger("reloadGrid");
                //}
            },
            DoSearch = function () {
                $grid.jqGrid('searchGrid',
                    {
                        sopt: ['cn', 'bw', 'eq', 'ne', 'lt', 'gt', 'ew'],
                        multipleSearch: true, multipleGroup: true,
                        searchOnEnter: true, closeOnEscape: true,
                        //overlay: 0,
                        afterShowSearch: function () {
                            var sbox = "#fbox_" + $.jgrid.jqID(this.p.id),
                                i = 0, len = 2 - $(sbox + ' table.group tr:has(td.columns)').length;
                            for (i = 0; i < len; i++) {
                                $(sbox + ' input.add-rule:first').click();
                            }
                        }
                    }
                );
            },

            DoExport1 = function () {
                var url = (settings.dataUrl || ($.mitools.path + "/unis/Data")) + "/Export?" + "t=" + new Date().valueOf(),
                postData = $.extend({}, $grid.jqGrid("getGridParam", "postData")),
                colData = [];
                $.each(settings.colModel, function (i, n) {
                    colData.push(n.hidden ? null : settings.colNames[i] || "_");
                });
                postData._cols = colData.join("\t");
                if (settings.multiselect) {
                    var selects = getSelectedKeys();
                    if (selects.length > 0) {
                        postData._selects = selects.join("\t");
                        if (settings.keycols) {
                            if ($.isArray(settings.keycols))
                                postData._keycols = settings.keycols.join("\t");
                            else
                                postData._keycols = settings.keycols;
                        }
                    }
                    else
                        postData._selects = null;
                }
                var iframe = $("<iframe style='display:none'/>").appendTo(document.body).attr("src", url + (url.indexOf("?") >= 0 ? "&" : "?") + $.param(postData));
            },

            DoExport = function () {
                var url = (settings.dataUrl || ($.mitools.path + "/unis/Data")) + "/Export?" + "t=" + new Date().valueOf(),
                urlData = $.extend({}, $grid.jqGrid("getGridParam", "postData")),
                colData = [], postData = $.extend({}, urlData);
                $.each(settings.colModel, function (i, n) {
                    colData.push(n.hidden ? null : n.label || settings.colNames[i] || "_");
                });
                postData._cols = colData.join("\t");
                if (settings.multiselect) {
                    var selects = getSelectedKeys();
                    if (selects.length > 0) {
                        postData._selects = selects.join("\t");
                        if (settings.keycols) {
                            if ($.isArray(settings.keycols))
                                postData._keycols = settings.keycols.join("\t");
                            else
                                postData._keycols = settings.keycols;
                        }
                    }
                    else
                        postData._selects = null;
                }
                postData.headerGrouping = JSON.stringify(settings.headerGrouping);
                var $form = $('<form action="' + url + '" method="post"></form>');
                jQuery.each(postData, function (i, n) {
                    $('<input type="hidden" name="' + i + '" />').val(n).appendTo($form);
                });
                //send request
                $form.appendTo(document.body).submit().remove();
            },

            updateState = function (state, id) {
                var data = { "id": getId(id) };
                data[settings.stateCol || "state"] = state;
                $.mitools.data.PostCommand(
                    (settings.dataUrl || ($.mitools.path + '/unis/Data')) + '?' + $.param({ type: settings.sqltype, key: "upstate", path: settings.sqlpath }) + '&t=' + new Date().valueOf(),
                    { old: null, "new": data },
                    function (result) {
                        if (result != null && result.Code == 0) {
                            $grid.trigger("reloadGrid");
                        }
                        else {
                            $.mitools.dialog.ShowError(result.Cause);
                        }
                    });
            },
            doEdit = function (ope, id, row) {
                $grid.data("currentId", id);
                if (ope == "edit") {
                    $grid.data("editingRow", row);
                    if (row["editable"] && row["editable"].toLowerCase() == "false") {
                        $.mitools.dialog.ShowError("当前记录不允许编辑");
                        return;
                    }
                }
                if (editOptions.func)
                    editOptions.func(ope, id, row);
                var show = false;
                if (editOptions.toggle) {
                    if ($grid.data("lastid") != id) {
                        $(editOptions.container).collapse('show');
                        $grid.data("lastid", id);
                        show = true;
                    }
                    else {
                        show = !$(editOptions.container).hasClass("in");
                        $(editOptions.container).collapse('toggle');
                    }
                }
                if (editOptions.container) {
                    var rowSet = row;
                    if (ope == 'copy') {
                        if (settings.keycols) {
                            if ($.isArray(settings.keycols))
                                $.each(settings.keycols, function (i, n) {
                                    rowSet[n] = "";
                                })
                            else
                                rowSet[settings.keycols] = "";
                        }
                        else
                            rowSet[settings.colModel[0]["index"]] = "";
                    }
                    if (!editOptions.toggle || show)
                        $.mitools.data.SetLine(editOptions.container, rowSet);
                }
                if (editOptions.url) {
                    var url = editOptions.url;
                    switch (ope) {
                        case 'edit':
                            url += (url.indexOf("?") >= 0 ? "&" : "?") + $.param({ rid: getId(id, row) });
                            break;
                        case "copy":
                            url += (url.indexOf("?") >= 0 ? "&" : "?") + $.param({ rid: getId(id, row), type: "copy" });
                            break;
                    }
                    if (editOptions.target)
                        window.open(url, editOptions.target);
                    else
                        window.location.href = url;
                }
                if (editOptions.onEdit) {
                    editOptions.onEdit(ope, id, row);
                }
            },
            DoChooser = function () {
                $grid.jqGrid("columnChooser", {
                    width: 500,
                    height: 400,
                    msel_opts: { dividerLocation: 0.5 },
                    done: function (perm) {
                        if (perm) {
                            $grid.data("chooser", true);
                            $grid.jqGrid("remapColumns", perm, true)
                        }
                    }
                });
            },
            viewModal = null,
            ShowView = function () {
                if (!viewModal) {
                    viewModal = $('<div class="modal fade" role="dialog" data-backdrop="false">' +
            '<div class="modal-dialog modal-md">' +
                '<div class="modal-content">' +
                    '<div class="modal-header">' +
                        '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">关闭</span></button>' +
                        '<h4 class="modal-title">选择视图</h4>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        '<div class="box-block form-horizontal" role="form">' +
                            '<div class="form-group">' +
                                '<label class="sr-only" for="">选择视图</label>' +
                                '<div class="col-sm-10">' +
                                    '<select class="chosen-select form-control" data-placeholder="选择视图" fid="viewlist">' +
                                    '</select>' +
                                '</div>' +
                                '<div class="col-sm-2">' +
                                    '<button class="btn btn-default" action="view_delete" title="删除当前视图" disabled>' +
                                        '<i class="icon-close"></i>删除' +
                                    '</button>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group js-view-edit collapse">' +
                                '<label class="sr-only" for="">视图名称</label>' +
                                '<div class="col-sm-10">' +
                                    '<input class="form-control required" type="text" name="viewname_' + obj.gid + '" placeholder="视图名称" fid="viewname" required />' +
                                '</div>' +
                                '<div class="col-sm-2">' +
                                    '<button class="btn btn-default" action="view_save">' +
                                        '保存</button>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '<div class="modal-footer">' +
                    '<button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>' +
                '</div>' +
            '</div>' +
            '<!-- /.modal-content -->' +
        '</div>' +
            '<!-- /.modal-dialog -->' +
        '</div>').appendTo("form");
                    //注册事件
                    viewModal.on("click", ".btn[action]", function (e) {
                        doOpe($(this).attr("action"), "", e);
                        return false;
                    });
                    viewModal.data("list", viewModal.find("select"));
                    viewModal.on("change", "select", function (e) {
                        viewChange($(this).val(), e);
                        return false;
                    });
                    $.mitools.ui.initChosen(viewModal);
                    viewReload();
                    viewModal.data("input", viewModal.find("input[fid='viewname']"));
                    viewModal.data("editdiv", viewModal.find("div.js-view-edit"));
                    viewModal.data("delete", viewModal.find(".btn[action='view_delete']"));
                }
                viewModal.modal("show");
            },
            viewReload = function (v) {
                var $obj = viewModal.find("select").html("");
                $.mitools.data.LoadListData($obj, {
                    type: "view",
                    key: "droplist",
                    rid: settings.viewtype
                }, null, null, function (result) {
                    $obj.append("<option value='_create'>创建视图...</option>");
                    if (v) {
                        $obj.val(v)
                    }
                    else {
                        viewModal.data("delete").prop("disabled", true);
                    }
                    $obj.trigger("chosen:updated").trigger("change");
                    if (viewModal.data("editdiv").hasClass("in"))
                        viewModal.data("editdiv").collapse('hide');
                });
            },
            viewChange = function (id, e) {
                if (id == '_create') {
                    viewModal.data("input").val("");
                    viewModal.data("editdiv").collapse('show');
                    viewModal.data("delete").prop("disabled", true);
                    return;
                }
                if (!id) {
                    viewModal.data("delete").prop("disabled", true);
                    return;
                }
                if (viewModal.data("editdiv").hasClass("in"))
                    viewModal.data("editdiv").collapse('hide');
                viewModal.data("delete").prop("disabled", false);
                var ret = null, result = $.mitools.data.LoadDatas({ type: "view", key: "select", id: id });
                if (result != null) {
                    if ($.isArray(result))
                        ret = result[0];
                    else
                        ret = result;
                    $.mitools.data.SetLine(settings.containerQuery, JSON.parse(ret.condition));
                    //设置列
                    if (ret.permu) {
                        var permu = JSON.parse(ret.permu);
                        if (permu) {
                            var remap = [];
                            $.each($grid.jqGrid("getGridParam", "colModel"), function (i, n) {
                                remap.push(permu[this.name].i);
                                if (!permu[this.name].h) {
                                    $grid.jqGrid("showCol", this.name);
                                } else {
                                    $grid.jqGrid("hideCol", this.name);
                                }
                            });
                            $grid.jqGrid("remapColumns", remap);
                        }
                    }
                }
            },
            viewDelete = function () {
                $.mitools.dialog.ShowConfirm("删除视图", "您确认要删除视图 " + viewModal.data("list").find("option:selected").text() + " 吗？", function () {
                    var dataSet = {
                        "old": null, "new": {
                            id: viewModal.data("list").val()
                        }
                    }, type = "view";
                    $.mitools.data.PostCommand($.mitools.path + '/unis/Data?' + $.param({
                        type: "view",
                        key: "delete"
                    }) + '&t=' + new Date().valueOf(),
                    dataSet,
                    function (result) {
                        if (result != null && result.Code == 0) {
                            $.mitools.dialog.ShowInfo("视图已经已删除");
                            viewReload();
                        }
                        else {
                            $.mitools.dialog.ShowError(result.Cause);
                        }
                    });
                });
            },
            viewSave = function () {
                //var validator = $("form").validate();
                //if (!validator.element("input[fid='viewname']"))
                if (!$.mitools.ui.valid(".modal.in"))
                    return;
                var val = viewModal.data("input").val(),
                    condition = $.mitools.data.BuildInputValue(settings.containerQuery);
                var colModel = {};
                $.each($grid.jqGrid("getGridParam", "colModel"), function (i, n) {
                    colModel[this.name] = { i: i, h: this.hidden };
                });
                $.mitools.data.PostCommand(
                    $.mitools.path + '/unis/Data?' + $.param({
                        type: "view",
                        key: "insert"
                    }) + '&t=' + new Date().valueOf(),
                    {
                        old: null, "new": {
                            viewname: val,
                            condition: JSON.stringify(condition),
                            type: settings.viewtype,
                            permu: JSON.stringify(colModel)
                        }
                    },
                    function (result) {
                        if (result != null && result.Code == 0) {
                            viewReload(result.Data[0].viewid);
                            $.mitools.dialog.ShowInfo("保存成功");
                        }
                        else {
                            $.mitools.dialog.ShowError(result.Cause);
                        }
                    });
            };
            obj.doDelete = function (id) { doOpe("delete", id) };
            obj.doOpe = doOpe;
            obj.reloadGrid = reloadGrid;
        },
        GridUnload: function (o) {
            if (!this.migrid)
                return;
            this.migrid = false;
            $(this).jqGrid('GridUnload');
        }

    });

    $.extend($.fn.jqGrid, {
        setGridWidth: function (nwidth, shrink) {
            return this.each(function () {
                if (!this.grid) { return; }
                var $t = this, cw,
                initwidth = 0, brd = $.jgrid.cell_width ? 0 : $t.p.cellLayout, lvc, vc = 0, hs = false, scw = $t.p.scrollOffset, aw, gw = 0, cr, bstw = $t.p.styleUI === 'Bootstrap' ? 0 : 0;
                if (typeof shrink !== 'boolean') {
                    shrink = $t.p.shrinkToFit;
                }
                if (isNaN(nwidth)) { return; }
                nwidth = parseInt(nwidth, 10);
                $t.grid.width = $t.p.width = nwidth;
                $("#gbox_" + $.jgrid.jqID($t.p.id)).css("width", nwidth + "px");
                $("#gview_" + $.jgrid.jqID($t.p.id)).css("width", nwidth + "px");
                $($t.grid.bDiv).css("width", (nwidth - bstw) + "px");
                $($t.grid.hDiv).css("width", (nwidth - bstw) + "px");
                if ($t.p.pager) {
                    $($t.p.pager).css("width", nwidth + "px");
                }
                if ($t.p.toppager) {
                    $($t.p.toppager).css("width", (nwidth - bstw) + "px");
                }
                if ($t.p.toolbar[0] === true) {
                    $($t.grid.uDiv).css("width", (nwidth - bstw) + "px");
                    if ($t.p.toolbar[1] === "both") { $($t.grid.ubDiv).css("width", (nwidth - bstw) + "px"); }
                }
                if ($t.p.footerrow) {
                    $($t.grid.sDiv).css("width", (nwidth - bstw) + "px");
                }
                if (shrink === false && $t.p.forceFit === true) { $t.p.forceFit = false; }
                if (shrink === true) {
                    $.each($t.p.colModel, function () {
                        if (this.hidden === false) {
                            cw = this.widthOrg;
                            initwidth += cw + brd;
                            if (this.fixed) {
                                gw += cw + brd;
                            } else {
                                vc++;
                            }
                        }
                    });
                    if (vc === 0) { return; }
                    $t.p.tblwidth = initwidth;
                    var rb = 2; //右侧留白，防止左右滚动条
                    aw = nwidth - brd * vc - gw - rb;
                    if (!isNaN($t.p.height)) {
                        if ($($t.grid.bDiv)[0].clientHeight < $($t.grid.bDiv)[0].scrollHeight || $t.rows.length === 1) {
                            hs = true;
                            aw -= scw;
                        }
                    }
                    initwidth = 0;
                    var cle = $t.grid.cols.length > 0;
                    $.each($t.p.colModel, function (i) {
                        if (this.hidden === false && !this.fixed) {
                            cw = this.widthOrg;
                            cw = Math.round(aw * cw / ($t.p.tblwidth - brd * vc - gw));
                            if (cw < 0) { return; }
                            this.width = cw;
                            initwidth += cw;
                            $t.grid.headers[i].width = cw;
                            $t.grid.headers[i].el.style.width = cw + "px";
                            if ($t.p.footerrow) { $t.grid.footers[i].style.width = cw + "px"; }
                            if (cle) { $t.grid.cols[i].style.width = cw + "px"; }
                            lvc = i;
                        }
                    });

                    if (!lvc) { return; }

                    cr = 0;
                    if (hs) {
                        if (nwidth - gw - (initwidth + brd * vc) - rb !== scw) {
                            cr = nwidth - gw - (initwidth + brd * vc) - rb - scw;
                        }
                    } else if (Math.abs(nwidth - gw - (initwidth + brd * vc) - rb) !== 1) {
                        cr = nwidth - gw - (initwidth + brd * vc) - rb;
                    }
                    $t.p.colModel[lvc].width += cr;
                    $t.p.tblwidth = initwidth + cr + brd * vc + gw;
                    if ($t.p.tblwidth > nwidth) {
                        var delta = $t.p.tblwidth - parseInt(nwidth, 10);
                        $t.p.tblwidth = nwidth;
                        cw = $t.p.colModel[lvc].width = $t.p.colModel[lvc].width - delta;
                    } else {
                        cw = $t.p.colModel[lvc].width;
                    }
                    $t.grid.headers[lvc].width = cw;
                    $t.grid.headers[lvc].el.style.width = cw + "px";
                    if (cle) { $t.grid.cols[lvc].style.width = cw + "px"; }
                    if ($t.p.footerrow) {
                        $t.grid.footers[lvc].style.width = cw + "px";
                    }
                }
                if ($t.p.tblwidth) {
                    $('table:first', $t.grid.bDiv).css("width", $t.p.tblwidth + "px");
                    $('table:first', $t.grid.hDiv).css("width", $t.p.tblwidth + "px");
                    $t.grid.hDiv.scrollLeft = $t.grid.bDiv.scrollLeft;
                    if ($t.p.footerrow) {
                        $('table:first', $t.grid.sDiv).css("width", $t.p.tblwidth + "px");
                    }
                }
            });
        },
    });
})(jQuery);
