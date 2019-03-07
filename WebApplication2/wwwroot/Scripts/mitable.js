(function ($) {
    $.extend({
        mitable: {
            version: "1.0.1",
            gid: 1
        }
    });

    $.fn.mitable = function (options) {
        if (typeof options === 'string') {
            var fn = $.fn.mitable[options];
            if (!fn) {
                throw ("miTable - No such method: " + options);
            }
            var args = $.makeArray(arguments).slice(1);
            return fn.apply(this, args);
        }
        return this.each(function () {
            if (this.table)
                return;
            var settings = $.extend(
            {
                tree: false,
                columns: [],
                data: [],
                url: '',
                onComplete: null,
                groupIn: null,
                _icons: {
                    expanded: "icon-arrow-down5",
                    collapsed: "icon-uniE6F6"
                },
                onError: null
            }, options);
            if (this.tagName.toUpperCase() != 'TABLE') {
                alert("mitable Element is not a table");
                return;
            }
            $(this).empty().addClass("mitable");
            var lenCols = settings.columns.length, colSpan = lenCols;
            if (lenCols == 0) {
                alert("mitable columns is null");
                return;
            }
            this.p = settings;
            if (settings.onComplete) {
                $(this).bind("onComplete", settings.onComplete);
            }
            if (settings.onError) {
                $(this).bind("onError", settings.onError);
            }
            //构建thead
            var colgroup = "<colgroup>";
            var thead = "<thead><tr>";
            for (var i = 0; i < lenCols; i++) {
                var col = "<col class='grid-cell' style='";
                var th = "<th";
                var cd = settings.columns[i];
                if (cd.width)
                    col += "width:" + cd.width + ";";
                if (cd.align)
                    col += "text-align:" + cd.align + ";";
                if (typeof (cd.hidden) != undefined && cd.hidden == true) {
                    var exts = "display:none;";
                    col += exts;
                    cd._exts = exts;
                    th += " style='" + exts + "'";
                    colSpan--;
                }
                th += ">" + (cd.name || cd.id);
                col += "'></col>";
                th += "</th>";
                colgroup += col;
                thead += th;
            }
            colgroup += "</colgroup>";
            thead += "</tr></thead>";
            $(this).append(colgroup);
            $(this).append(thead);

            var tbody = $("<tbody></tbody>");
            tbody.appendTo(this);
            this.table = true;
            var obj = this,
            posGroup = lenCols,
            posLevel = posGroup + 1,
            posLeaf = posLevel + 1,
            posExpanded = posLeaf + 1,
            posLoaded = posExpanded + 1,
            posRowId = posLoaded + 1,
            getColPos = function (id) {
                for (var i = 0; i < lenCols; i++) {
                    if (settings.columns[i].id == id)
                        return i;
                }
                return -1;
            },

            posId = getColPos("id"),
            lastCollapsedLevel = -1,

            getChildren = function (row) {
                var result = [],
                begin = false;
                for (var i = 0; i < settings.data.length; i++) {
                    if (begin) {
                        if (settings.data[i][posLevel] > row[posLevel])
                            result.push(settings.data[i]);
                        else
                            break;
                    }
                    if (settings.data[i] == row) {
                        begin = true;
                    }
                }
                return result;
            },
            setCellData = function (rowid, row, pos) {
                var val;
                if ($.isFunction(settings.columns[pos].formatter)) {
                    val = settings.columns[pos].formatter(rowid, row, pos, settings.columns[pos]);
                }
                else
                    val = row[pos];
                return val;
            },
            getRow = function (id) {
                if (settings.data == null || settings.data.length == 0)
                    return;
                for (var i = 0; i < settings.data.length; i++) {
                    if (settings.data[i][posId] == id)
                        return settings.data[i];
                }
                return null;
            },
            addRowData = function (row) {
                if (!$.isArray(row))
                    return;
                //[a,b,c,...,isgrouphead,level,isleaf,expanded,loaded]
                var sep, tr, td, rowid
                id = row[posId],
                rowid = "_mitrid_" + $.mitable.gid++;
                row.push(rowid);
                if (row[posGroup] !== undefined && (row[posGroup] == 'true' || row[posGroup] === true)) {
                    //检查group行
                    sep = "<tr class='sep-row'><td colspan='" + colSpan + "'></td></tr>";
                    tbody.append(sep);
                    tr = $('<tr class="group-hd" id="' + rowid + '" name="' + id + '"></tr>');
                    tr.appendTo(tbody);
                    td = $('<td colspan="' + colSpan + '"></td>');
                    td.appendTo(tr);
                    if (settings.groupIn && $.isFunction(settings.groupIn))
                        td.append(settings.groupIn(rowid, row));
                    else
                        td.html(id);
                }
                else {
                    tr = $('<tr id="' + rowid + '" name="' + id + '"></tr>');
                    tr.appendTo(tbody);
                    for (var i = 0; i < lenCols; i++) {
                        var val = setCellData(rowid, row, i),
                        tree = "",
                        c = "";
                        if (settings.columns[i].treecol == true
                        && $.isNumeric(row[posLevel])) {
                            var icon = "", level = parseInt(row[posLevel]), collapsed = false;
                            if (row[posLeaf] == 'true' || row[posLeaf] == true)
                                icon = "icon-dot";
                            else {
                                icon = "treeclick ";
                                if (row[posExpanded] == 'true' || row[posExpanded] == true) {
                                    row[posExpanded] = true;
                                    icon += settings._icons["expanded"];
                                } else {
                                    collapsed = true;
                                    row[posExpanded] = false;
                                    icon += settings._icons["collapsed"]
                                }
                            }
                            if (lastCollapsedLevel >= 0 && level > lastCollapsedLevel)
                                tr.css("display", "none");
                            else if (collapsed)
                                lastCollapsedLevel = level;
                            else
                                lastCollapsedLevel = -1;
                            tree = "<div style='width:" + (10 + parseInt(row[posLevel]) * 18) + "px;' class='tree-wrap'><span class='tree-icon " + icon + "'></span></div>";
                            c = "tree-col";
                        }
                        td = $("<td>" + tree + "</td>");
                        td.append(val);
                        if (c != "") {
                            td.addClass(c);
                            td.find(".treeclick").bind("click", function (e) {
                                var src = e.target || e.srcElement,
                                children = getChildren(row);
                                if (row[posExpanded] == true) {
                                    row[posExpanded] = false;
                                    $(src).removeClass(settings._icons["expanded"]).addClass(settings._icons["collapsed"]);
                                    $.each(children, function (j, r) {
                                        $(obj.rows[r[posRowId]]).css("display", "none");
                                    });
                                }
                                else {
                                    row[posExpanded] = true;
                                    $(src).removeClass(settings._icons["collapsed"]).addClass(settings._icons["expanded"]);
                                    $.each(children, function (j, r) {
                                        $(obj.rows[r[posRowId]]).css("display", "");
                                    });
                                }
                            });
                        }
                        if (settings.columns[i]._exts)
                            td.attr("style", settings.columns[i]._exts);
                        td.appendTo(tr);
                    }
                }
            },
            addData = function (data) {
                if (!$.isArray(data))
                    return;
                var len = data.length;
                for (var i = 0; i < len; i++) {
                    addRowData(data[i]);
                }
            },
            setData = function (data, init) {
                if (!$.isArray(data))
                    return;
                if (settings.data != null && (typeof init == "undefined" || init != true)) {
                    //检查expanded信息
                    for (var i = 0; i < data.length; i++) {
                        var row = data[i];
                        var rowOld = getRow(row[posId]);
                        if (rowOld != null)
                            row[posExpanded] = rowOld[posExpanded];
                    }
                }
                lastCollapsedLevel = -1;
                settings.data = data;
                tbody.empty();
                addData(data);
            },
            setRowData = function (rowid, colid, data) {
                var row = $("#" + rowid);
                if (row.length == 0)
                    return;
                var pos = getColPos(colid);
                if (pos >= 0)
                    row[0].cells[pos].innerHTML = data;
            },
            setUrl = function (url) {
                if (url && url != "") {
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8',
                        async: true,
                        success: function (data, st, xhr) {
                            setTimeout(function () {
                                setData(data);
                                $(obj).triggerHandler("onComplete", [data]);
                            }, 1);
                        },
                        error: function (xhr, st, err) {
                            setTimeout(function () {
                                $(obj).triggerHandler("onError", [xhr, st, err]);
                            }, 1);
                        }
                    });
                }
            },
            reloadData = function () {
                setUrl(settings.url);
            };
            $(this).bind("reloadData", reloadData);
            if (settings.url && settings.url != "") {
                settings.data = null;
                setUrl(settings.url);
            }
            else {
                setData(settings.data, true);
            }
            obj.setData = setData;
            obj.addData = addData;
            obj.addRowData = addRowData;
            obj.setRowData = setRowData;
            obj.reloadData = reloadData;
        });
    };

    $.extend($.fn.mitable, {
        getTableParam: function (pName) {
            var t = this[0];
            if (!t || !t.table) { return; }
            if (!pName) { return t.p; }
            return t.p[pName] !== undefined ? t.p[pName] : null;
        },
        setTableParam: function (newParams) {
            return this.each(function () {
                if (this.table && typeof newParams === 'object') { $.extend(true, this.p, newParams); }
            });
        }
    });

})(jQuery);
