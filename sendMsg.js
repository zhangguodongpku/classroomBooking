var getAccessToken = require("./getAccessToken"), https = require('https');

var data = {
	"touser": "",
	"toparty": "",
	"totag": "",
	"msgtype": "text",
	"agentid": 61,
	"text": {
		"content": ""
	},
	"safe":"0"
};
function sendMsg(data){
	data = JSON.stringify(data);
	var datalen = (new Buffer(data)).length;
	var options = {
		method: "POST",
		hostname: "qyapi.weixin.qq.com",
		port: 443,
		path: "/cgi-bin/message/send?access_token="+getAccessToken(),
		headers: {  
			"Content-Type": 'application/x-www-form-urlencoded',  
			"Content-Length": datalen  
		}
	};
	var req = https.request(options, function(res){});
	req.write(data);
	req.end();
}

exports.data = data;
exports.sendMsg = sendMsg;