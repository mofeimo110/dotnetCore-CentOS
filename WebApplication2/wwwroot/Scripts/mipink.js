/*!
 * mipink v1.0.0
 * Copyright 2018 DT Mip, Inc.
 */
(function ($) {
    $.extend({
        mipink: {
            version: "1.0.0",
            pid: 1
        }
    });

    $.fn.mipink = function (options) {
        if (typeof options === 'string') {
            var fn = $.mipink[options];
            if (!fn) {
                throw ("mipink - No such method: " + options);
            }
            var args = $.makeArray(arguments).slice(1);
            return this.each(function () {
                return fn.apply(this, args);
            });
        }
        return this.each(function () {
            $.mipink.init.call(this, options);
        });
    };

     support = {
         transform3d: ("WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix()),
         touch: ("ontouchstart" in window)
     };

    function getTranslate(x, y) {
        var distX = x,
            distY = y;
        return support.transform3d ? "translate3d(" + distX + "px, " + distY + "px, 0)" : "translate(" + distX + "px, " + distY + "px)";
    }

    function getPage(event, page) {
        return support.touch ? event.changedTouches[0][page] : event[page];
    }

    $.extend($.mipink, {
        init: function (options) {
            //if (!$.isPlainObject(options))
            //    return;
            if (this.mipink)
                return;
            this.mipink = true;
            var self = this;
            
            !$(".mipink").length && $('<div class="mipink weui-gallery weui-animate-fade-in" style="display: none;">\
            <div class="mipink-body">\
            <img class="mipink-img" src="" />\
            <div class="weui-gallery__opr" style="display:none"> <a class="weui-gallery__del" href="#"> <i class="weui-icon-delete weui-icon_gallery-delete"></i> </a> </div>\
            </div>\
            </div>').appendTo(document.body);
            
            var zoomMask = document.querySelector(".mipink"),
                zoomImg = document.querySelector(".mipink .mipink-img"),
                zoomOpe = document.querySelector(".mipink .weui-gallery__opr"),
                zoomClose = document.querySelector(".mipink .weui-gallery__del"),
                imgSrc = "";

            var settings = $.extend({
                selector: "img",
                buffMove: 3, //缓冲系数
                buffScale:2, //放大系数
                finger: false, //触摸手指的状态 false：单手指 true：多手指
                imageUrl: function(){
                    return self.p.src || (self.p.anchor ? $(self).find(self.p.anchor).attr("href") : "") || this.getAttribute("src")
                },
                withDelete: false,
                element: zoomImg,

            }, options);
            
            self.p = settings;

            $.mipink._destroy.call(self);

            function closePack() {
                zoomMask.style.cssText = "display:none";
                zoomImg.src = "";
                zoomImg.style.cssText = "";

                $.mipink._destroy.call(self);

                document.removeEventListener("touchmove", function () { $.mipink.eventStop.call(self) }, false);
            };
            self.hide = closePack;

            var currentElement;
            zoomClose.addEventListener("click", function (e) {
                if (settings.onDelete)
                    settings.onDelete.call(currentElement);
                e.stopPropagation();
            }, false);
            zoomMask.addEventListener("click", closePack, false);

            $(self).on("click", settings.selector, function (e) {
                e.preventDefault();
                currentElement = this;
                currentElement.gallery = self;
                if (settings.withDelete)
                    $(zoomMask).find(".weui-gallery__opr").show();
                else
                    $(zoomMask).find(".weui-gallery__opr").hide();
                imgSrc = settings.imageUrl.call(this);//self.p.src || (self.p.anchor ? $(self).find(self.p.anchor).attr("href") : "") || this.getAttribute("src");
                zoomMask.style.cssText = "display:block";
                zoomImg.src = imgSrc;

                zoomImg.onload = function () {
                    zoomImg.style.cssText = "margin-top:-" + (zoomImg.offsetHeight / 2) + "px";

                    // 禁止页面滚动
                    document.addEventListener("touchmove", function () { $.mipink.eventStop.call(self) }, false);

                    self.p.imgBaseWidth = zoomImg.offsetWidth;
                    self.p.imgBaseHeight = zoomImg.offsetHeight;

                    $.mipink.addEventStart.call(self, {
                        wrapX: zoomMask.offsetWidth,
                        wrapY: zoomMask.offsetHeight,
                        mapX: zoomImg.width,
                        mapY: zoomImg.height
                    });
                }
            });
        },
        addEventStart: function (param) {
            var self = this,
                params = param || {};

            //config set
            self.p.wrapX = params.wrapX || 0; //可视区域宽度
            self.p.wrapY = params.wrapY || 0; //可视区域高度
            self.p.mapX = params.mapX || 0; //地图宽度
            self.p.mapY = params.mapY || 0; //地图高度

            self.p.outDistY = (self.p.mapY - self.p.wrapY) / 2; //图片超过一屏的时候有用

            self.p.width = self.p.mapX - self.p.wrapX; //地图的宽度减去可视区域的宽度
            self.p.height = self.p.mapY - self.p.wrapY; //地图的高度减去可视区域的高度

            self.p.element.addEventListener("touchstart", function (e) {
                $.mipink._touchstart.call(self, e);
            }, false);
            self.p.element.addEventListener("touchmove", function (e) {
                $.mipink._touchmove.call(self, e);
            }, false);
            self.p.element.addEventListener("touchend", function (e) {
                $.mipink._touchend.call(self, e);
            }, false);
        },
        // 重置坐标数据
        _destroy: function () {
            this.p.distX = 0;
            this.p.distY = 0;
            this.p.newX = 0;
            this.p.newY = 0;

        },
        // 更新地图信息
        _changeData: function () {
            this.p.mapX = this.p.element.offsetWidth; //地图宽度
            this.p.mapY = this.p.element.offsetHeight; //地图高度
            // this.p.outDistY = (this.p.mapY - this.p.wrapY)/2; //当图片高度超过屏幕的高度时候。图片是垂直居中的，这时移动有个高度做为缓冲带
            this.p.width = this.p.mapX - this.p.wrapX; //地图的宽度减去可视区域的宽度
            this.p.height = this.p.mapY - this.p.wrapY; //地图的高度减去可视区域的高度
        },
        _touchstart: function (e) {
            var self = this;

            self.p.tapDefault = false;
            // self.p.tapDefaultY = false;

            e.preventDefault();

            var touchTarget = e.targetTouches.length; //获得触控点数

            $.mipink._changeData.call(self); //重新初始化图片、可视区域数据，由于放大会产生新的计算

            if (touchTarget == 1) {
                // 获取开始坐标
                self.p.basePageX = getPage(e, "pageX");
                self.p.basePageY = getPage(e, "pageY");

                self.p.finger = false;
            } else {
                self.p.finger = true;

                self.p.startFingerDist = $.mipink.getTouchDist.call(self, e).dist;
                self.p.startFingerX = $.mipink.getTouchDist.call(self, e).x;
                self.p.startFingerY = $.mipink.getTouchDist.call(self, e).y;
            }
            /*console.log("pageX: " + getPage(e, "pageX"));
            console.log("pageY: " + getPage(e, "pageY"));*/
        },
        _touchmove: function (e) {
            var self = this;
            self.p.tapDefault = true;
            e.preventDefault();
            e.stopPropagation();

            // console.log("event.changedTouches[0].pageY: " + event.changedTouches[0].pageY);

            var touchTarget = e.targetTouches.length; //获得触控点数

            if (touchTarget == 1 && !self.p.finger) {

                $.mipink._move.call(self, e);
            }

            if (touchTarget >= 2) {
                $.mipink._zoom.call(self, e);
            }
        },
        _touchend: function (e) {
            var self = this;
            console.log(self.p.tapDefault)

            if (!self.p.finger && !self.p.tapDefault) {
                self.hide();
                return
            };
            $.mipink._changeData.call(self); //重新计算数据
            if (self.p.finger) {
                self.p.distX = -self.p.imgNewX;
                self.p.distY = -self.p.imgNewY;
            }

            if (self.p.distX > 0) {
                self.p.newX = 0;
            } else if (self.p.distX <= 0 && self.p.distX >= -self.p.width) {
                self.p.newX = self.p.distX;
                self.p.newY = self.p.distY;
            } else if (self.p.distX < -self.p.width) {
                self.p.newX = -self.p.width;
            }


            $.mipink.reset.call(self);
        },
        _move: function (e) {

            var self = this,
                pageX = getPage(e, "pageX"), //获取移动坐标
                pageY = getPage(e, "pageY");

            // 禁止默认事件
            // e.preventDefault();
            // e.stopPropagation();

            /*self.p.tapDefaultX = pageX - self.p.basePageX;
            self.p.tapDefaultY = pageY - self.p.basePageY;*/
            // 获得移动距离
            self.p.distX = (pageX - self.p.basePageX) + self.p.newX;
            self.p.distY = (pageY - self.p.basePageY) + self.p.newY;

            if (self.p.distX > 0) {
                self.p.moveX = Math.round(self.p.distX / self.p.buffMove);
            } else if (self.p.distX <= 0 && self.p.distX >= -self.p.width) {
                self.p.moveX = self.p.distX;
            } else if (self.p.distX < -self.p.width) {
                self.p.moveX = -self.p.width + Math.round((self.p.distX + self.p.width) / self.p.buffMove);
            }
            $.mipink.movePos.call(self);
            self.p.finger = false;
        },
        // 图片缩放
        _zoom: function (e) {
            var self = this;
            // e.preventDefault();
            // e.stopPropagation();

            var nowFingerDist = $.mipink.getTouchDist.call(self, e).dist, //获得当前长度
                ratio = nowFingerDist / self.p.startFingerDist, //计算缩放比
                imgWidth = Math.round(self.p.mapX * ratio), //计算图片宽度
                imgHeight = Math.round(self.p.mapY * ratio); //计算图片高度

            // 计算图片新的坐标
            self.p.imgNewX = Math.round(self.p.startFingerX * ratio - self.p.startFingerX - self.p.newX * ratio);
            self.p.imgNewY = Math.round((self.p.startFingerY * ratio - self.p.startFingerY) / 2 - self.p.newY * ratio);

            if (imgWidth >= self.p.imgBaseWidth) {
                self.p.element.style.width = imgWidth + "px";
                $.mipink.refresh.call(self, -self.p.imgNewX, -self.p.imgNewY, "0s", "ease");
                self.p.finger = true;
            } else {
                if (imgWidth < self.p.imgBaseWidth) {
                    self.p.element.style.width = self.p.imgBaseWidth + "px";
                }
            }

            self.p.finger = true;
        },
        // 移动坐标
        movePos: function () {
            var self = this;

            if (self.p.height < 0) {
                if (self.p.element.offsetWidth == self.p.imgBaseWidth) {
                    self.p.moveY = Math.round(self.p.distY / self.p.buffMove);
                    // console.log(self.p.moveY +"111")
                } else {
                    var moveTop = Math.round((self.p.element.offsetHeight - self.p.imgBaseHeight) / 2);
                    self.p.moveY = -moveTop + Math.round((self.p.distY + moveTop) / self.p.buffMove);
                    // console.log(self.p.moveY +"222")
                }
            } else {
                var a = Math.round((self.p.wrapY - self.p.imgBaseHeight) / 2),
                    b = self.p.element.offsetHeight - self.p.wrapY + Math.round(self.p.wrapY - self.p.imgBaseHeight) / 2;

                if (self.p.distY >= -a) {
                    self.p.moveY = Math.round((self.p.distY + a) / self.p.buffMove) - a;
                    // console.log(self.p.moveY +"333")
                } else if (self.p.distY <= -b) {
                    self.p.moveY = Math.round((self.p.distY + b) / self.p.buffMove) - b;
                    // console.log(self.p.moveY +"444")
                } else {
                    self.p.moveY = self.p.distY;
                    // console.log(self.p.moveY +"555")
                }
            }
            $.mipink.refresh.call(self, self.p.moveX, self.p.moveY, "0s", "ease");
        },
        // 重置数据
        reset: function () {
            var self = this,
                hideTime = ".2s";
            if (self.p.height < 0) {
                self.p.newY = -Math.round(self.p.element.offsetHeight - self.p.imgBaseHeight) / 2;
            } else {
                var a = Math.round((self.p.wrapY - self.p.imgBaseHeight) / 2),
                    b = self.p.element.offsetHeight - self.p.wrapY + Math.round(self.p.wrapY - self.p.imgBaseHeight) / 2;

                if (self.p.distY >= -a) {
                    self.p.newY = -a;
                } else if (self.p.distY <= -b) {
                    self.p.newY = -b;
                } else {
                    self.p.newY = self.p.distY;
                }
            }
            $.mipink.refresh.call(self, self.newX, self.p.newY, hideTime, "ease-in-out");
        },
        // 执行图片移动
        refresh: function (x, y, timer, type) {
            this.p.element.style.webkitTransitionProperty = "-webkit-transform";
            this.p.element.style.webkitTransitionDuration = timer;
            this.p.element.style.webkitTransitionTimingFunction = type;
            this.p.element.style.webkitTransform = getTranslate(x, y);
        },
        // 获取多点触控
        getTouchDist: function (e) {
            var x1 = 0,
                y1 = 0,
                x2 = 0,
                y2 = 0,
                x3 = 0,
                y3 = 0,
                result = {};

            x1 = e.touches[0].pageX;
            x2 = e.touches[1].pageX;
            y1 = e.touches[0].pageY - document.body.scrollTop;
            y2 = e.touches[1].pageY - document.body.scrollTop;

            if (!x1 || !x2) return;

            if (x1 <= x2) {
                x3 = (x2 - x1) / 2 + x1;
            } else {
                x3 = (x1 - x2) / 2 + x2;
            }
            if (y1 <= y2) {
                y3 = (y2 - y1) / 2 + y1;
            } else {
                y3 = (y1 - y2) / 2 + y2;
            }

            result = {
                dist: Math.round(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))),
                x: Math.round(x3),
                y: Math.round(y3)
            };
            return result;
        },
        eventStop: function (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
})(jQuery);
