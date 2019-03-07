/*!
 * miphone v1.0.0
 * Copyright 2016 Miplus.
 */
(function ($) {
    $.extend({
        miphoneUI: {
            version: "1.0.0",
            mid: 1
        }
    });

    $.fn.miphoneUI = function (options) {
        if (typeof options === 'string') {
            var fn = $.miphoneUI[options];
            if (!fn) {
                throw ("miphoneUI - No such method: " + options);
            }
            var args = $.makeArray(arguments).slice(1);
            return this.each(function () {
                return fn.apply(this, args);
            });
        }
        return this.each(function () {
            $.miphoneUI.init.call(this, options);
        });
    };

    $.extend($.miphoneUI, {
        callstate: {
            "default": [
                "",
                "icon_default"
            ],
            "ring": [
                "振铃中",
                "icon_ring"
            ],
            "connect": [
                "已接通",
                "icon_connect"
            ],
            "offhook": [
                "已摘机",
                "icon_offhook"
            ],
            "dial": [
                "拨号中",
                "icon_dial"
            ],
            "disconnect": [
                "已断开",
                "icon_disconnect"
            ],
            "unring": [
                "未接来电",
                "icon_unring"
            ],
            "onhook": [
                "已挂机",
                "icon_onhook"
            ],
            "hold": [
                "保留中",
                "icon_hold"
            ],
            "unhold": [
                "保留解除",
                "icon_unhold"
            ],
            "ivropen": [
                "IVR开启",
                ""
            ],
            "ivrclose": [
                "IVR关闭",
                ""
            ],
            "register": [
                "已注册",
                ""
            ],
            "unregister": [
                "已注销",
                ""
            ],
            "onhook_x": [
                "挂机",
                ""
            ],
            "inittrans": [
                "转接开始",
                ""
            ],
            "consult": [
                "咨询中",
                ""
            ],
            "comptrans": [
                "转接完成",
                ""
            ],
            "initconf": [
                "会议开始",
                ""
            ],
            "compconf": [
                "会议完成",
                ""
            ],
            "fasttrans": [
                "快转",
                ""
            ],
            "transfer": [
                "转接",
                ""
            ],
            "conference": [
                "会议",
                ""
            ],
            "beout": [
                "离开",
                ""
            ],
            "beback": [
                "回来",
                ""
            ],
            "pickuphold": [
                "保留代答",
                ""
            ],
            "disconsult": [
                "咨询结束",
                ""
            ],
            "alerting": [
                "回铃中",
                ""
            ],
            "progressing": [
                "处理中",
                ""
            ],
            "block": [
                "阻塞",
                ""
            ],
            "unblock": [
                "阻塞解除",
                ""
            ],
            "acdready": [
                "就绪",
                ""
            ],
            "acdnotready": [
                "离席",
                ""
            ],
            "acdworking": [
                "后处理",
                ""
            ],
            "acdlogin": [
                "已登录",
                ""
            ],
            "acdlogout": [
                "已登出",
                ""
            ]
        },
        init: function (options) {
            if (this.mid)
                return;
            var obj = this,
            settings = $.extend({}, options),
                id = $.miphoneUI.mid++;
            this.p = settings;
            var dev = settings.device;
            if(!dev)
                dev = "";
            this.mid = id;
            this.Container = $(this);
            this.Container.append("<div class='form-horizontal form-small form-thin' role='form'>"
                    + "<div class='reg form-group'><div class='col-sm-12'>"
                    + "<div class='info bg-info' >"
                    + "<div class='clearfix'>"
                    + "<div id='mip" + this.mid + "_icon' class='icon icon_default' css='icon_default'></div>"
                    + "<div class='info-number'></div>"
                    + "<a id='mip" + this.mid + "_close' class='mi-close' title='注销话机'><i class='icon-close' /></a>"
                    + "</div><div class='clearfix'>"
                    + "<div id='mip" + this.mid + "_duration' class='duration'></div>"
                    + "<div id='mip" + this.mid + "_device' class='device'>" + dev + "</div>"
                    //+ "<div id='mip" + this.mid + "_status' class='status'></div>"
                    + "</div>"
                    + "</div></div></div>"
                    + "<div class='reginit form-group'><div class='col-sm-12'><a href='#' id='mip" + this.mid + "_init' class='init btn btn-default btn-block'>使用话机</a></div></div>"
                    + "<div class='regin form-group'><label class='col-sm-4 control-label' for='mip"
                    + this.mid + "_idev'>分机</label><div class='col-sm-8'><input id='mip" + this.mid + "_idev' class='form-control' type='text' value='" + dev + "'/></div></div>"
                    + "<div class='regin form-group'><div class='col-sm-12'><button id='mip" + this.mid + "_register' class='btn btn-primary btn-block'>登录话机</button></div></div>"
                    + "<div class='reg form-group'><div class='col-sm-12'><div class='btn-toolbar' role='toolbar'>"
                    + "<div class='btn-group' role='group'>"
                    + "<button id='mip" + this.mid + "_ready' class='btn btn-success' title='就绪'><span class='icon-checkmark'></span></button>"
                    + "<button id='mip" + this.mid + "_notready' class='btn btn-warning dropdown-toggle' data-toggle='dropdown' title='离席'><span class='icon-exit'></span></button>"
                    + "</div>"
                    + "<div class='btn-group'>"
                    + "<button id='mip" + this.mid + "_hold' class='btn btn-primary' title='保留'><span class='icon-pause'></span></button>"
                    + "<button id='mip" + this.mid + "_transfer' class='btn btn-primary' title='转接'><span class='icon-arrow-right'></span></button>"
                    + "<button id='mip" + this.mid + "_conference' class='btn btn-primary' title='会议'><span class='icon-share'></span></button>"
                    + "</div>"
                    + "</div></div></div>"
                    //+ "<div class='reg form-group'><div class='col-sm-12'><div class='alert-info'><span>18601168868</span><span class='pull-right js-telarea'>北京</span></div></div></div>"
                    + "<div class='reg form-group'><div class='col-sm-12'><div class='input-group'><input id='mip" + this.mid + "_tel' class='form-control' type='text' value='' placeholder='输入外拨号码'/>"
                    + "<span class='input-group-btn'><button id='mip" + this.mid + "_ctrl' class='btn btn-default' title='拨号'><i class='icon-phone green'></i></button>"
                    + "</span></div></div></div>"
                    + "</div>");
            $(".reg", this.Container).hide();
            $(".regin", this.Container).hide();
            //this.Container.height($(".cont", this.Container).height());
            //*************
            //将传入的UI转换为jQuery对象集合
            //*************
            this.RegButtons = {
                init: $("#mip" + this.mid + "_init"),
                reg: $("#mip" + this.mid + "_register"),
                unreg: $("#mip" + this.mid + "_close")
            };
            this.Buttons = {
                ready: $("#mip" + this.mid + "_ready"),
                notready: $("#mip" + this.mid + "_notready"),
                //ctrl: $("#mip" + this.mid + "_ctrl"),
                hold: $("#mip" + this.mid + "_hold"),
                transfer: $("#mip" + this.mid + "_transfer"),
                conference: $("#mip" + this.mid + "_conference")
            };
            this.ButtonCtrl = $("#mip" + this.mid + "_ctrl");
            var Obj = this;
            this.Registered = false;
            this.acdLogin = false;
            this.RegButtons.init.on("click", function () {
                $(".regin", this.Container).show();
                $(".reginit", this.Container).hide();
                //Obj.Container.height($(".cont", Obj.Container).height());
                return false;
            });
            this.RegButtons.reg.click(function () {
                var num = Obj.Display.idev.val();
                if (num && num.length > 6) {
                    num = "0" + num;
                }
                else
                    num = null;
                $.miphoneUI.register.call(Obj, Obj.Display.idev.val(), Obj.p.agentId ? Obj.p.agentId:("A" + Obj.Display.idev.val()), 0, num);
                return false;
            });
            this.RegButtons.unreg.click(function () {
                if (Obj.Registered) {
                    if (confirm("确定要注销当前话机吗？")) {
                        if (Obj.acdLogin)
                            $.miphoneUI.logout.call(Obj, Obj.p.acdGroup);
                        else
                            $.miphoneUI.unRegister.call(Obj);
                    }
                }
                return false;
            });
            this.ButtonCtrl.click(function () {
                switch ($(this).data("ctrl")) {
                    case "answer":
                        $.miphoneUI.answer.call(Obj);
                        break;
                    case "dial":
                        $.miphoneUI.makeCall.call(Obj, Obj.Display.tel.val(), "", "", false);
                        break;
                    case "onhook":
                        $.miphoneUI.disconnect.call(Obj);
                        break;
                }
                return false;
            });
            //this.Buttons.onhook.click(function () {
            //    Obj.Disconnect();
            //    return false;
            //});
            //this.Buttons.dial.click(function () {
            //    Obj.MakeCall(Obj.Display.tel.val(), "", "", false);
            //    return false;
            //});
            this.Buttons.ready.click(function () {
                $.miphoneUI.ready.call(Obj);
                return false;
            });
            this.Buttons.notready.click(function () {
                $.miphoneUI.notready.call(Obj);
                return false;
            });
            this.Buttons.hold.click(function () {
                $.miphoneUI.hold.call(Obj);
                return false;
            });
            this.Buttons.transfer.click(function () {
                $.miphoneUI.transfer.call(Obj);
                return false;
            });
            this.Buttons.conference.click(function () {
                $.miphoneUI.conference.call(Obj);
                return false;
            });

            //$.miphoneUI.hideAllButtons.call(Obj);

            this.Display = {
                //logout: $(ui.logout),
                //status: $("#mip" + this.mid + "_status"),
                icon: $("#mip" + this.mid + "_icon"),
                tel: $("#mip" + this.mid + "_tel"),
                //ani: $(""), //#mip" + this.mid + "_ani"),
                //dnis: $(""), //#mip" + this.mid + "_dnis"),
                agent: $(""), //#mip" + this.mid + "_agent"),
                device: $("#mip" + this.mid + "_device"),
                idev: $("#mip" + this.mid + "_idev"),
                duration: $("#mip" + this.mid + "_duration"),
                number: $(".info-number", this.Container),
                starttm: new Date()
            };

            this.Server = {
                Ip: "",
                Port: 0
            };
            this.ColorSetting = {
                bgColor: '#0a6cce',
                butbgColor: '#e6e6fa',
                butFocusColor: '#ffcc66'
            };

            //动态属性
            this.Operator = {
                OpeId: "",
                Device: ""
            };
            this.LastError = {
                Code: 0,
                Cause: ""
            };
            this.Error = {
                Count: 0,
                Xhr: null
            };
            this.EventError = {
                Count: 0,
                Xhr: null
            };
            this.CallStatus = {};
            this.LastCallStatus = {};
            this.AgentStatus = {};
            this.VoiceStatus = {};

            this.Cannext = true;
            this.SurveyNum = "";
            this.HoldStatus = "";

            this.CallList = new CallList();


            this.CallInfo = {
                CallId: "",
                CaseId: "",
                CallHistId: "",
                Data: ""
            };

            this.DialInfo = {
                MethodName: "",
                Number: "",
                RealNumber: ""
            };
            this.Group = "";

            //******************
            //创建电话接口对象
            //******************
            this.Phone = (typeof MiPhoneCore != "undefined") ? MiPhoneCore : null || Object.create($.miphone);
            this.Phone.init(options.serverPath ? { "url": options.serverPath } : {});

            $.miphoneUI.loadState.call(this);

            //******************
            //响应事件
            //******************
            this.Phone.onAgentEvent(function (Result) {
                Obj.AgentStatus = Result;
                $.miphoneUI.onAgentStatus.call(Obj, Result);
                $.miphoneUI.saveState.call(Obj);
            });

            this.Phone.onDeviceEvent(function (Result) {
                Obj.CallStatus = Result;
                $.miphoneUI.onCallStatus.call(Obj, Result);
                $.miphoneUI.saveState.call(Obj);
            });

            this.Phone.onVoiceEvent(function (Result) {
                Obj.VoiceStatus = Result;
                $.miphoneUI.saveState.call(Obj);
            });

            this.Phone.onReturn(function (Result, Command) {
                Obj.Error.Xhr = null;
                Obj.Error.Count = 0;
                if (Result.Code != 0) {
                    alert("Command=" + Command.Command + ",ret=" + Result.Code + ",cause=" + Result.Cause);
                    if(Result.Code=='16393' || Result.Code == '4')
                        $.miphoneUI.onUnregister.call(this);
                }
            });

            this.Phone.onError(function (Error, Command, Count) {
                //DoCommand异步返回的错误
                Obj.Error.Xhr = Error;
                Obj.Error.Count = Count;
                //var win = window.showModelessDialog('dialog.htm', Error, 'status:no;dialogHeight:300px;dialogWidth:400px;center:yes;scroll:yes;resizable:yes');
                var win = window.open('', '', 'status=no,height=300,width=400,center=yes,scroll=yes,resizable=yes');
                if (Error.responseText && Error.responseText.length)
                    win.document.write(Error.responseText);
                else
                    win.document.write("Error:" + Error);
            });

            this.Phone.onEventError(function (Error, Count) {
                //GetEvent异步返回的错误

                Obj.EventError.Xhr = Error;
                Obj.EventError.Count = Count;
                if (Count >= 60) {
                }
                var win = window.open('');
                win.document.write(Error.responseText);
            });

            this.Phone.onEvent(function (Error) {
                //清除上次EventError的错误
                Obj.EventError.Xhr = null;
                Obj.EventError.Count = 0;
            });
        },

        onAgentStatus: function (Result) {//devNum,agentID,grp,status,szParam) {
            //alert("OnAgentStatus:"+status+"..");
            window.status = "OnAgentStatus:" + Result.status + "..";
            $.miphoneUI.setAgentStatus.call(this, Result.status);
            if (this.LoadingState)
                return;
            if (window.Atx_OnAgentStatus != null) {
                var s = "Atx_OnAgentStatus('" + Result.status + "')";
                window.setTimeout(s, 1);
            }
        },

        onCallStatus: function (Result) {
            var status = Result.status;
            //Obj.SetCallState(status);
            switch (status) {
                case "register":
                    $.miphoneUI.onRegister.call(this, Result);
                    break;
                case "ring":
                    $.miphoneUI.onCallIncoming.call(this, Result);
                    break;
                case "connect":
                    $.miphoneUI.onConnect.call(this, Result);
                    break;
                case "offhook":
                    $.miphoneUI.onOffhook.call(this, Result);
                    break;
                case "unring":
                    $.miphoneUI.onCallAbandoned.call(this, Result);
                    break;
                case "conference":
                    $.miphoneUI.onConferenced.call(this, Result);
                    break;
                case "consult":
                    $.miphoneUI.onConsultation.call(this, Result);
                    break;
                case "dial":
                    $.miphoneUI.onDialing.call(this, Result);
                    break;
                case "disconnect":
                    $.miphoneUI.onDisconnected.call(this, Result);
                    break;
                case "hold":
                    $.miphoneUI.onHold.call(this, Result);
                    break;
                case "onhook":
                    $.miphoneUI.onOnhook.call(this, Result);
                    break;
                case "transfer":
                    $.miphoneUI.onTransfered.call(this, Result);
                    break;
                case "unhold":
                    $.miphoneUI.onUnHold.call(this, Result);
                    break;
                case "unregister":
                    $.miphoneUI.onUnregister.call(this, Result);
                    break;
                case "alerting":
                    $.miphoneUI.onAlerting.call(this, Result);
                    break;
            };
        },
        //function Atx_OnCallIncoming(callid, ucallid, ani, dnis, grp, calldata, ringmode)
        onCallIncoming: function (Result) {
            window.status = "OnCallIncoming..";
            //if (!this.Cannext)
            //    return;
            this.CallInfo.CaseId = Result.caseid;
            //m_playagent = "IN";

            this.CallList = new CallList();
            this.CallList.setCall(Result.callid, "IN");

            //this.Display.ani.text(Result.ani);
            //this.Display.dnis.text(Result.dnis);
            this.Display.number.text(Result.ani);
            this.Display.tel.val(Result.ani);
            this.CallInfo.Data = Result.data;
            $.miphoneUI.setCallStatus.call(this, "Ring");
            if (this.LoadingState)
                return;
            //if (window.Atx_OnCallIncoming != null) {
            //    var s = "Atx_OnCallIncoming('" + Result.callid + "','" + Result.caseid + "','" + Result.ani + "','" + Result.dnis + "','" + Result.grp + "','" + Result.data + "','" + "" + "')";
            //    window.setTimeout(s, 1);
            //}
            if (window.OnRing != null) {
                //function OnRing(ani, dnis, caseid, calldata) {
                var s = "OnRing('" + Result.ani + "','" + Result.dnis + "','" + Result.caseid + "','" + Result.data + "')";
                window.setTimeout(s, 1);
            }
        },
        //function Atx_OnDialing(callid, ucallid, ani, dnis)
        onDialing: function (Result) {//callID,caseID,dnis,szPara) {
            //window.status="OnDialing:" + Result.dnis + "..";
            this.CallInfo.CaseId = Result.caseid;
            //this.Display.dnis.text(Result.dnis);
            //this.Display.ani.text(Result.ani);
            //this.Display.number.text(Result.dnis);
            $.miphoneUI.setCallStatus.call(this, "Dial");
            if (this.LoadingState)
                return;
            //if (window.Atx_OnDialing != null) {
            //    var s = "Atx_OnDialing('" + Result.caseid + "','" + Result.caseid + "','" + Result.ani + "','" + Result.dnis + "')";
            //    window.setTimeout(s, 1);
            //}
            if (window.OnDialing != null) {
                var s = "OnDialing('" + Result.ani + "','" + Result.dnis + "','" + Result.caseid + "','')";
                window.setTimeout(s, 1);
            }
        },
        //function Atx_OnConnect(callid, ucallid, ani, dnis)
        onConnect: function (Result) {//callID,ani,dnis,caseID,szParam) {
            window.status = "OnConnect..";
            $.miphoneUI.setCallStatus.call(this, "Connect");
            this.CallList.setCall(Result.callid, "CON");

            if (this.LoadingState)
                return;
            if (window.Atx_OnConnect != null) {
                var s = "Atx_OnConnect('" + Result.caseID + "','" + Result.caseid + "','" + Result.ani + "','" + Result.dnis + "')";
                window.setTimeout(s, 1);
            }
        },

        onHold: function (Result) {//callID) {
            window.status = "OnHold..";
            this.HoldStatus = "hold";
            this.Buttons.hold.attr("title", "恢复").find("span").removeClass("icon-pause").addClass("icon-play2");
            $.miphoneUI.setCallStatus.call(this, "Hold");
            if (this.LoadingState)
                return;
            if (window.Atx_OnHold != null) {
                var s = "Atx_OnHold()";
                window.setTimeout(s, 1);
            }
        },

        onUnHold: function (Result) {//callID) {
            window.status = "OnUnHold..";
            this.HoldStatus = "";
            this.Buttons.hold.attr("title", "保留").find("span").removeClass("icon-play2").addClass("icon-pause");

            $.miphoneUI.setCallStatus.call(this, "Connect");
            if (this.LoadingState)
                return;
            if (window.Atx_OnUnHold != null) {
                var s = "Atx_OnUnHold()";
                window.setTimeout(s, 1);
            }
        },

        onConsultation: function (Result) {//callID,callID2,cstType,szParam,lzParam) {
            window.status = "OnConsultation..";
            //SetPhoneStatus("Consult"); //avaya no this event
            this.HoldStatus = "consult";
            this.Buttons.hold.attr("title", "恢复").find("span").removeClass("icon-pause").addClass("icon-play2");
            this.Buttons.transfer.attr("title", "完成转接");
            $.miphoneUI.setCallStatus.call(this, "Consult");
        },

        onTransfered: function (Result) {//callID,dir,szParam,lzParam) {
            window.status = "OnTransfered..";
            this.HoldStatus = "";
            this.Buttons.hold.attr("title", "保留").find("span").removeClass("icon-play2").addClass("icon-pause");
            this.Buttons.transfer.attr("title", "转接");
            $.miphoneUI.setCallStatus.call(this, "Disconnect");
        },

        onConferenced: function (Result) {//callID,dir,szParam,lzParam) {
            window.status = "OnConferenced..";
        },

        onDisconnected: function (Result) {//callID) {
            if (this.CallList.removeCall(Result.callid) > 0) {
                return;
            }
            window.status = "OnDisconnected..";
            $.miphoneUI.setCallStatus.call(this, "Disconnect");
            if (this.LoadingState)
                return;
            if (window.Atx_OnDisconnected != null) {
                var s = "Atx_OnDisconnected()";
                window.setTimeout(s, 1);
            }
        },

        onOffhook: function (Result) {//callID,caseID) {
            this.CallList.setCall(Result.callid, "OFF");

            window.status = "OnOffHook..";
            $.miphoneUI.setCallStatus.call(this, "OffHook");
            if (this.LoadingState)
                return;
            if (window.Atx_OnOffHook != null) {
                var s = "Atx_OnOffHook()";
                window.setTimeout(s, 1);
            }
        },
        //function Atx_OnOnHook(callid, ucallid)
        onOnhook: function (Result) {//callID) {
            //if(this.CallList.removeCall(callID) > 0)
            //    return;

            window.status = "OnOnHook..";
            $.miphoneUI.setCallStatus.call(this, "OnHook");
            this.HoldStatus = "";
            this.Buttons.hold.attr("title", "保留").find("span").removeClass("icon-play2").addClass("icon-pause");
            this.Buttons.transfer.attr("title", "转接");
            this.Buttons.conference.attr("title", "会议");

            //this.Buttons.transfer.text("转接");
            this.Buttons.transfer.attr("title", "转接");
            //this.Buttons.conference.text("会议");
            this.Buttons.conference.attr("title", "会议");
            if (this.LoadingState)
                return;
            if (window.Atx_OnOnHook != null) {
                var s = "Atx_OnOnHook('" + Result.caseID + "','" + Result.caseid + "')";
                window.setTimeout(s, 1);
            }
        },

        onCallAbandoned: function (Result) {//callID,szParam,lzParam) {
            if (this.CallList.removeCall(Result.callid) > 0)
                return;

            window.status = "UnRing..";
            $.miphoneUI.setCallStatus.call(this, "UnRing");
            if (this.LoadingState)
                return;
            if (window.Atx_OnCallAbandoned != null) {
                var s = "Atx_OnCallAbandoned()";
                window.setTimeout(s, 1);
            }
        },

        onException: function (Result) {//code,cause) {
            $.miphoneUI.setCallStatus.call(this, "Exception");
            if (this.LoadingState)
                return;
            if (window.Atx_OnException != null) {
                var s = "Atx_OnException('" + code + "','" + cause + "')";
                window.setTimeout(s, 1);
            }
        },

        onCallQueue: function (Result) {//valType,val) {
            window.status = "OnCallQueue:" + val + "..";
            $.miphoneUI.setCallQueue.call(this, valType, val);
            if (this.LoadingState)
                return;
            if (window.Atx_OnCallQueue != null) {
                var s = "Atx_OnCallQueue('" + valType + "','" + val + "')";
                window.setTimeout(s, 1);
            }
        },

        showRegistered: function () {
            $(".reg", this.Container).show();
            $(".reg .btn", this.Container).show();
            $(".regin", this.Container).hide();
            $(".reginit", this.Container).hide();

            var obj = this;
            //this.Regbutton.val("注销话机");
            this.interval = window.setInterval(function () {
                $.miphoneUI.onTimer.call(obj);
            }, 500);
        },

        onRegister: function (Result) {
            window.status = "OnRegister";
            this.Display.agent.text(Result.agent);
            this.Display.device.text(Result.dev);
            this.Registered = true;

            if(this.p.acdGroup)
                $.miphoneUI.login.call(this, this.p.acdGroup);
            $.miphoneUI.showRegistered.call(this);
            $.miphoneUI.setCallStatus.call(this, "register");
            //return;
            //this.Container.height($(".cont", this.Container).height() + this.Buttons.ctrl.height());
            if (this.LoadingState)
                return;
            if (window.Atx_OnRegister != null) {
                var s = "Atx_OnRegister()";
                window.setTimeout(s, 1);
            }
        },

        showUnregistered: function () {
            $(".reg", this.Container).hide();
            $(".reginit", this.Container).show();
            //this.Regbutton.val("登录话机");
            clearInterval(this.interval);
        },

        onUnregister: function (Result) {
            //$.miphoneUI.hideAllButtons.call(this);
            this.Registered = false;
            $.miphoneUI.showUnregistered.call(this);
            //this.Container.height($(".cont", this.Container).height());
            if (this.LoadingState)
                return;
            if (window.Atx_OnUnregister != null) {
                var s = "Atx_OnUnregister()";
                window.setTimeout(s, 1);
            }
        },

        onAlerting: function(Result){
            window.status = "onAlerting...";
        },

        saveState: function () {
            var State = {
                RG: this.Registered,
                CS: this.CallStatus,
                AS: this.AgentStatus,
                VS: this.VoiceStatus,
                CN: this.Cannext,
                SN: this.SurveyNum,
                HS: this.HoldStatus,
                OP: this.Operator,

                CL: this.CallList.list,
                CI: this.CallInfo,
                DI: this.DialInfo,
                DP: {
                    i: this.Display.icon.attr("css"),
                    s: this.Display.icon.attr("title"),//this.Display.status.text(),
                    st: this.Display.starttm.getTime(),
                    t: this.Display.tel.text()
                },
                G: this.Group
            };
            $.cookie("phoneUI", JSON.stringify(State), { path: '/' });
        },

        loadState: function () {
            var s = $.cookie("phoneUI");
            if (s == null)
                return;
            var State = $.parseJSON(s);
            if (State == null)
                return;
            this.LoadingState = true;
            if (State.OP)
                this.Operator = State.OP;
            else
                this.Operator.Device = "";
            this.Registered = State.RG;
            if (this.Registered) {
                $.miphoneUI.showRegistered.call(this);
            }
            this.Cannext = State.CN;
            this.SurveyNum = State.SN;
            this.HoldStatus = State.HS;

            this.CallList.list = State.CL;
            this.CallInfo = State.CI;

            //    this.Display.ani.text(State.Display.ani);
            //    this.Display.dnis.text(State.Display.dnis);
            this.Display.agent.text(this.Phone.OpeId);
            this.Display.device.text(this.Phone.Device);
            this.Display.icon.removeClass(this.Display.icon.attr("css"));
            this.Display.icon.addClass(State.DP.i);
            this.Display.icon.attr("css", State.DP.i);
            //this.Display.status.text(State.DP.s);
            this.Display.icon.attr("title", State.DP.s);
            this.Display.tel.text(State.DP.t);

            this.AgentStatus = State.AS;
            if (this.AgentStatus != null && this.AgentStatus.status != null)
                $.miphoneUI.setAgentStatus.call(this, this.AgentStatus.status);
            this.CallStatus = State.CS;
            if (this.CallStatus != null)
                $.miphoneUI.onCallStatus.call(this, this.CallStatus);
            this.VoiceStatus = State.VS;

            this.Display.starttm.setTime(State.DP.st);

            this.DialInfo = State.DI;
            this.Group = State.G;
            this.LoadingState = false;
        },

        register: function (devnum, agentid, Answermode, number) {
            var dwRet = 0;
            window.status = 'phone Register>' + devnum + "," + agentid + "," + number;

            //OpenTrace('c:\\RaAgentXlogs\\rax.log');

            this.Operator.OpeId = agentid;
            this.Operator.Device = devnum;
            //alert('callregist'+devnum + agentid);
            this.Phone.register(devnum, agentid, Answermode, number);
            return;
        },

        unRegister: function () {
            window.status = 'unregister..';
            this.Phone.unregister();
        },

        destroy: function () {
            window.status = 'Destroy..';
            var Obj = this;
            window.setTimeout(function () {
                $.miphoneUI.unRegister.call(Obj)
            }, 1);
        },

        isSucceedAcd: function () {
            //    var dwRet = AtxAgentX.LastCode;
            //    //0x=200E
            return true;
        },

        login: function(group){
            this.Phone.acdLogin(group);
        },
        
        logout: function (group) {
            this.Phone.acdLogout(group);
        },
        ready: function () {
            this.Phone.acdReady();
        },
        notready: function () {
            this.Phone.acdNotReady();
        },

        answer: function () {
            this.Phone.answer();
            return 0;
        },

        disconnect: function () {
            this.Phone.disconnect();
            return 0;
        },

        hold: function () {
            if (this.HoldStatus == "") {
                this.Phone.hold();

            } else {
                this.Phone.retrieve();
            }
            return 0;

        },

        unHold: function () {
            this.Phone.retrieve();
            return 0;
        },

        blindTransfer: function (rmt, data) {
            if (rmt && rmt.length > 0)
                this.Phone.blindTransfer(rmt, data);
        },

        survey: function () {
            var sdata = "SURVEY" + this.CallInfo.CaseId;
            //满意度调查时先保存数据
            //SetCallData(sdata);
            var rmt = this.SurveyNum;
            $.miphoneUI.blindTransfer.call(this, rmt, sdata);
        },

        fastTransfer: function (rmt, data) {
            return $.miphoneUI.blindTransfer.call(this, rmt, data);
        },

        consultTran: function (rmt, data) {
            if (rmt && rmt.length > 0)
                this.Phone.consultTran(rmt, data);
        },

        transfer: function () {
            if (this.HoldStatus == "")
                $.miphoneUI.consultTran.call(this, this.Display.tel.val(), "");
            else
                this.Phone.transfer();
        },

        consultConf: function (rmt, data) {
            this.Phone.consultConf(rmt, data);
        },

        conference: function () {
            if (this.HoldStatus == "")
                $.miphoneUI.consultConf.call(this, this.Display.tel.val(), "");
            else
                this.Phone.conference();
        },

        //**************
        makeCall: function (rmt, grp, ani, decode) {
            //取ANI
            //var ani = ACDCode();

            this.Phone.makeCall(rmt, grp, ani, decode);
        },

        playFile: function (file, decode) {
            this.Phone.playFile(file, decode);
        },

        hideAllButtons: function () {
            for (var name in this.Buttons) {
                //this.Buttons[name].attr("disabled", true);
                //this.Buttons[name].css("background", 'url(image/smallbutton_bg_w.gif)');
                this.Buttons[name].hide();
                //a[i].style.backgroundColor='#EBEAD8';
            }
        },
        
        disableAllButtons: function () {
            for (var name in this.Buttons) {
                //this.Buttons[name].attr("disabled", true);
                //this.Buttons[name].css("background", 'url(image/smallbutton_bg_w.gif)');
                this.Buttons[name].prop("disabled", true);
                //a[i].style.backgroundColor='#EBEAD8';
            }
        },
        showButtons: function () {
            $.miphoneUI.disableAllButtons.call(this);
            if (!arguments)
                return;
            for (var i = 0; i < arguments.length; i++) {
                var o = arguments[i];
                if (o) {
                    //o.style.display='inline';
                    //o.attr("disabled", false);
                    o.prop("disabled", false);
                    //o.css("background", "url(image/smallbutton_bg.gif)");
                    //o.style.backgroundColor='red';image/smallbutton_bg.gif
                }
            }
        },

        setAgentStatus: function (status) {
            var s = status.toLowerCase();
            switch (s) {
                case 'ready':
                case 'acdready':
                    $.miphoneUI.showButtons.call(this, this.Buttons.notready, this.Buttons.logout);
                    //        m_AcwCallRefused = false;
                    break;
                case 'notready':
                case 'acdnotready'://'数字话机要加一个makecall
                    $.miphoneUI.setCtrlButton.call(this, "dial");
                    $.miphoneUI.showButtons.call(this, this.Buttons.ready, this.Buttons.logout);
                    break;
                case 'acw':
                case 'acdacw':
                case "acdworking":
                    $.miphoneUI.setCtrlButton.call(this, "dial");
                    $.miphoneUI.showButtons.call(this, this.Buttons.ready, this.Buttons.notready);
                    break;
                case 'login':
                case 'acdlogin':
                    this.acdLogin = true;
                    $.miphoneUI.setCtrlButton.call(this, "dial");
                    $.miphoneUI.showButtons.call(this, this.Buttons.ready, this.Buttons.notready);
                    break;
                case 'logout':
                case 'acdlogout':
                    this.acdLogin = false;
                    $.miphoneUI.showButtons.call(this);
                    $.miphoneUI.destroy.call(this);
                    break;
            }
            //    m_agentstatus = s;
            $.miphoneUI.setStatusImg.call(this, s);
        },

        setStatusImg: function (status) {
            //alert("SetStatusImg(" + status + ")");
            var css = "";
            var s = status.toLowerCase();
            var state = "";
            try {
                css = $.miphoneUI.callstate[s][1];
                state = $.miphoneUI.callstate[s][0];
            }
            catch (e) {
            }
            if (css == "") {
                css += "icon_default";
            }
            this.Display.icon.removeClass(this.Display.icon.attr("css"));
            this.Display.icon.addClass(css);
            this.Display.icon.attr("css", css);
            //this.Display.status.text(state);
            this.Display.icon.attr("title", state);
            this.Display.starttm = new Date();
        },

        setCtrlButton: function (ctrl) {
            this.ButtonCtrl.data("ctrl", ctrl);
            var i = this.ButtonCtrl.find("i");
            switch (ctrl) {
                case "dial":
                    this.ButtonCtrl.attr("title", "拨号");
                    i.removeClass("red icon-phone-hang-up")
                        .addClass("green icon-phone");
                    break;
                case "answer":
                    this.ButtonCtrl.attr("title", "应答");
                    i.removeClass("red icon-phone-hang-up")
                        .addClass("green icon-phone");
                    break;
                case "onhook":
                    this.ButtonCtrl.attr("title", "挂机");
                    i.removeClass("green icon-phone")
                        .addClass("red icon-phone-hang-up");
                    break;
            }
        },

        setCallStatus: function (status) {
            var s = status.toLowerCase();
            var m_callstatus = this.LastCallStatus.status;
            if (m_callstatus == s)
                return;
            this.LastCallStatus = this.CallStatus;
            if ((s == 'disconnect') &&
                (m_callstatus == 'disconnect' ||
                m_callstatus == 'onhook')) {
                if (this.AgentStatus.status == "acdworking")
                    $.miphoneUI.showButtons.call(this, this.Buttons.ready, this.Buttons.notready);
                return;
            }

            switch(s){
                case 'register':
                    $.miphoneUI.setCtrlButton.call(this, "dial");
                    break;
                    case 'ring':
                //ShowButtons(_answer);
                this.Cannext = false;
                $.miphoneUI.setCtrlButton.call(this, "answer");
                $.miphoneUI.showButtons.call(this);
                //this.StartFlash();
                break;
            case 'dial':
                $.miphoneUI.setCtrlButton.call(this, "onhook");
                $.miphoneUI.showButtons.call(this);
                break;
            case 'connect':
                this.Cannext = false;
                //this.StopFlash();
                $.miphoneUI.setCtrlButton.call(this, "onhook");
                if (this.HoldStatus == "")
                    $.miphoneUI.showButtons.call(this, this.Buttons.onhook, this.Buttons.transfer, this.Buttons.hold); //, this.Buttons.conference, this.Buttons.onhook, this.Buttons.customersurvey);
                break;
            case 'hold':
                $.miphoneUI.showButtons.call(this, this.Buttons.hold);
                break;
            case 'unring':
                case 'onhook':
                //this.StopFlash();
                //        if (this.AgentStatus.status != 'acw') {
                //            var sacw = 'document.all("' + element.id + '").Acw()';
                //            window.setTimeout(sacw, 1);
                //        }
                //        else {
                //$.miphoneUI.showButtons.call(this, this.Buttons.ready, this.Buttons.notready, this.Buttons.dial);
                $.miphoneUI.setCtrlButton.call(this, "dial");
                if(this.acdLogin)
                    $.miphoneUI.showButtons.call(this, this.Buttons.ready, this.Buttons.notready);
                    //        }
                break;
            case 'offhook':
                $.miphoneUI.setCtrlButton.call(this, "dial");
                $.miphoneUI.showButtons.call(this);
                break;
            case 'exception':
                //StopFlash();
                $.miphoneUI.showButtons.call(this);
                $.miphoneUI.destroy.call(this);
                break;
            case 'consult':
                $.miphoneUI.setCtrlButton.call(this, "onhook");
                $.miphoneUI.showButtons.call(this, this.Buttons.transfer, this.Buttons.hold);
                break;
            }
            //    m_callstatus = s;
            //_acdstatus.innerHTML =s;
            $.miphoneUI.setStatusImg.call(this, s);
            //_callstatus.innerHTML=AsString(s);
        },

        onTimer: function () {
            if (!this.Display.starttm)
                return;
            var now = new Date(), span = new Date(), offset = now.getTimezoneOffset() * 60000;
            span.setTime(now - this.Display.starttm + offset);
            this.Display.duration.text($.format.date(span, 'HH:mm:ss'));
        },
    });

    function Call(id, status) {
        this.mid = id;
        this.status = status;
    };

    //*****************
    //呼叫列表及呼叫对象，用于转接、会议时接收到多个呼叫使用
    //*****************
    function CallList() {
        this.list = [];
    }

    CallList.prototype.setCall = function (callId, status) {
        var bfind = false;
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].id == callId) {
                this.list[i].status = status;
                bfind = true;
                break;
            }
        }
        if (!bfind) {
            this.list.push(new Call(callId, status));
        }
    }

    CallList.prototype.removeCall = function (callId) {
        var bfind = false;
        var length = this.list.length;
        for (var i = 0; i < length; i++) {
            if (!bfind && this.list[i].id == callId) {
                length--;
                bfind = true;
            }
            if (bfind) {
                if (i < length)
                    this.list[i] = this.list[i + 1];
            }
        }
        this.list.length = length;
        //alert("removeCall(callId=" + callId + ") length=" + length);
        return length;
    }

})(jQuery);