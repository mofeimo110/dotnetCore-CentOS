/**
 * BootstrapValidator Add
 *
 * by Miplus
 */
(function ($) {
    //日期验证
    $.fn.bootstrapValidator.validators.datetime = {
        /**
         * @param {BootstrapValidator} validator The validator plugin instance
         * @param {jQuery} $field The jQuery object represents the field element
         * @param {Object} options The validator options
         * @returns {Boolean}
         */
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2} ([01]\d|2[0-3])(:[0-5]\d){0,2}$/.test(value),
                message: "请输入有效的日期时间, 格式示例：2013-05-16 10:30"
            };
        }
    };
    // 手机号码验证
    $.fn.bootstrapValidator.validators.mobile = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(value),
                message: "手机号码格式错误"
            };
        }
    };
    // 电话号码验证   
    $.fn.bootstrapValidator.validators.phone = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/.test(value),
                message: "电话号码格式错误"
            };
        }
    };
    // 邮政编码验证   
    $.fn.bootstrapValidator.validators.zipCode = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^[0-9]{6}$/.test(value),
                message: "邮政编码格式错误"
            };
        }
    };
    // QQ号码验证   
    $.fn.bootstrapValidator.validators.qq = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^[1-9]\d{4,9}$/.test(value),
                message: "QQ号码格式错误"
            };
        }
    };
    // IP地址验证
    $.fn.bootstrapValidator.validators.ip = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value)
                    && (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256)),
                message: "IP地址格式错误"
            };
        }
    };
    //字符数字
    $.fn.bootstrapValidator.validators.chrnum = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^([a-zA-Z0-9]+)$/.test(value),
                message: "只能输入数字和字母(字符A-Z, a-z, 0-9)"
            };
        }
    };
    // 中文的验证
    $.fn.bootstrapValidator.validators.chinese = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^[\u4e00-\u9fa5]+$/.test(value),
                message: "只能输入中文"
            };
        }
    };
    $.fn.bootstrapValidator.validators.datetime = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2} ([01]\d|2[0-3])(:[0-5]\d){0,2}$/.test(value),
                message: "请输入有效的日期时间, 格式示例：2013-05-16 10:30"
            };
        }
    };
    $.fn.bootstrapValidator.validators.datetime = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2} ([01]\d|2[0-3])(:[0-5]\d){0,2}$/.test(value),
                message: "请输入有效的日期时间, 格式示例：2013-05-16 10:30"
            };
        }
    };
    $.fn.bootstrapValidator.validators.datetime = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2} ([01]\d|2[0-3])(:[0-5]\d){0,2}$/.test(value),
                message: "请输入有效的日期时间, 格式示例：2013-05-16 10:30"
            };
        }
    };
    $.fn.bootstrapValidator.validators.datetime = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2} ([01]\d|2[0-3])(:[0-5]\d){0,2}$/.test(value),
                message: "请输入有效的日期时间, 格式示例：2013-05-16 10:30"
            };
        }
    };
    $.fn.bootstrapValidator.validators.datetime = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2} ([01]\d|2[0-3])(:[0-5]\d){0,2}$/.test(value),
                message: "请输入有效的日期时间, 格式示例：2013-05-16 10:30"
            };
        }
    };
    $.fn.bootstrapValidator.validators.datetime = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2} ([01]\d|2[0-3])(:[0-5]\d){0,2}$/.test(value),
                message: "请输入有效的日期时间, 格式示例：2013-05-16 10:30"
            };
        }
    };
    $.fn.bootstrapValidator.validators.datetime = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2} ([01]\d|2[0-3])(:[0-5]\d){0,2}$/.test(value),
                message: "请输入有效的日期时间, 格式示例：2013-05-16 10:30"
            };
        }
    };
    $.fn.bootstrapValidator.validators.datetime = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2} ([01]\d|2[0-3])(:[0-5]\d){0,2}$/.test(value),
                message: "请输入有效的日期时间, 格式示例：2013-05-16 10:30"
            };
        }
    };
    $.fn.bootstrapValidator.validators.datetime = {
        validate: function (validator, $field, options) {
            var value = $field.val();
            return {
                valid: !value || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2} ([01]\d|2[0-3])(:[0-5]\d){0,2}$/.test(value),
                message: "请输入有效的日期时间, 格式示例：2013-05-16 10:30"
            };
        }
    };

}(window.jQuery));
