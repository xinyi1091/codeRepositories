/*
 * @Author: 2015042401
 * @Date:   2017-09-26 18:49:38
 * @Last Modified by:   2015042401
 * @Last Modified time: 2017-09-26 18:51:12
 */

'use strict';
// 法律规定的放假日期
var lawHolidays = ["2017-01-01", "2017-01-02", "2017-01-27", "2017-01-28", "2017-01-29", "2017-01-30", "2017-01-31", "2017-02-01",
    "2017-02-02", "2017-04-02", "2017-04-03", "2017-04-04",
    "2017-04-29", "2017-04-30", "2017-05-01", "2017-05-28",
    "2017-05-29", "2017-05-30", "2017-10-01", "2017-10-02",
    "2017-10-03", "2017-10-04", "2017-10-05", "2017-10-06",
    "2017-10-07", "2017-10-08"
];
// 由于放假需要额外工作的周末
var extraWorkdays = ["2017-01-22", "2017-02-04", "2017-04-01", "2017-05-27", "2017-09-30"];
/**
 * 判断是否是法定假日
 */
function isLawHoliday(calendar) {
    if (lawHolidays.indexOf(calendar) != -1) {
        return true;
    }
    return false;
}
/**
 * 判断是否是周末
 */
function isWeekends(calendar) {
    var day = new Date(calendar).getDay(); //0-周日，6-周六
    if (day == 0 || day == 6) {
        return true;
    }
    return false;
}

/**
 * 判断是否是需要额外补班的周末
 */
function isExtraWorkday(calendar) {
    if (extraWorkdays.indexOf(calendar) != -1) {
        return true;
    }
    return false;
}

/**
 * 判断是否是休息日（包含法定节假日和不需要补班的周末）
 *
 * @param calendar
 * @return
 */
function isHoliday(calendar) {
    // 首先法定节假日必定是休息日
    if (isLawHoliday(calendar)) {
        return true;
    }
    // 排除法定节假日外的非周末必定是工作日
    if (!isWeekends(calendar)) {
        return false;
    }
    // 所有周末中只有非补班的才是休息日
    if (isExtraWorkday(calendar)) {
        return false;
    }
    return true;
}

/**
 * 判断是否是工作日
 *
 * @param calendar
 * @return
 */
function isWorkday(calendar) {
    return !(isHoliday(calendar));
}

/**
 * 获取当前日期前后n天
 * @param  AddDayCount 获取AddDayCount天后的日期
 */
function GetDateStr(AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1; //获取当前月份的日期
    m = (m >= 1 && m <= 9) ? '0' + m : m;
    var d = dd.getDate();
    d = (d >= 0 && d <= 9) ? ('0' + d) : d;
    return y + "-" + m + "-" + d;
}

function getNowFormatDate() {
    var date = new Date();
    var seperator = "-";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator + month + seperator + strDate;
    return currentdate;
}

for (var i = 5; i <= 13; i++) {
    // 如果是节假日 继续循环
    if (isHoliday(GetDateStr(i))) {
        continue;
    } else {
        var nextWorkday = GetDateStr(i);
        break;
    }
}

console.log('下一个工作日:', nextWorkday);
