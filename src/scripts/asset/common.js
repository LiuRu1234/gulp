let url = 'https://www.uxinyue.com'
// let url = 'http://www.uxinyue.com:81'
// var url='http://10.255.1.23:7777'
// let url =''
// 判断地址栏是否带有参数
function GetQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
    var r = window.location.search.substr(1).match(reg)
    if (r != null) return unescape(r[2])
}

let caseNumber = GetQueryString('caseNumber')
let cardShowId = GetQueryString('cardShowId')
let caseShowId = GetQueryString('caseShowId')
let card_token = GetQueryString('card_token')


// 数组去重
function eduplication(arr) {
    var newArr = []
    arr.forEach((v) => {
        if (newArr.find(newValue => newValue.id == v.id) === undefined) {
            newArr.push(v)
        }
    })
    return newArr
}

// 保存浏览记录和点赞记录
function postLog(type,case_show_id) {
    // 添加作品集的浏览记录
    $.ajax({
        url: url + '/wxapi/save/log',
        data: {type: type, case_id: caseNumber, case_show_id: case_show_id},
        type: "post",
        xhrFields: {
            withCredentials: true
        },
        dataType: "json",
        success: function (res) {
            console.log(res, 'save/log')
        }
    })
}

// 时间转化
function getTime(s) {
    var t;
    if(s > -1){
        var hour = Math.floor(s/3600);
        var min = Math.floor(s/60) % 60;
        var sec = s % 60;
        if(min > 0){
            t = min + "′";
        }else{
            t = ''
        }
        // if(sec < 10){t += "0";}
        t += sec.toFixed(0) + "″"
    }
    return t;
}