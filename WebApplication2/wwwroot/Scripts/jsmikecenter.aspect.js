
var theMikeAtx = top.external;
var crm_calltype = 'IN';
var crm_ani, crm_dnis;
var sendussd = true;
window.onload = function () {
    try {
        theMikeAtx.vAutoSetAcwStatus = false;
        theMikeAtx.ClearNotReadyCauseItem();
	//    theMikeAtx.SetNotReadyCauseItem("工作", 3, true);
	theMikeAtx.SetNotReadyCauseItem("工作", 10, true);
        theMikeAtx.SetNotReadyCauseItem("回访", 12, false);
        theMikeAtx.SetNotReadyCauseItem("会议", 6, false);
        theMikeAtx.SetNotReadyCauseItem("培训", 11, false);
        theMikeAtx.SetNotReadyCauseItem("小休", 8, false);
        theMikeAtx.SetNotReadyCauseItem("就餐", 9, false);

//        theMikeAtx.SetNotReadyCauseItem("会议", 6, true);
//        theMikeAtx.SetNotReadyCauseItem("小休", 8, false);
//        theMikeAtx.SetNotReadyCauseItem("会议", 9, false);
//        theMikeAtx.SetNotReadyCauseItem("培训", 10, false);
//        theMikeAtx.SetNotReadyCauseItem("小休", 11, false);
//        theMikeAtx.SetNotReadyCauseItem("就餐", 12, false);
   

        
        theMikeAtx.SetCallOutPrefix("0");
        theMikeAtx.SetCTISrvParam("iswitch", 2);

        theMikeAtx.SetDailListItem("防伪", "4068");
        theMikeAtx.SetDailListItem("满意度", "4069");

        theMikeAtx.vSurveyCallCode = "4069";

     
        theMikeAtx.vDiscallByPhone = true;
        //theMikeAtx.MkSetPubEnv("ctiipaddr", "121.199.14.232");
        //theMikeAtx.MkSetPubEnv("ctiport", "8888");
        theMikeAtx.MkSetPubEnv("ctiipaddr", "118.178.231.52");
        theMikeAtx.MkSetPubEnv("ctiport", "8860");
        theMikeAtx.vSIPRegPwdMode = 0;
        if (_gdata && _gdata.Empid)
            theMikeAtx.vLoginGroup = _gdata.Empid;
        //jomoo=6c26652d2c263b66b76235b182ddd9df,default=04522949153354b6,1001-1029
        //theMikeAtx.SetSIPSrvParam("121.199.14.232", 12076, "04522949153354b6");
        theMikeAtx.SetSIPSrvParam("118.178.231.52", 12060, "miplus!2016");
        theMikeAtx.SetWindowSize(-1, -1);

    } catch (e) { }

}

function SetLoginAgentID(agid)
{
    theMikeAtx.vLogoinAgentID=agid;
}

function SetLoginDeviceID(dn)
{
    theMikeAtx.vLoginDeviceID=dn;
}

function GetShakeUCID()
{
    return theMikeAtx.vShakeUCID;
}

function GetShakeUCData()
{
    return theMikeAtx.vShakeUCData;
}


function AtxSetOpenWinScript(title,script) {
    theMikeAtx.SetOpenWinScript(title, script);
}

function AtxCmdLogin(ip, port, dn, agentid) {

    theMikeAtx.SetCmdTimeout("CTI", 5);
    var ret = theMikeAtx.CmdRegister(ip, port, dn, agentid);
    if (ret == 0) {
        ret = theMikeAtx.CmdLogin(agentid, "5001");
        if(ret == 0x4001) ret=0;
        if (ret != 0) {
            theMikeAtx.CmdUnRegister();
        }
    }
    return ret;
}

function AtxCmdLogout() {
    var ret = theMikeAtx.CmdLogout();
    
    theMikeAtx.CmdUnRegister();

    return ret;
}

function AtxCmdReady()
{
        var ret = theMikeAtx.CmdAcdReady();
        if (clearCtiInfo)
            clearCtiInfo();
        return ret;
}

function AtxCmdNotReady(cause) {
    var ret = theMikeAtx.CmdAcdNotReady(cause);
    if (clearCtiInfo)
        clearCtiInfo();
    return ret;
}

function AtxCmdAcw() {
    var ret = theMikeAtx.CmdAcdAcw();
    return ret;
}

function AtxCmdHangup() {
    var ret = theMikeAtx.CmdHangup();
    return ret;
}

