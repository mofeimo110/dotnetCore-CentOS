String.prototype.format = function () {
	if (arguments.length > 0) {
		var obj = this, args = arguments;
		if (arguments.length == 1 && typeof (args[0]) == "object") {
			//var result = this;
			//for (var key in args) {
			//	var reg = new RegExp("({" + key + "})", "g");
			//	result = result.replace(reg, args[key]);
			//}
			//return result;
			return obj.replace(/\{(\w+)\}/g,
				function (m, i) {
					return args[0][i] || '';
				});
		}
		else {
			return obj.replace(/\{(\d+)\}/g,
				function (m, i) {
					return args[i] || '';
				});
		}
	}
	else {
		return this;
	}
}

String.format = function () {
	if (arguments.length == 0)
		return null;

	var str = arguments[0],
		args = $.makeArray(arguments).slice(1);
	return String.prototype.format.apply(str, args);
}
