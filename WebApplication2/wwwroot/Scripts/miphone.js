/*!
 * miphone v1.1.0
 * Copyright 2017 Miplus.
 */
var phoneJS = {};
var t = document.getElementsByTagName("SCRIPT");
t = (phoneJS.scriptElement = t[t.length - 1]).src;
phoneJS.path = t.substring(0, t.lastIndexOf("/", t.lastIndexOf("/") - 1));

(function ($) {

    $.extend({
        miphone: {
            version: "1.1.0",
            mid: 1
        }
    });

    $.fn.miphone = function (options) {
        if (typeof options === 'string') {
            var fn = $.miphone[options];
            if (!fn) {
                throw ("miphone - No such method: " + options);
            }
            var args = $.makeArray(arguments).slice(1);
            return this.each(function () {
                return fn.apply(this, args);
            });
        }
        return this.each(function () {
            $.miphone.init.call(this, options);
        });
    };
    $.extend($.miphone, {
        init: function (options) {
            var defaults = {
                device: "",
                opeId: "",
                command: {},
                fnReturn: [],
                fnError: [],
                fnEventError: [],
                fnEvent: [],
                fnDeviceEvent: [],
                fnAgentEvent: [],
                fnVoiceEvent: [],
                errorCount: 0,
                eventId: null,
                retryId: null,
                cmdErrorCount: 0,
                url: phoneJS.path + "/cti/"
            };

            var obj = this,
            settings = $.extend({}, defaults, options),
                id = $.miphone.mid++;
            this.p = settings;
            this.mid = id;
            $.miphone.loadState.call(this);
            return this;
        },

        saveState: function () {
            var state = {
                D: this.p.device,
                O: this.p.opeId,
                C: this.p.command
            };
            $.cookie("phone", JSON.stringify(state), { path: '/' });
        },

        loadState: function () {
            var s = $.cookie("phone");
            if (s == null)
                return;
            var state = $.parseJSON(s);
            if (state == null)
                return;
            this.p.device = state.D;
            this.p.opeId = state.O;
            this.p.command = state.C;
        },

        doCommand: function (command) {
            if (!command.dev || command.dev == "")
                return;
            if (arguments.length <= 1 || arguments[1] != true) {
                this.p.cmdErrorCount = 0;
                try {
                    if (this.p.retryId != null) {
                        clearTimeout(this.p.retryId);
                        this.p.retryId = null;
                    }
                }
                catch (e) { }
            }
            console.log("cmd:" + JSON.stringify(command));
            //command.ts = new Date().valueOf();
            this.p.command = command;
            var Obj = this;
            var ret = $.ajax({
                url: this.p.url + "do?t=" + new Date().valueOf(),
                data: JSON.stringify(command),
                type: 'POST',
                dataType: 'json',
                contentType: 'charset=utf-8',
                async: false,
                success: function (data) {
                    setTimeout(function () {
                        $.miphone.onCommandResp.call(Obj, data, this, command)
                    }, 0);
                },
                error: function (xhr) {
                    setTimeout(function () {
                        $.miphone.onErrorResp.call(Obj, xhr, this, command);
                    }, 0);
                }
            });
            return ret;
        },

        getEvent: function () {
            if (!this.p.device)
                return;
            var command = {
                "a": this.p.device,
                "t": new Date().valueOf()
            };
            var Obj = this;
            $.ajax({
                url: this.p.url + "e",
                data: command,
                type: 'get',
                dataType: 'json',
                contentType: 'application/json; charset=utf8',
                success: function (data) {
                    setTimeout(function () {
                        Obj.p.errorCount = 0;
                    Obj.p.eventId = setTimeout(function () { $.miphone.getEvent.call(Obj); }, 100);
                        $.miphone.onEventResp.call(Obj, data, this)
                    }, 0);
                },
                error: function (xhr) {
                    setTimeout(function () {
                        Obj.p.errorCount++;
                        if (Obj.p.errorCount >= 3) {
                            //alert("软电话已经有1分钟时间无法和服务器连接，将自动退出");
                            Obj.p.device = "";
                            $.miphone.saveState.call(Obj);
                        }
                        else {
                            Obj.p.eventId = setTimeout(function () {
                                $.miphone.getEvent.call(Obj);
                            }, 1000);
                        }
                        //alert("GetEvent Error:" + xhr.responseText);
                        $.miphone.onEventError.call(Obj, xhr, Obj.p.errorCount);
                    });
                }
            });
        },

        onCommandResp: function (data, context, command) {
            var result;
            if (!data.d)
                result = data;
            else
                result = data.d;
            if (!result)
                return;
            console.log("resp:" + JSON.stringify(result));
            //alert("Response: cmd=" + result.cmd + ", ret=" + result.ret + ", cause=" + result.cause);
            if (result.Code == 0) {
                if (command.cmd == "register") {
                    this.p.device = command["dev"];
                    //$.miphone.saveState.call(this);
                    var Obj = this;
                    this.p.eventId = setTimeout(function () {
                        $.miphone.getEvent.call(Obj);
                    }, 0);
                }
            }
            $.miphone.onReturn.call(this, result, command);
        },

        onReturn: function (result, command) {
            if ($.isFunction(result)) {
                this.p.fnReturn.push(result);
            }
            else {
                var newArray = [];
                for (var i = 0; i < this.p.fnReturn.length; i++) {
                    var fn = this.p.fnReturn[i];
                    if (fn != null) {
                        var valid = true;
                        try {
                            fn(result, command);
                        }
                        catch (e) {
                            if (e.number == -2146823277)
                                valid = false;
                        }
                        if (valid)
                            newArray.push(fn);
                    }
                }
                this.p.fnReturn = newArray;
            }
        },

        onErrorResp: function (xhr, context, command) {
            console.log("errorResp:" + JSON.stringify(xhr));
            var Obj = this;
            if (xhr.status == 502) {
                Obj.p.cmdErrorCount++;
                if (command.cmd != "register" && command.cmd != "unregister") {
                    if (Obj.p.cmdErrorCount <= 3) {
                        Obj.p.retryId = setTimeout(function () {
                            $.miphone.doCommand.call(Obj, command, true);
                        }, 1000);
                    }
                }
            }

            $.miphone.onError.call(this, xhr, command, Obj.p.cmdErrorCount);
        },

        onError: function (result, command, count) {
            if ($.isFunction(result)) {
                this.p.fnError.push(result);
            }
            else {
                var newArray = [];
                for (var i = 0; i < this.p.fnError.length; i++) {
                    var fn = this.p.fnError[i];
                    if (fn != null) {
                        var valid = true;
                        try {
                            fn(result, command, count);
                        }
                        catch (e) {
                            if (e.number == -2146823277)
                                valid = false;
                        }
                        if (valid)
                            newArray.push(fn);
                    }
                }
                this.p.fnError = newArray;
            }
        },

        onEventError: function (result, count) {
            if ($.isFunction(result)) {
                this.p.fnEventError.push(result);
            }
            else {
                var newArray = [];
                for (var i = 0; i < this.p.fnEventError.length; i++) {
                    var fn = this.p.fnEventError[i];
                    if (fn != null) {
                        var valid = true;
                        try {
                            fn(result, count);
                        }
                        catch (e) {
                            if (e.number == -2146823277)
                                valid = false;
                        }
                        if (valid)
                            newArray.push(fn);
                    }
                }
                this.p.fnEventError = newArray;
            }
        },

        onEventResp: function (data, context) {
            if (!data)
                return;
            var result;
            if (!data.d)
                result = data;
            else
                result = data.d;
            if (!result)
                return;
            if (typeof (result) == "string") {
                result = $.parseJSON(result);
                var n = {
                    Code: result.ret,
                    Data: result.ret == 0 ? [result] : null,
                    Cause: result.cause,
                    Count: result.ret == 0 ? 1 : 0
                }
                result = n;
            }
            console.log("event:" + result);
            //alert("Event: ret=" + result.ret + ", cause=" + result.cause);
            //首先调用一次UI的OnEvent函数
            $.miphone.onEvent.call(this, result);
                
            if (result.Code == 16391)
                return;
            else if (result.Code && result.Code != 0) {
                result.Data = [{
                    status: "unregister",
                    type: "device"
                }];
            }
            //alert("Event: type=" + result.type + ", status=" + result.status
            //     + ", ts=" + result.ts);
            var Obj = this;
            if (result.Data) {
                $.each(result.Data, function (i, n) {
                    switch (n.type) {
                        case "agent":
                            $.miphone.onAgentStatus.call(Obj, n);
                            break;
                        case "device":
                            $.miphone.onDeviceStatus.call(Obj, n);
                            break;
                        case "voice":
                            $.miphone.onVoiceStatus.call(Obj, n);
                            break;
		            }
		        });
            }
        },

        onEvent: function (result) {
            if ($.isFunction(result)) {
                this.p.fnEvent.push(result);
            }
            else {
                var newArray = [];
                for (var i = 0; i < this.p.fnEvent.length; i++) {
                    var fn = this.p.fnEvent[i];
                    if (fn != null) {
                        var valid = true;
                        try {
                            fn(result);
                        }
                        catch (e) {
                            if (e.number == -2146823277)
                                valid = false;
                        }
                        if (valid)
                            newArray.push(fn);
                    }
                }
                this.p.fnEvent = newArray;
            }
        },

        onAgentStatus: function (result) {
            //alert("OnAgentStatus");
            $.miphone.onAgentEvent.call(this, result);
        },

        onDeviceStatus: function (result) {
            switch (result.status) {
                case "unregister":
                    if (this.p.eventId) {
                        clearTimeout(this.p.eventId);
                        this.p.eventId = null;
                    }
                    this.p.device = "";
                    $.miphone.saveState.call(this);
                    break;
                case "register":
                    this.p.device = result["dev"];
                    this.p.opeId = result["agent"];
                    $.miphone.saveState.call(this);
                    break;
            }
            $.miphone.onDeviceEvent.call(this, result);
        },

        onVoiceStatus: function (result) {
            //alert("OnVoiceStatus");
            $.miphone.onVoiceEvent.call(this, result);
        },

        onAgentEvent: function (result) {
            if ($.isFunction(result)) {
                this.p.fnAgentEvent.push(result);
            }
            else {
                var newArray = [];
                for (var i = 0; i < this.p.fnAgentEvent.length; i++) {
                    var fn = this.p.fnAgentEvent[i];
                    if (fn != null) {
                        var valid = true;
                        try {
                            fn(result);
                        }
                        catch (e) {
                            if (e.number == -2146823277)
                                valid = false;
                        }
                        if (valid)
                            newArray.push(fn);
                    }
                }
                this.p.fnAgentEvent = newArray;
            }
        },

        onDeviceEvent: function (result) {
            if ($.isFunction(result)) {
                this.p.fnDeviceEvent.push(result);
            }
            else {
                var newArray = [];
                for (var i = 0; i < this.p.fnDeviceEvent.length; i++) {
                    var fn = this.p.fnDeviceEvent[i];
                    if (fn != null) {
                        var valid = true;
                        try {
                            fn(result);
                        }
                        catch (e) {
                            if (e.number == -2146823277)
                                valid = false;
                        }
                        if (valid)
                            newArray.push(fn);
                    }
                }
                this.p.fnDeviceEvent = newArray;
            }
        },

        onVoiceEvent: function (result) {
            if ($.isFunction(result)) {
                this.p.fnVoiceEvent.push(result);
            }
            else {
                var newArray = [];
                for (var i = 0; i < this.p.fnVoiceEvent.length; i++) {
                    var fn = this.p.fnVoiceEvent[i];
                    if (fn != null) {
                        var valid = true;
                        try {
                            fn(result);
                        }
                        catch (e) {
                            if (e.number == -2146823277)
                                valid = false;
                        }
                        if (valid)
                            newArray.push(fn);
                    }
                }
                this.p.fnVoiceEvent = newArray;
            }
        },

        register: function (device, opeId, answermode, number) {
            // alert(Answermode);
            if (this.p.eventId) {
                clearTimeout(this.p.eventId);
                this.p.eventId = null;
            }
            var command = {
                "cmd": "register",
                "dev": device,
                "opeid": opeId,
                "answermode": answermode,
                "number": number
            };
            $.miphone.doCommand.call(this, command);
        },

        unregister: function () {
            var command = {
                "cmd": "unregister",
                "dev": this.p.device
            };
            $.miphone.doCommand.call(this, command);
        },

        disconnect: function () {
            var command = {
                "cmd": "disconnect",
                "dev": this.p.device,

                "callid": "0"
            };
            $.miphone.doCommand.call(this, command);
        },

        redirect: function (remote, data) {
            var command = {
                "cmd": "redirect",
                "dev": this.p.device,

                "callid": "0",
                "remote": remote,
                "data": data ? data : ""
            };
            $.miphone.doCommand.call(this, command);
        },

        answer: function () {
            var command = {
                "cmd": "answer",
                "dev": this.p.device,

                "callid": "0"
            };

            $.miphone.doCommand.call(this, command);
        },

        silentMonitor: function (monitoredAddr) {
            var command = {
                "cmd": "silentmonitor",
                "dev": this.p.device,

                "monitoredaddr": monitoredAddr
            };
            $.miphone.doCommand.call(this, command);
        },

        blindTransfer: function (remote, data) {
            var command = {
                "cmd": "blindtransfer",
                "dev": this.p.device,

                "callid": "0",
                "remote": remote,
                "data": data ? data : ""
            };
            $.miphone.doCommand.call(this, command);
        },

        consultTran: function (remote, data) {
            var command = {
                "cmd": "consulttran",
                "dev": this.p.device,

                "callid": "0",
                "remote": remote,
                "data": data ? data : ""
            };
            $.miphone.doCommand.call(this, command);
        },

        consultConf: function (remote, data) {
            var command = {
                "cmd": "consultconf",
                "dev": this.p.device,

                "callid": "0",
                "remote": remote,
                "data": data ? data : ""
            };
            $.miphone.doCommand.call(this, command);
        },

        transfer: function () {
            var command = {
                "cmd": "transfer",
                "dev": this.p.device,

                "callid": "0"
            };
            $.miphone.doCommand.call(this, command);
        },

        conference: function () {
            var command = {
                "cmd": "conference",
                "dev": this.p.device,

                "callid": "0"
            };
            $.miphone.doCommand.call(this, command);
        },

        hold: function () {
            var command = {
                "cmd": "hold",
                "dev": this.p.device,

                "callid": "0"
            };
            $.miphone.doCommand.call(this, command);
        },

        retrieve: function () {
            var command = {
                "cmd": "retrieve",
                "dev": this.p.device,

                "callid": "0"
            };
            $.miphone.doCommand.call(this, command);
        },

        playFile: function (file, decode) {
            //alert("PlayFile");
            var command = {
                "cmd": "playfile",
                "dev": this.p.device,

                "file": file,
                "maxdtmf": 1,
                "times": 1,
                "decode": decode == undefined ? false : decode
            };
            $.miphone.doCommand.call(this, command);
        },

        makeCall: function (dnis, group, ani, decode) {
            var command = {
                "cmd": "makecall",
                "dev": this.p.device,

                "dnis": dnis,
                "ani": ani == undefined ? "" : ani,
                "grp": group == undefined ? "" : group,
                "timeout": 60,
                "decode": decode == undefined ? false : decode
            };
            $.miphone.doCommand.call(this, command);
        },

        acdLogin: function (group) {
            var command = {
                "cmd": "acdlogin",
                "dev": this.p.device,

                "group": group
            };
            $.miphone.doCommand.call(this, command);
        },

        acdLogout: function (group) {
            var command = {
                "cmd": "acdlogout",
                "dev": this.p.device,

                "group": group
            };
            $.miphone.doCommand.call(this, command);
        },

        acdReady: function () {
            var command = {
                "cmd": "acdsetstatus",
                "dev": this.p.device,
                "status": "1"
            };
            $.miphone.doCommand.call(this, command);
        },

        acdNotReady: function () {
            var command = {
                "cmd": "acdsetstatus",
                "dev": this.p.device,
                "status": "0"
            };
            $.miphone.doCommand.call(this, command);
        }

    });
})(jQuery);