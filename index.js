"use strict";
var express = require("express"), http = require("http"), path = require("path"), bodyParser = require("body-parser"), cookieParser = require("cookie-parser");
var ctrlmysql = require("./controlMysql"), ctrltime = require("./controlTime");
var app = express(), server = http.createServer(app);
var qs = require("qs"), wxJm = require("./msg_crypto");
var port = 8080, token = "littleboy", encodingAESKey  = "tpDpLxG50npobCcWT5TuzFjvgHwvCRQ7X3SU3c2RH8z", corpid = "wx1d3765eb45497a18";
var sendMsg = require("./sendMsg");
var userID = "", eventKey = "";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//用户预约界面
app.get("/", function(req, res){
	if(typeof(req.cookies.user)=="undefined"){
		//console.log("未设置cookies 2");
		res.cookie('user', {username: userID}, {maxAge: 1000*60*20, httpOnly:true, path:'/'});
	}
	res.render("index", {
		title: "教室预约",
		dayList: ctrltime.dayList(14),
		hourList: ctrltime.hourList(),
		minList: ctrltime.minList()
	});
});

app.get("/classroom", function(req, res){
	if(typeof(req.cookies.user)=="undefined"){
		res.redirect("/");
	}else{
		var opentime = new Date(req.query.day + " " + req.query.hour + ":" + req.query.minute + ":00");
		var time1 = ctrltime.dateFormat(ctrltime.minus(opentime, 30));
		var time2 = ctrltime.dateFormat(ctrltime.plus(opentime, Number(req.query.timespend)+30));
		var sql = "select * from classroom where id not in (select classroom from bookinglist where (opentime<'"+time1+"' and endtime>'"+time1+"') or (opentime<'"+time2+"' and endtime>'"+time2+"') or (opentime<'"+time1+"' and endtime>'"+time2+"') or (opentime>'"+time1+"' and endtime<'"+time2+"'))";
		ctrlmysql.query(sql);
		ctrlmysql.cache.once("query", function(result){
			res.render("classroom", {
				title: "可用教室列表",
				classroom: result,
				opentime: ctrltime.dateFormat(opentime),
				endtime: ctrltime.dateFormat(ctrltime.plus(opentime, Number(req.query.timespend)))
			});
		});
	}
});

app.get("/booking", function(req, res){
	if(typeof(req.cookies.user)=="undefined"){
		res.redirect("/");
	}else{
		res.render("booking", {
			title: "预约会议室",
			classroom: req.query.classroom,
			opentime: req.query.opentime,
			endtime: req.query.endtime
		});
	}
});

app.get("/applicant", function(req, res){
	if(typeof(req.cookies.user)=="undefined"){
		res.redirect("/");
	}else{
		res.render("applicant", {
			title: "教室预约详情",
			classroom: req.query.classroom,
			opentime: req.query.opentime,
			endtime: req.query.endtime
		});
	}
});

app.get("/OK", function(req, res){
	if(typeof(req.cookies.user)=="undefined"){
		res.redirect("/");
	}else{
		var sql = "select * from users where position = 1";
		ctrlmysql.query(sql);
		ctrlmysql.cache.once("query", function(result){
			if(result.length > 0){
				sendMsg.data.touser = result[0].id;
				sendMsg.data.text.content = "有新申请！";
				sendMsg.sendMsg(sendMsg.data);
			};
		});
		res.render("OK", {
			title: "申请成功"
		});
	}
});

app.get("/fail", function(req, res){
	res.render("fail", {
		title: "申请失败"
	});
});

app.get("/bookingOK", function(req, res){
	res.render("bookingOK", {
		title: "预约成功"
	});
});

app.get("/bookingfail", function(req, res){
	res.render("bookingfail", {
		title: "预约失败"
	});
});

app.post("/applicant", function(req, res){
	if(typeof(req.cookies.user)=="undefined"){
		res.redirect("/");
	}else{
		var sql = "select * from users where id='"+req.cookies.user.username+"'";
		ctrlmysql.query(sql);
		ctrlmysql.cache.once("query", function(result){
			if(result.length <= 0){
				if(req.cookies.user.username.trim() != 0){
					ctrlmysql.insert("users", {
						id: req.cookies.user.username,
						position: 0
					});
				}
			};
		});
		if(req.body.contact.trim()=="" || req.body.department.trim()=="" || req.body.contname.trim()=="" || req.body.contents.trim()=="" || req.body.numbers.trim()==""){
			res.redirect("/fail");
		}else{
			var data = {
				name: req.body.contname,
				content: req.body.contents,
				applicant: req.cookies.user.username,
				contact: req.body.contact,
				department: req.body.department,
				opentime: new Date(req.body.opentime),
				endtime: new Date(req.body.endtime),
				apptime: new Date(),
				nums: req.body.numbers,
				classroom: req.body.classroom
			};
			ctrlmysql.insert("bookinglist", data);
			res.redirect("/OK");
		}
	}
});

