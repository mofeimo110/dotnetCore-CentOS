        $.fn.isChildAndSelfOf = function (b) {
            return (this.closest(b).length > 0);
        };
        $.widget("custom.droptree", {
            options: {
                separator: ',',
                stopOnParents: false,
                onSelect: function () {
                    var self = this;
                    if (self.options.checkbox) {
                        var element = this.divTree.element,
                            self = this,
                            lst = $.map(
                            self.getSelectedNodes(self.options.stopOnParents),
                            function (node) {
                                return node.data.key;
                            });
                        element.treeValue = lst;
                        var val = lst.join(self.options.separator);
                        if (self.options.target) {
                            $(self.options.target).val(val);
                            $(element).val($.map(
                            self.getSelectedNodes(self.options.stopOnParents),
                            function (node) {
                                return node.data.title;
                            }).join(self.options.separator));
                        }
                        else
                            $(element).val(val);
                    }
                },
                onActivate: function (node) {
                    var self = this;
                    if (!self.options.checkbox) {
                        $(self.options.target).val(node.data.key).trigger("change");
                        $(this.divTree.element).val(node.data.title);
                        $tree._hideTree();
                    }
                },

                autoValue: true
            },
            _create: function () {
                var self = this;
                if (!$.custom.droptree._checkExternalClick) {
                    $.custom.droptree._checkExternalClick = function (event) {
                        if (!$.custom.droptree._curInst)
                            return;
                        $tree = $.custom.droptree._curInst;
                        var $target = $(event.target);
                        if (!$target.isChildAndSelfOf($tree.element)
                        && !$target.isChildAndSelfOf($tree.tree))
                            $tree._hideTree();
                    };
                }
                if (!$.custom.droptree.initialized) {
                    //if ($.browser.mozilla) {
                    //    $("*").live("focus", function (e) {
                    //        if ($(this).isChildAndSelfOf($(document.activeElement))) {
                    //            $.custom.droptree.$focus = $(this);
                    //            if (document.activeElement == document.body)
                    //                document.activeElement = this;
                    //        }
                    //        else
                    //            $.custom.droptree.$focus = $(document.activeElement);
                    //        //e.stopPropagation();
                    //        //return false;
                    //    });
                    //}
                    $(document).mousedown($.custom.droptree._checkExternalClick);
                    $.custom.droptree.initialized = true;
                }
                this._hideTree = function () {
                    self.tree.hide();
                    $.custom.droptree._curInst = null;
                };
                //检查焦点位置
                this._checkFocus = function () {
                    var $focus = $("*:focus");
                    if (!$focus || $focus.length == 0)
                        $focus = $.custom.droptree.$focus;
                    if (!$focus || $focus.length == 0)
                        $focus = $(document.activeElement);
                    if (!$focus)
                        $focus = $(document);
                    if (!$focus.isChildAndSelfOf(self.element)
             && !$focus.isChildAndSelfOf(self.tree)) {
                        window.setTimeout(self._hideTree, 100);
                    }
                };
                this._keyDown = function (event) {
                    switch (event.keyCode) {
                        case 9: self._hideTree();
                            break; // hide on tab out
                        case 13: self._hideTree();
                            break; // select the value on enter
                        case 27: self._hideTree();
                            break; // hide on escape
                    }
                };
                //赋值给文本框
                this._setValue = function (val) {
                    var lst = val.split(self.options.separator);
                    var tree = self.tree.dynatree("getTree");
                    var selectedNodes = tree.getSelectedNodes();
                    $.each(selectedNodes, function (i, n) {
                        n.select(false);
                    });
                    $.each(lst, function (i, n) {
                        tree.selectKey(n);
                    });
                };

                //创建Tree
                this.tree = $('<div edittype="dynatree"></div>')
        .css({
            "display": "none",
            "width": self.options.width != null ? self.options.width : self.element.css("width"),
            "height": self.options.height != null ? self.options.height : "auto",
            "position": "absolute",
            "z-index": "99"
        })
        .addClass("droptree-container")
        .insertAfter(self.element)
        .dynatree(self.options);
                this.tree[0].element = this.element;

                //绑定焦点事件
                self.element.focus(function () {
                    if (self.tree.is(":hidden")) {
                        //赋值
                        if (self.options.autoValue)
                            self._setValue(self.element.val());
                        self.tree.show();
                        $.custom.droptree._curInst = self;
                    }
                });
                self.element.bind("keydown", self._keyDown);
                self.tree.bind("keydown", self._keyDown);

                self.element.change(function () {
                    self._setValue(self.element.val());
                });
            }
        });
