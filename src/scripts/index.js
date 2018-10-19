$('.loading-page').removeClass('loading-fade')

// 滑动
let scrollOption = {
    pullUpLoad: true,
}
let wrapper = document.querySelector('.list-container')


let magicContainer = $('.magic-inner')
let _isDown = false

let _touchStart = 0
let _touchEnd = 0

let options = {
    click: true,
    pullDownRefresh: {
        threshold: 10,
        stop: 20
    }
}

let scroll = new BScroll(wrapper, options)
scroll.on('pullingDown', function () {
    _isDown = false
    magicContainer.css({transform: `translateY(0px)`})
    $('#btnCase').css('display','none')

    scroll.finishPullDown()

})


let screenHeight = document.body.clientHeight
$('.needHeight').css({height: `${screenHeight}px`})


magicContainer[0].addEventListener('touchstart', function (e) {
    _touchStart = e.changedTouches[0].clientY
})

magicContainer[0].addEventListener('touchend', function (e) {
    _touchEnd = e.changedTouches[0].clientY

    if (_touchEnd < _touchStart && !_isDown) {
        _isDown = true
        if(window.__wxjs_environment === 'miniprogram'){
            $('#btnCase').css('display','block')
        }
        magicContainer.css({transform: `translateY(-${screenHeight}px)`})
    }
})
$('.jiantou').on('click',function () {
    magicContainer.css({transform: `translateY(-${screenHeight}px)`})
})





let link = location.href;
$.ajax({
    url: url + '/wxapi/case/signture',
    data: {url: encodeURIComponent(location.href.split('#')[0])},
    type: "get",
    xhrFields: {
        withCredentials: true
    },
    dataType: "json",
    success: function (res) {
        wx.config({
            debug: true,
            appId: res.data.appId,
            timestamp: res.data.timestamp,
            nonceStr: res.data.nonceStr,
            signature: res.data.signature,
            jsApiList: [
                "onMenuShareTimeline", //分享给好友
                "onMenuShareAppMessage", //分享到朋友圈
                "onMenuShareQQ", //分享到QQ
                "onMenuShareWeibo" //分享到微博
            ]
        });
    },
    error:function (error){
        console.log(error)
    }
})
alert(location.href.split('#')[0])

function shareCaseList(data) {
    console.log(data,'---')
    wx.ready(function () {
        var shareData = {
            title: data.name,
            desc: data.introduction,
            link: link,
            imgUrl: data.cover
        };
        wx.onMenuShareAppMessage(shareData);
        wx.onMenuShareTimeline(shareData);
        wx.onMenuShareQQ(shareData);
        wx.onMenuShareWeibo(shareData);
    });
    wx.error(function (res) {
            console.log(res.errMsg);//错误提示 
        }
    );
}




// 全局变量
var top_list =[]
var needCaseList = []

// 渲染案例列表
function needlist(needCaseList) {
    let case_list = ''
    needCaseList.forEach((v,i) => {
        case_list += `<div class="list" data-id="${v.case_show_id}">
                       <div class="pic">
                           <img src="${v.cover}" alt=""/>
                       </div>
                       <div class="list_info">
                           <div class="tips">
                               <div class="left" style="opacity: ${v.lable==''?0:1};">
                                   <div class="label_tips">#</div>
                                   <div class="info_babel">
                                       <div class="label_text">${v.lable}</div>
                                   </div>
                               </div>
                               <div class="right">
                                   <div class="biao eye">
                                       <div class="img"></div>
                                       <div >${v.see_count}</div>
                                   </div>
                                   <div class="biao zan">
                                       <div class="img"></div>
                                       <div >${v.zan_count}</div>
                                   </div>
                               </div>
                           </div>
                           <div class="title">${v.title}</div>
                       </div>
                   </div>`
    })
    $('.list_box').html(case_list)
}

function saveCaseStorage(id,data){
    console.log(id,data)
    data._id = id
    let originStorage = JSON.parse(localStorage.getItem('caseList'))
    if(originStorage){
        let saveData = originStorage.find(v => v._id == id)
        // console.log(!saveData,'88888')
        if(!saveData){
            //这里写第一次浏览的请求
            //请求
            //。。。
            //
            postLog(2,'')
            originStorage.push(data)
        }
    }else{
        postLog(2,'')
        originStorage = [data]
    }
    localStorage.setItem('caseList',JSON.stringify(originStorage))

//    如果是没浏览一次就发一次请求，则请求写在这里

}

