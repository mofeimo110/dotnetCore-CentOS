/*!
 * mediaupload v1.1.0
 * Copyright 2017 DT Mip, Inc.
 */
(function ($) {
    $.extend({
        mediaup: {
            version: "1.0.0",
            mid: 1
        }
    });

    $.fn.mediaup = function (options) {
        if (typeof options === 'string') {
            var fn = $.mediaup[options];
            if (!fn) {
                throw ("mediaup - No such method: " + options);
            }
            var args = $.makeArray(arguments).slice(1);
            return fn.apply(this, args);
        }
        return this.each(function(){
            $.mediaup.init.call(this, options);
        });
    };
    $.extend($.mediaup, {
        settings: {},
        init: function (options) {
            var obj = this,
                settings = {
                url: $.mitools.path + "/unis/file?" + $.param({ root: "upload", touuid: "false", dir: _guserid }),
                dataType: 'json',
                fileTypes: 'jpg|png|gif|jpeg|avi|mpg|mpeg|mpe|mov|qt|mp4|m4v|wmv|asf|asx|rm|rmvb|3gp|mkv|vob|m4a|mp3|wav|wma|doc|docx|xls|xlsx|pdf|ppt|rar|zip|gzip',
                done: function (e, data) {
                    if (data.result && data.result.files) {
                        var file = data.result.files[0].url,
                            name = data.result.files[0].name,
                            vals = $.mitools.data.GetValue($(options.target)) || [];
                        if (options.withName)
                            vals.push(name + ":" + file);
                        else
                            vals.push(file);
                        $.mitools.data.SetValue($(options.target), vals);
                        if (obj.settings && obj.settings.onSuccess)
                            obj.settings.onSuccess.call(obj, data);
                    }
                },
                progressall: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    console.log("%s mediaup.progressall, progress:%d", $.format.date(new Date(), 'HH:mm:ss.SSS'), progress);
                    window.setTimeout(function () {
                        $('.js-fileinput-bar .progress .progress-bar').css(
                        'width',
                        progress + '%'
                    );
                        if (progress == 100) {
                            $(".js-fileinput-bar .progress").hide();
                        }
                    }, 0);
                },
                add: function (e, data) {
                    var uploadErrors = [];
                    var acceptFileTypes = settings.acceptFileTypes;
                    if (data.originalFiles[0]['name'].length && !acceptFileTypes.test(data.originalFiles[0]['name'])) {
                        uploadErrors.push('文件类型不匹配');
                    }
                    if (data.originalFiles[0]['size'].length && data.originalFiles[0]['size'] > 200000000) {
                        uploadErrors.push('文件大小超过限制');
                    }
                    if (uploadErrors.length > 0) {
                        $.mitools.dialog.ShowError(uploadErrors.join("\n"));
                    } else {
                        window.setTimeout(function () {
                            $('.js-fileinput-bar .progress').show();
                            $('.js-fileinput-bar .progress .progress-bar').css(
                                'width',
                                '0%'
                            );
                        }, 0);
                        data.submit();
                    }
                }
            };
            $.extend(settings, options);
            obj.settings = settings;
            if (!settings.acceptFileTypes)
                settings.acceptFileTypes = new RegExp("(\.|\/)(" + settings.fileTypes + ")$", "i");
            var $this = $(obj);
            $this.fileupload(settings).prop('disabled', !$.support.fileInput)
                .parent().addClass($.support.fileInput ? undefined : 'disabled');
            if (settings.target) {
                $(settings.target).on("click", ".mini-block .close", function () {
                    var $btn = $(this);
                    $.mitools.dialog.ShowConfirm("删除文件", "确认要删除当前文件吗？", function () {
                        $.mediaup.deleteFile.call(obj, $btn.closest("div").find("span").attr("data"), $btn.closest("div"));
                        //$.mitools.dialog.Close();
                    });
                    return false;
                });
            }
        },
        fileblock: function (options, container, close) {
            if (typeof options === 'string') {
                options = {
                    path: options,
                    container: container,
                    close: close,
                    value: options
                }
            }
            var icon = "", name = "";
            switch ($.mediaup.fileCategory(options.path)) {
                case "image":
                    icon = "icon-image";
                    name = options.name || "照片";
                    break;
                case "video":
                    icon = "icon-camera2";
                    name = options.name || "视频";
                    break;
                case "zip":
                    icon = "icon-cabinet";
                    name = options.name || "压缩包";
                    break;
                case "voice":
                    icon = "icon-microphone";
                    name = options.name || "声音";
                    break;
                default:
                    icon = "icon-file3";
                    name = options.name || "文档";
                    break;
            }
            return "<div class='mini-block'><span data='" + options.value + "' >" + "<i class='" + icon + "'></i>" + "<a href='" +
                $.mitools.path + "/" + options.path + "' target='tab'>" + name + "</a>" + "</span>" +
                    (options.close ? "<button class='close' title='删除'><span aria-hidden='true'>×</span></button>" : "") + "</div>";
        },
        fileName: function(value){
            return value.replace(/^.*[\\\/]/, '');
        },
        fileCategory: function (value) {
            var cate = "";
            if (/(\.|\/)(jpg|png|gif|jpeg)$/i.test(value)) {
                cate = "image";
            }
            else if (/(\.|\/)(avi|mpg|mpeg|mpe|mov|qt|mp4|m4v|wmv|asf|asx|rm|rmvb|3gp|mkv|vob)$/i.test(value)) {
                cate = "video";
            }
            else if (/(\.|\/)(rar|zip|gzip)$/i.test(value)) {
                cate = "zip";
            }
            else if (/(\.|\/)(m4a|mp3|wav|wma)$/i.test(value)) {
                cate = "voice";
            }
            return cate;
        },
        deleteFile: function (url, div) {
            var obj = this;
            $.mitools.data.PostCommand({
                url: $.mitools.path + "/unis/file",
                type: "DELETE",
                data: { "file": url },
                success: function (result) {
                    if (result != null) {
                        if (result.Code != 0) {
                            $.mitools.dialog.ShowError(result.Cause);
                        }
                        else {
                            $.mitools.dialog.ShowInfo("附件已删除");
                            div.remove();
                            if (obj.settings && obj.settings.onDelete)
                                obj.settings.onDelete.call(obj, url, result);
                        }
                    }
                }
            });
        }

    });
})(jQuery);