app.post("/booking", function(req, res){
	if(typeof(req.cookies.user)=="undefined"){
		res.redirect("/");
	}else{
		var sql = "select * from users where id='"+req.cookies.user.username+"'";
		ctrlmysql.query(sql);
		ctrlmysql.cache.once("query", function(result){
			if(result.length <= 0){
				if(req.cookies.user.username.trim() != 0){
					ctrlmysql.insert("users", {
						id: req.cookies.user.username,
						position: 0
					});
				}
			};
		});
		if(req.body.contact.trim()=="" || req.body.department.trim()==""){
			res.redirect("/bookingfail");
		}else{
			var data = {
				applicant: req.cookies.user.username,
				contact: req.body.contact,
				department: req.body.department,
				opentime: new Date(req.body.opentime),
				endtime: new Date(req.body.endtime),
				apptime: new Date(),
				classroom: req.body.classroom
			};
			ctrlmysql.insert("bookinglist_s", data);
			res.redirect("/bookingOK");
		}
	}
});

//活动公告界面
app.get("/news", function(req, res){
	if(typeof(req.cookies.user)=="undefined"){
		//console.log("未设置cookies 1");
		res.cookie('user', {username: userID}, {maxAge: 1000*60*20, httpOnly:true, path:'/'});
	}
	var sql = "select * from bookinglist where review1+review2+review3 = 3 order by opentime desc limit 20";
	ctrlmysql.query(sql);
	ctrlmysql.cache.once("query", function(result){
		var data = [];
		for(var i=0;i<result.length;i++){
			data.push({
				id: result[i].id,
				name: result[i].name,
				department: result[i].department,
				classroom: result[i].classroom,
				opentime: ctrltime.dayFormat(result[i].opentime)+" "+ctrltime.timeFormat(result[i].opentime)
			});
		}
		res.render("news", {
			title: "活动公告",
			news: data
		});
	});
});

app.get("/detail", function(req, res){
	var id = ctrlmysql.transfer(req.query.id);
	var sql = "select * from bookinglist where id="+id+"";
	ctrlmysql.query(sql);
	ctrlmysql.cache.once("query", function(result){
		result[0].opentime = ctrltime.dayFormat(result[0].opentime)+" "+ctrltime.timeFormat(result[0].opentime);
		res.render("detail", {
			title: "活动详情",
			news: result[0]
		});
	});
});

//老师审核界面
app.get("/review",function(req, res){
	if(typeof(req.cookies.user)=="undefined"){
		//console.log("未设置cookies 4");
		res.cookie('user', {username: userID}, {maxAge: 1000*60*20, httpOnly:true, path:'/'});
	}
	var sql1 = "select * from users where id='"+userID+"' and position>0";
	ctrlmysql.query(sql1);
	ctrlmysql.cache.once("query", function(result1){
		if(result1.length <= 0){
			res.render("nopv", {
				title: "没有权限"
			});
		}else{
			var position = result1[0].position;
			var sql = "select * from bookinglist where review1+review2+review3 = "+(Number(position)-1)+" order by apptime asc limit 40";
			ctrlmysql.query(sql);
			ctrlmysql.cache.once("query", function(result){
				var data = [];
				for(var i=0;i<result.length;i++){
					data.push({
						id: result[i].id,
						name: result[i].name,
						department: result[i].department,
						classroom: result[i].classroom,
						opentime: ctrltime.dayFormat(result[i].opentime)+" "+ctrltime.timeFormat(result[i].opentime)
					});
				}
				res.render("review", {
					title: "活动公告",
					review: position,
					news: data
				});
			});
		}
	});
});

app.get("/redetail", function(req, res){
	var id = ctrlmysql.transfer(req.query.id);
	var review = req.query.review;
	var sql = "select * from bookinglist where id="+id+"";
	ctrlmysql.query(sql);
	ctrlmysql.cache.once("query", function(result){
		result[0].opentime = ctrltime.dayFormat(result[0].opentime)+" "+ctrltime.timeFormat(result[0].opentime);
		res.render("redetail", {
			title: "活动详情",
			review: review,
			news: result[0]
		});
	});
});

