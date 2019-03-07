/* Chinese initialisation for the jQuery UI time picker plugin. */
/* Written by Jack (jack_zh@sina.com). */
jQuery(function($){
    $.timepicker.regional['zh-CN'] = {
        timeOnlyTitle: "选择时间",
        timeText: "时间",
        hourText: "小时",
        minuteText: "分钟",
        secondText: "秒钟",
        millisecText: "毫秒",
        currentText: '现在',
        closeText: '关闭',
        ampm: false
    };
    $.timepicker.setDefaults($.timepicker.regional['zh-CN']);
});