// 初次获取案例列表
$.ajax({
    url: url + '/api/case/doc/list',
    data: {card_show_id: cardShowId,case_number: caseNumber,card_token:card_token},
    type: "get",
    xhrFields: {
        withCredentials: true
    },
    dataType: "json",
    success: function (res) {
        console.log(res, '000')
        shareCaseList(res.data)
        saveCaseStorage(cardShowId,res.data)
        $('.loading-page').addClass('loading-fade')

        // 渲染封面数据
        $('.container .title').html(res.data.name)
        $('.container .business').attr('src',res.data.company)
        $('.container .pic img').attr('src',res.data.cover)
        $('.container .container_mask').css('background-image','url(' +res.data.cover +')')

        $('.container #allsee').html(res.data.see_count)
        $('.container #allzan').html(res.data.zan_count)

        if(res.data.list.length<=0){
            $('.list-container .content').css('text-align','center')
            $('.list-container .content').css('padding-top','300px')
            $('.list-container .content').html('暂无案例文件，请您先去创建案例文件')
            return
        }
        needCaseList = res.data.list
        needCaseList.forEach((v,i) => {
            top_list.push({id:v.category_id,category:v.category})
        })
        // 案例类别数据呈现
        var toplist = ''
        eduplication(top_list).forEach(function (v, i) {
            toplist += "<div class='list " + (i == 0 ? 'top_active' : '') + "' data-id=" + v.id + ">" + v.category + "<div class='line'></div></div>"
        })
        $('.list_top .list_top_scroll').html(toplist)
        // 类别第一个的案例列表
        let category_id = eduplication(top_list)[0].id
        let needCaseList2 = needCaseList.filter((v,i) => {
            return v.category_id == category_id
        })
        needlist(needCaseList2)
    }
})
// 案例类别选项卡
$('.list_top_scroll').on('click', '.list', function () {
    var $this = $(this)
    let category_id = $this.attr('data-id')
    $this.addClass('top_active')
        .siblings().removeClass('top_active')
    let needCaseList2 = needCaseList.filter((v,i) => {
        return v.category_id == category_id
    })
    needlist(needCaseList2)
})
// 点击进入播放页面
$('.list_box').on('click', '.list', function () {
    var $this = $(this)
    let case_show_id = $this.attr('data-id')
    window.location.href = './play.html?caseShowId=' + case_show_id +'&cardShowId=' + cardShowId +'&caseNumber=' + caseNumber+ '&card_token=' + card_token
})

//判断环境显示有无
function ready() {
    console.log(window.__wxjs_environment === 'miniprogram') // true
    if (window.__wxjs_environment == 'miniprogram') {
        $('.contant_btn').css('display','flex')
        $('#btnCase').css('display','block')
    } else {
        $('.contant_btn').css('display','none')
        $('#btnCase').css('display','none')
    }
}
if (!window.WeixinJSBridge || !WeixinJSBridge.invoke) {
    document.addEventListener('WeixinJSBridgeReady', ready, false)
} else {
    ready()
}

// 联系我们
$('.contant_btn').on('click', function () {
    wx.miniProgram.reLaunch({url: '/pages/card/card?isDemo=false&cardShowId=' + cardShowId})
})
// 小程序环境复制链接分享h5
var copyUrl = 'https://www.uxinyue.com/caseh5?caseNumber=' +caseNumber+ '&cardShowId=' + cardShowId
// $('#btnCase').on('click', function () {
//     const input = document.querySelector('#copyInputUrl')
//     input.value = copyUrl
//     input.select()
//
//     if (document.execCommand('copy')) {
//         document.execCommand('copy');
//         console.log('复制成功');
//     }
//     prompt("复制链接并发送朋友圈",copyUrl)
// })

let copyBtn = document.querySelector('#btnCase')
copyBtn.setAttribute('data-clipboard-text',copyUrl)
var clipboard = new ClipboardJS('#btnCase');
clipboard.on('success', function(e) {
    // prompt("复制链接并发送朋友圈",copyUrl)
    alert('链接已复制!请在微信中打开并分享到朋友圈')
})

clipboard.on('error', function(e) {
    alert('复制失败')
})