app.get("/nopv", function(req, res){
	res.render("nopv", {
		title: "无权限"
	});
});

app.post("/redetail", function(req, res){
	var id = ctrlmysql.transfer(req.body.id);
	var review = req.body.review;
	var stat = req.body.stat;
	var sql = "";
	if(stat == 1){
		if(review == 1){
			sql = "update bookinglist set review1=1 where id="+id+"";
			var sql1 = "select * from users where position = 2";
			ctrlmysql.query(sql1);
			ctrlmysql.cache.once("query", function(result){
				if(result.length > 0){
					sendMsg.data.touser = result[0].id;
					sendMsg.data.text.content = "有新申请！";
					sendMsg.sendMsg(sendMsg.data);
				};
			});
		}else if(review == 2){
			sql = "update bookinglist set review2=1 where id="+id+"";
			var sql2 = "select * from users where position = 3";
			ctrlmysql.query(sql2);
			ctrlmysql.cache.once("query", function(result){
				if(result.length > 0){
					sendMsg.data.touser = result[0].id;
					sendMsg.data.text.content = "有新申请！";
					sendMsg.sendMsg(sendMsg.data);
				};
			});
		}else if(review == 3){
			sql = "update bookinglist set review3=1 where id="+id+"";
			var sql3 = "select * from bookinglist where id="+id+"";
			ctrlmysql.query(sql3);
			//console.log("step 3");
			ctrlmysql.cache.once("query", function(result){
				if(result.length > 0){
					//console.log(result[0].applicant+"applicant");
					sendMsg.data.touser = result[0].applicant;
					sendMsg.data.text.content = "恭喜你的“"+result[0].name+"”申请通过了！";
					sendMsg.sendMsg(sendMsg.data);
				};
			});
		}
		ctrlmysql.query(sql);
		//console.log(sql);
		ctrlmysql.cache.once("query", function(result){
			//console.log("step final");
			res.json({
				review: "通过！"
			});
		});
	}else{
		if(review == 1){
			sql = "update bookinglist set review1=10 where id="+id+"";
		}else if(review == 2){
			sql = "update bookinglist set review2=10 where id="+id+"";
		}else{
			sql = "update bookinglist set review3=10 where id="+id+"";
		}
		var sql4 = "select * from bookinglist where id="+id+"";
		ctrlmysql.query(sql4);
		ctrlmysql.cache.once("query", function(result){
			if(result.length > 0){
				sendMsg.data.touser = result[0].applicant;
				sendMsg.data.text.content = "不好意思，你的“"+result[0].name+"”教室申请未通过！";
				sendMsg.sendMsg(sendMsg.data);
			};
		});
		ctrlmysql.query(sql);
		ctrlmysql.cache.once("query", function(result){
			res.json({
				review: "未通过!"
			});
		});
	}
});

app.get("/result", function(req, res){
	res.render("result", {
		title: "预约成功"
	});
});

//与微信交互
app.post("/", function(req, res){
	var query = require("url").parse(req.url).query;
	var params = qs.parse(query);
	var cryptor = new wxJm(token, encodingAESKey, corpid);
	var postdata = "";
	req.addListener("data", function(postchunk){
		postdata += postchunk;
	});
	req.addListener("end", function(){
		var parseStr = require("xml2js").parseString;
		parseStr(postdata, function(err ,result){
			if(err){
				console.log(err);
				return;
			}
			var cryptor = new wxJm(token, encodingAESKey, corpid);
			var msgs = cryptor.decrypt(result.xml.Encrypt[0]);
			var parseStr = require("xml2js").parseString;
			parseStr(msgs.message, function(err ,result){
				if(err){
					console.log(err);
					return;
				}
				if(result.xml.FromUserName){
					userID = result.xml.FromUserName[0];
					if(result.xml.EventKey){
						eventKey = result.xml.EventKey[0];
					}
				}
			});
		});
	});
});

app.get("/help", function(req, res){
	if(typeof(req.cookies.user)=="undefined"){
		//console.log("未设置cookies 3");
		res.cookie('user', {username: userID}, {maxAge: 1000*60*20, httpOnly:true, path:'/'});
	}
	res.render("help", {
		title: "帮助"
	});
});

server.listen(port, function(req, res){
	console.log("app running at " + port + ".");
});