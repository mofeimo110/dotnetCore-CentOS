$.widget("custom.catcomplete", $.ui.autocomplete, {
    _create: function () {
        this._super();
        this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
    },
    _renderItem: function (ul, item) {
        return $("<li></li>")
				.append("<a title='" + (item.title || '') + "'>" + (item.label || '') + "<br><small>" + (item.desc || '') + "</small></a>")
				.appendTo(ul);
    },
    _renderMenu: function (ul, items) {
        var self = this,
			        currentCategory = "";
        var str = "";
        $.each(items, function (index, item) {
            str = item.category || '';
            if (str != currentCategory) {
                ul.append("<li class='ui-autocomplete-category'>" + str + "</li>");
                currentCategory = str;
            }
            self._renderItemData(ul, item);
        });
    },
});
$.widget("custom.acbutton", {
    _create: function () {
        var self = this;
        this.button = $("<button type='button'>&nbsp;</button>")
					.attr("tabIndex", -1)
					.attr("title", "显示所有项")
					.insertAfter(self.element)
					.button({
					    icons: {
					        primary: "ui-icon-triangle-1-s"
					    },
					    text: false
					})
					.removeClass("ui-corner-all")
					.addClass("ui-corner-right ui-button-icon")
					.click(function () {
					    // close if already visible
					    if (self.element.catcomplete("widget").is(":visible")) {
					        self.element.catcomplete("close");
					        return;
					    }

					    // work around a bug (likely same cause as #5265)
					    $(this).blur();

					    // pass empty string as value to search for, displaying all results
					    self.element.catcomplete("search", "");
					    self.element.focus();
					});
        var w = parseFloat(this.element.css("width"));
        this.element.css("width", (w - this.button.outerWidth()) + 'px');
    }
});