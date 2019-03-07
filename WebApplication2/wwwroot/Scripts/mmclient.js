/*!
 * mmclient v1.0.0
 * Copyright 2015 DT Mip, Inc.
 */
(function ($) {
    $.extend({
        mmclient: {
            version: "1.0.0",
            mid: 1
        }
    });

    $.fn.mmclient = function (options) {
        if (typeof options === 'string') {
            var fn = $.mmclient[options];
            if (!fn || !$.isFunction(fn)) {
                throw ("mmclient - No such method: " + options);
            }
            var args = $.makeArray(arguments).slice(1);
            return fn.apply(this, args);
        }
        return this.each(function () {
            $.mmclient.init.call(this, options);
        });
    };

    $.extend($.mmclient, {
        settings: {
            ip: "",
            port: "8800",
            uid: "",
            isgrpusr: false
        },
        list: {},
        init: function (options) {
            var obj = this,
                settings = $.extend({}, $.mmclient.settings, options);
            obj.mmcid = $.mmclient.mid++;
            obj.settings = settings;
            $.mmclient.list[obj.mmcid.toString()] = obj;
            var $this = $(obj),
                handler = document.createElement("script"),
                activeX = document.createElement("object");
            activeX.id = "mmclient_" + obj.mmcid;
            activeX.codebase = $.mitools.path + "/Objects/MmClientX.cab";
            activeX.classid = "CLSID:354F505B-A5AE-43A1-88B8-F89C0A69317D";
            document.body.appendChild(activeX);
            obj.activex = activeX;

            handler.setAttribute("for", "mmclient_" + obj.mmcid);
            handler.event = "OnMMCEvent(dev, agent, grp, status, dmode, val)";
            handler.appendChild(document.createTextNode("$.mmclient._fire(" + obj.mmcid + ", 'event', [dev, agent, grp, status, dmode, val];"));
            document.body.appendChild(handler);

            handler = document.createElement("script");
            handler.setAttribute("for", "mmclient_" + obj.mmcid);
            handler.event = "OnMMCReport(rlden, dmode, val)";
            handler.appendChild(document.createTextNode("$.mmclient._fire(" + obj.mmcid + ", 'report', [rlden, dmode, val];"));
            document.body.appendChild(handler);
            
            handler = document.createElement("script");
            handler.setAttribute("for", "mmclient_" + obj.mmcid);
            handler.event = "OnMMCQueue(dev,callid,grp,ani,dnis,status)";
            handler.appendChild(document.createTextNode("$.mmclient._fire(" + obj.mmcid + ", 'queue', [dev,callid,grp,ani,dnis,status];"));
            document.body.appendChild(handler);

            handler = document.createElement("script");
            handler.setAttribute("for", "mmclient_" + obj.mmcid);
            handler.event = "OnMMCLoad(dmode,val)";
            handler.appendChild(document.createTextNode("$.mmclient._fire(" + obj.mmcid + ", 'load', [dmode,val];"));
            document.body.appendChild(handler);

            handler = document.createElement("script");
            handler.setAttribute("for", "mmclient_" + obj.mmcid);
            handler.event = "OnTimer()";
            handler.appendChild(document.createTextNode("$.mmclient._fire(" + obj.mmcid + ", 'timer', [];"));
            document.body.appendChild(handler);
            
            handler = document.createElement("script");
            handler.setAttribute("for", "mmclient_" + obj.mmcid);
            handler.event = "OnMMCException(code,cause)";
            handler.appendChild(document.createTextNode("$.mmclient._fire(" + obj.mmcid + ", 'exception', [code,cause];"));
            document.body.appendChild(handler);

            var ret = 0;
            if (settings.isgrpusr) {
                activeX.viewDataMode = 1;
            }
            ret = activeX.MmRegister(settings.ip, settings.port, settings.uid);
            if (ret != 0) {
                $.mitools.dialog.ShowError("注册服务器失败, code=" + ret);
                return;
            }
        },
        _fire: function (id, type, paras) {
            var obj = $.mmclient.list[id.toString()];
            if (obj) {
                $.mmclient._trigger.call(type, paras);
            }
        },
        _trigger: function(type, paras){
            var obj = this;
            $(obj).trigger(type, paras);
            if (obj.settings && $.isFunction(obj.settings[type]))
                obj.settings[type].apply(obj, paras);
        },
        openTrace: function (file, level) {
            var activeX = this.activex;
            if (!activeX)
                return;
            activeX.OpenTrace(file, level);
        },
        localIp: function() {
            var activeX = this.activex;
            if (!activeX)
                return "";
            return activeX.localIPAddr;
        },
        close: function () {
            var activeX = this.activex;
            if (!activeX)
                return -1;
            return activeX.MmUnRegister();
        },
        monitorStart: function (grps, type) {
            var activeX = this.activex;
            if (!activeX)
                return -1;
            return activeX.MonitorStart(grps, type);
        },
        monitorStop: function () {
            var activeX = this.activex;
            if (!activeX)
                return -1;
            return activeX.MonitorStop();
        },
        startListen: function (dev, lip, lport) {
            var activeX = this.activex;
            if (!activeX)
                return -1;
            return activeX.StartRecListen(dev, lip, lport);
        },
        stopListen: function () {
            var activeX = this.activex;
            if (!activeX)
                return -1;
            return activeX.StopListen();
        },
        agentInfo: function (dev, agent) {
            var activeX = this.activex;
            if (!activeX)
                return "";
            return activeX.GetAgentInfo(dev, agent);
        },
        startTimer: function (span) {
            var activeX = this.activex;
            if (!activeX)
                return -1;
            return activeX.StartTimer(span);
        },
        stopTimer: function () {
            var activeX = this.activex;
            if (!activeX)
                return -1;
            return activeX.stopTimer();
        }
    });
})(jQuery);