function AtxCmdMakeCall(rmt, timeout){
    try
    {
        var ret = theMikeAtx.CmdMakeCall(rmt,"","",timeout);
        return ret;
    }
    catch(e) {}
}

function AtxCmdFastTransfer(rmt, data) {
    var ret = theMikeAtx.CmdFastTransfer(rmt, data);
    return ret;
}

function AtxCmdReqQueue() {
    var ret = theMikeAtx.CmdReqQueue("", "0", "");
    return ret;
}

function AtxCmdCancelQueue() {
    var ret = theMikeAtx.CmdCancelQueue();
    return ret;
}

/////////////EVENT//////////////////////////////////////////
function Atx_OnAcdLogin(agent, grp, src, data) {
    AtxCmdReqQueue();
}

function Atx_OnAcdLogout(agent, grp, src, data) {
}

function Atx_OnCallIncoming(callid, ucallid, ani, dnis, grp, calldata, ringmode) {
    //var ucid = GetShakeUCID();
    //var ucdata = GetShakeUCData();
    crm_calltype = 'IN';
    sendussd = false;
    crm_ani = ani;
    crm_dnis = dnis;
    OnRing(ani, dnis, ucallid, calldata);
}

function Atx_OnAgentAcdStatus(agent, grp, status, src, data) {

}

function Atx_OnDialing(caseid, callid, ani, dnis) {
   
    if (OnDialing) {
        OnDialing(ani, dnis, caseid, '');
    }
    //setTimeout(sendDialUssd, 3000);
}
function sendDialUssd()
{
    if (sendussd == false) {
        sendussd = true;
        $.wcf.invoke({
            async: true,
            url: $.mitools.path + "/unis/Data?t=" + new Date().valueOf(),
            type: "GET",
            data: {
                type: "ussd",
                key: "send",
                ani: crm_calltype == 'IN' ? crm_ani : "055166184301",
                dnis: crm_dnis,
                calltype: crm_calltype,
                callevent: "calling",
                path: "message"
            },
            success: function (result) {

            }
        });
    }
}

function Atx_OnConnect()
{
    //测试屏信
    //测试屏信,只有外呼的时候发屏信
    //if( crm_calltype == 'OUT' && sendussd ==false){
    //    sendussd = true;
    //    $.wcf.invoke({
    //        async: true,
    //        url: $.mitools.path + "/unis/Data?t=" + new Date().valueOf(),
    //        type: "GET",
    //        data: {
    //            type: "ussd",
    //            key: "send",
    //            ani: crm_calltype == 'IN' ? ani : "055166184301",
    //            dnis: dnis,
    //            calltype: crm_calltype,
    //            callevent: "calling",
    //            path: "message"
    //        },
    //        success: function (result) {

    //        }
    //    });
    //}
}

function Atx_OnDisconnect() {
    
}

function Atx_OnOffHook(callid, ucallid)
{

}

function Atx_OnOnHook(callid, ucallid)
{
    //if (sendussd == false) {
    //    $.wcf.invoke({
    //        async: true,
    //        url: $.mitools.path + "/unis/Data?t=" + new Date().valueOf(),
    //        type: "GET",
    //        data: {
    //            type: "ussd",
    //            key: "send",
    //            ani: crm_calltype == 'IN' ? crm_ani : '055166184301',
    //            dnis: crm_dnis,
    //            calltype: crm_calltype,
    //            callevent: crm_calltype == 'IN' ? "called" : "calling",
    //            path: "message"
    //        },
    //        success: function (result) {

    //        }
    //    });

    //}
}

function Atx_OnCallUnRing(callid, ucallid)
{

}

function Atx_OnTransfered(callid, callid2) {

}

function AtxWin_OnTransferData(iden, rmt) {
    var data = "";
    switch (iden) {
        case "survey":
            data = theMikeAtx.vLogoinAgentID;
            break;
    }
    return data;
}


function Atx_OnMessageEvent(msgsrc, msgtype, msgval) {

}

function Atx_OnBroadEvent(srcpn, srcdata) {

}

function Atx_OnQueueEvent(evttype, valtype, data) {

}

function Atx_OnException(code, cause)
{
}

function AtxWin_OnCloseing() {
    AtxCmdCancelQueue();
    AtxCmdLogout();
    return 0;
}

function AtxWin_OnGetLoginAgentID() {
    if (_gdata && _gdata.AgentId) {
        return _gdata.AgentId;
    }
    return "";
}

function AtxWin_OnLoginDeviceID() {
    return "";
}
