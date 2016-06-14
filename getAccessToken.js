//引入相应模块
var request = require("request"), fs = require("fs"), later = require('later');
//定义相应信息，appid与APPsecret从微信开放平台申请
var appID = "wx1d3765eb45497a18", appSecret = "D3fw-SB-BHKxJF0kAE9KU17vk1iMviVaHjRjcImya0GKTQusHpbsTR0liGvrYMHO";
var turl = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=" + appID + "&corpsecret=" + appSecret;

//引入later这个定时模块，每隔一小时运行一次
var schedule = later.parse.recur().every(1).hour();

getToken();//期初先运行一次

later.setInterval(getToken, schedule);

//定义获取token的函数，并保存至tmpToken.dat文件
function getToken(){
	request(turl, function(err, res, data){
		var result = JSON.parse(data);
		fs.writeFileSync('tmpToken.dat', JSON.stringify(result));
	});
}

//定义获取用户信息的函数
function getAccessToken(){
		var tmpToken = JSON.parse(fs.readFileSync('tmpToken.dat'));
		return tmpToken.access_token;
}
//输出此函数以供主程序使用
module.exports = getAccessToken;