$.support.fixedPosition = (function () {
    var contain = $(document.documentElement),
		el = $("<div style='position:fixed;top:100px;'>x</div>").appendTo(contain),
		originalHeight = contain[0].style.height,
		w = window,
		result;

    contain.height(screen.height * 2 + "px");

    w.scrollTo(0, 100);

    result = el[0].getBoundingClientRect().top === 100;

    contain.height(originalHeight);

    el.remove();

    w.scrollTo(0, 0);

    return result;
})();

window.tabbar = {
    data: {},
    setOffset: function () {
        var tab = this;
        $("a[name]").each(function (index, elen) {
            tab.data[$(this).attr('name')] = parseInt($(this).offset().top);
        });
    },
    nav: function (bar) {
        var nav = $(bar);
        var tabBtn = nav.find('ul li');
        var navTop = nav.offset().top - 64;
        var offset = nav.offset().top + nav.height();

        $('.mod-href', nav).eq(0).addClass('mod-href-01');

        var tab = this;
        tab.setOffset();
        $(window).resize(function () { tab.setOffset(); });

        //click to certain scrolltop
        tabBtn.click(function (e) {
            var name = $(this).find('a').attr('href').replace('#', '');
            $(window).scrollTop(tab.data[name] - offset);

            e.preventDefault();
            //activeThis(this);
        });

        $(window).scroll(function () {
            var windowTop = parseInt($(window).scrollTop());

            //            //keep floating on the top of window
            //            if (windowTop > navTop) {
            //                if ($.support.fixedPosition) {
            //                    nav.addClass('fixed');
            //                } else {
            //                    nav.css({
            //                        top: windowTop,
            //                        position: 'absolute',
            //                        left: '0',
            //                        'z-index': 1
            //                    });
            //                }
            //            } else {
            //                if ($.support.fixedPosition) {
            //                    nav.removeClass('fixed');
            //                } else {
            //                    nav.css({
            //                        top: 0,
            //                        position: 'static'
            //                    });
            //                }
            //            }

            //active nav li when at certain top
            var lastKey = '';
            var lastValue = 0;

            windowTop = windowTop + offset;
            for (var a in tab.data) {
                if (lastKey == '') {
                    lastKey = a;
                    continue;
                }
                if (windowTop < tab.data[a]) {
                    //console.log(['hit:'+lastKey,nav.find('a[href="#' + lastKey + '"]')]);
                    activeThis(nav.find('a[href="#' + lastKey + '"]').parent());
                    break;
                } else {
                    lastKey = a;
                    lastValue = tab.data[a];
                }
            }
            activeThis(nav.find('a[href="#' + lastKey + '"]').parent());
        });

        function activeThis(obj) {
            //console.log([$(obj).html(),$(obj).addClass('active').siblings()]);
            $(obj).addClass('active').siblings().removeClass('active');
        }
    }
}
$(function () {
    tabbar.nav(".b-nav");
});