# classroomBooking
这是一个教室预约系统，方便同学们借用教室组织活动；并为学工办、教务、网络中心的老师审核提供便利；此外，还可公布活动日程。  

部署系统时需要注意以下几点：

1、修改CorpID，agentid，Secret，encodingAESKey，token和port，使其与自身相匹配；

2、本资源未上传NodeJS的依赖模块，需要按照package.json文件中的依赖install；

3、本系统引用的angularJS，jQuery和bootstrap都是引自网络资源，如果觉得不稳定可以引用本地资源；

4、本系统共使用了四个MySQL表，分别是用户表、教室表、需要审核的预约表、不需审核的预约表，MySQL代码如下：

users ->

CREATE TABLE `users` (
  `id` varchar(40) NOT NULL,
  `nickname` varchar(40) DEFAULT NULL,
  `position` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


classroom ->

CREATE TABLE `classroom` (
  `id` char(4) NOT NULL,
  `numbers` int(11) DEFAULT NULL,
  `review` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


bookinglist ->

CREATE TABLE `bookinglist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `content` text,
  `applicant` varchar(12) DEFAULT NULL,
  `contact` varchar(40) DEFAULT NULL,
  `department` varchar(20) DEFAULT NULL,
  `opentime` datetime NOT NULL,
  `endtime` datetime NOT NULL,
  `apptime` datetime DEFAULT NULL,
  `nums` int(11) DEFAULT NULL,
  `classroom` varchar(10) DEFAULT NULL,
  `review1` tinyint(4) DEFAULT '0',
  `review2` tinyint(4) DEFAULT '0',
  `review3` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;


bookinglist_s ->

CREATE TABLE `bookinglist_s` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `applicant` varchar(12) DEFAULT NULL,
  `contact` varchar(40) NOT NULL,
  `department` varchar(20) NOT NULL,
  `opentime` datetime DEFAULT NULL,
  `endtime` datetime DEFAULT NULL,
  `apptime` datetime DEFAULT NULL,
  `classroom` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

5、微信自定义菜单如下：
{
   "button":[
       {	
           "type":"view",
           "name":"活动公告",
           "url":"http://www.youngshow.top:8080/news"
       },
       {
           "name":"教室预约",
           "sub_button":[
               {
                   "type":"view",
                   "name":"开始申请",
                   "url":"http://www.youngshow.top:8080/"
               },
               {
                   "type":"view",
                   "name":"帮助",
                   "url":"http://www.youngshow.top:8080/help"
               }
           ]
      },
	  {	
           "type":"view",
           "name":"审核",
           "url":"http://www.youngshow.top:8080/review"
      }
   ]
}


接下来介绍一下使用介绍。
学生（申请人）点击“开始申请”-->选择时间-->选择可用教室-->填写活动详细情况-->提交，如果是需要审核的教室则等待审核结果，否则将直接预约成功；
审核人（三类老师按顺序审核）点击“审核”-->待审核列表-->活动详情（通过或者不通过）；
当申请人提交申请后，学工办老师（users表中position=1，普通学生position=0）收到“有新申请”的消息提示，学工办老师审核通过后，教务老师（position=2）收到提示，他通过后，网络中心（position=3）收到消息提示，待通过或者不通过都将告诉申请者。


开发人员：张国栋 1501210780 何晓莉 1501210547