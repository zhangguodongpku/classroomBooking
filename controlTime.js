function minList(){
	var tmpList = [];
	for(var i = 0; i <= 9; i++){
		tmpList.push("0" + i.toString());
	}
	for(var i = 10; i <= 59; i++){
		tmpList.push(i.toString());
	}
	return tmpList;
}

function hourList(){
	var tmpList = ["08", "09"];
	for(var i = 10; i <= 22; i++){
		tmpList.push(i.toString());
	}
	return tmpList;
}

function dayList(n){
	if(n > 100){
		n = 100; 
	}
	var dateinit = new Date();
	var tmpList = [dayFormat(dateinit)];
	for(var i = 1; i <= n; i++){
		tmpdate = plus(dateinit, i * 24 * 60)
		tmpList.push(dayFormat(tmpdate));
	}
	return tmpList;
}

function diff(date1, date2){
	tmpdate1 = Number(new Date(date1.getTime()));
	tmpdate2 = Number(new Date(date2.getTime()));
	return (tmpdate1 - tmpdate2)/1000;
}

function plus(date, delta){
	tmpdate = Number(new Date(date.getTime()));
	tmpdate += Number(delta) * 60 * 1000;
	return new Date(tmpdate);
}

function minus(date, delta){
	tmpdate = Number(new Date(date.getTime()));
	tmpdate -= Number(delta) * 60 * 1000;
	return new Date(tmpdate);
}

function dateFormat(date){
	var mm = date.getMonth() + 1;
	var datetime = date.getFullYear()+"-"+dble(mm)+"-"+dble(date.getDate())+"  "+dble(date.getHours())+":"+dble(date.getMinutes())+":"+dble(date.getSeconds());
	return datetime;
}

function dayFormat(date){
	var mm = date.getMonth() + 1;
	var datetime = date.getFullYear()+"-"+dble(mm)+"-"+dble(date.getDate());
	return datetime;
}

function timeFormat(date){
	var datetime = dble(date.getHours())+":"+dble(date.getMinutes());
	return datetime;
}

function dble(time){
	lengthOfTime = time.toString().length;
	if(lengthOfTime == 1){
		return "0"+time.toString();
	}else{
		return time.toString();
	}
}

exports.plus = plus;
exports.minus = minus;
exports.dateFormat = dateFormat;
exports.dayFormat = dayFormat;
exports.timeFormat = timeFormat;
exports.diff = diff;
exports.dayList = dayList;
exports.hourList = hourList;
exports.minList = minList;