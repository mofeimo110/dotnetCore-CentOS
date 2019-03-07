$(document).ready(function () {
    $.easing.def = "easeOutBounce";
    $('li.acc-button a b').click(function (e) {
        $(this).parent().parent().toggleClass("acc-close");
        var dropDown = $(this).parent().next();
        dropDown.slideToggle('slow');
        e.preventDefault();
    })
});