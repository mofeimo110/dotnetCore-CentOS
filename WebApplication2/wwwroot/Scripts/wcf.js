jQuery.extend({
    wcf: {
        invoke: function (options, url, data, async, success, error) {
            if (typeof options === 'string') {
                options = {
                    type: options,
                    url: url,
                    data: data,
                    async: async,
                    success: success,
                    error: error
                };
            }
            var m = options.type.toUpperCase();
            return $.ajax({
                url: options.url,
                data: /^(?:GET|HEAD)$/.test(m) ? options.data : JSON.stringify(options.data),
                type: m,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                async: options.async,
                success: options.success,
                error: options.error
            });
        }
    }
});

jQuery.each(['get', 'head', 'post', 'put', 'delete'], function (i, n) {
    jQuery.wcf[n] = function (url, data, async, success, error) {
        if (typeof (url) == 'string') {
            return jQuery.wcf.invoke(n, url, data, async, success, error);
        }
        else if (jQuery.isPlainObject(url)) {
            url.method = n;
            return jQuery.wcf.invoke(url);
        }
    };
});