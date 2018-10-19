$('.loading-page').removeClass('loading-fade')


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
            debug: false,
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

function shareCaseInfo(data) {
    wx.ready(function () {
        var shareData = {
            title: data.title,
            desc: data.content,
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



// 引导页面
var myPlayer = null
$('#IKnow').on('click', function () {
    hideShare()
})
if (window.localStorage.getItem('IKnow') != 'true') {
    showShare()
}

function showShare() {
    let $body = $('body')
    let screenHeight = document.body.clientHeight
    let originHeight = $body.css('height')
    $body.height(screenHeight).addClass('bodyHiden').data('originHeight', originHeight)
    $('.mask').show()
}

function hideShare() {
    let $body = $('body')
    let originHeight = $body.data('originHeight')
    $body.height(originHeight).removeClass('bodyHiden')
    $('.mask').hide()
    window.localStorage.setItem('IKnow', 'true')
}

//判断环境显示有无
$('#btnInfo').css('display', 'none')
function ready() {
    console.log(window.__wxjs_environment === 'miniprogram') // true
    if (window.__wxjs_environment === 'miniprogram') {
        hideShare()
        $('#btnInfo').css('display', 'block')
    }
}
if (!window.WeixinJSBridge || !WeixinJSBridge.invoke) {
    document.addEventListener('WeixinJSBridgeReady', ready, false)
} else {
    ready()
}
// 小程序环境复制链接分享h5
var copyUrl = 'https://www.uxinyue.com/caseh5/play.html?caseShowId=' + caseShowId +'&cardShowId=' + cardShowId +'&caseNumber=' + caseNumber
// $('#btnInfo').on('click', function () {
//     const input = document.querySelector('#copyInput')
//     input.value = copyUrl
//     input.select()
//
//     if (document.execCommand('copy')) {
//         document.execCommand('copy');
//         console.log('复制成功');
//     }
//     prompt("复制链接并发送朋友圈",copyUrl)
// })
let copyBtn = document.querySelector('#btnInfo')
copyBtn.setAttribute('data-clipboard-text',copyUrl)
var clipboard = new ClipboardJS('#btnInfo');
clipboard.on('success', function(e) {
    // prompt("复制链接并发送朋友圈",copyUrl)
    alert('链接已复制!请在微信中打开并分享到朋友圈')
})

clipboard.on('error', function(e) {
    alert('复制失败')
})

// 获取案例文件详情
$.ajax({
    url: url + '/api/case/doc',
    data: {card_show_id: cardShowId,case_show_id: caseShowId, case_number: caseNumber,card_token:card_token},
    type: "get",
    xhrFields: {
        withCredentials: true
    },
    dataType: "json",
    success: function (res) {
        console.log(res, 'info000')
        $('.thisplay .title').html(res.data.title)
        if(res.data.lable){
            $('.thisplay .label_text').html(res.data.lable)
        }else{
            $('.thisplay .tips .left').css('opacity','0')
        }
        $('.thisplay #infoeye').html(res.data.see_count)
        $('.thisplay #infozan').html(res.data.zan_count)
        $('.thisplay .cover .pic').attr('src', res.data.cover)
        $('.thisplay .cover .time').html(getTime(res.data.file.time))
        if(res.data.content){
            $('.thisplay .play_info_text').html(res.data.content)
        }else{
            $('.thisplay .play_info').css('display','none')
        }
        $('.play_container .thisplay .coverMask').css('background-image','url('+res.data.cover+')')

        $('#my-video').attr('poster',res.data.cover)

        $('#my-video .source1').attr('src',res.data.file.resolution[0].src)
        $('#my-video .source2').attr('src',res.data.file.resolution[0].src)

        myPlayer = videojs('my-video')

        $('.loading-page').addClass('loading-fade')
        shareCaseInfo(res.data)
    }
})
$('.bottom .code img').attr('src',url+'/wxapi/person/qr?card_show_id=' + cardShowId)

// 点击播放视频
$('.thisplay .cover').on('click',function () {
    $(this).css('display','none')
    myPlayer.play()
})


// 初次获取案例列表
$.ajax({
    url: url + '/api/case/doc/list',
    data: {card_show_id: cardShowId,case_number: caseNumber},
    type: "get",
    xhrFields: {
        withCredentials: true
    },
    dataType: "json",
    success: function (res) {
        console.log(res, '000')
        $('.play_book .avatar img').attr('src', res.data.cover)
        $('.play_book .book').html(res.data.name)
        $('.play_book .business').html(res.data.company)
        let rescaselist = res.data.list
        let needCaseList = rescaselist.filter((v,i) => {
            return v.case_show_id != caseShowId
        })
        if(needCaseList.length <= 0){
            $('.other_play').css('display','none')
            return
        }
        //计算宽度
        // var width = document.documentElement.clientWidth
        // width = width > 768?768:width
        // var slideWidth = width / 750 * 445

        let case_list = ''
        needCaseList.forEach((v, i) => {
            case_list += `<div class="play_list swiper-slide" data-id="${v.case_show_id}" style="width:4.45rem">
                <div class="pic">
                    <img src="${v.cover}" alt="">
                </div>
                <div class="info">
                    <div class="info_title">
                        ${v.title}
                    </div>
                    <div class="info_label_box">
                        <div class="info_tips">#</div>
                        <div class="info_babel">
                            <div class="label_text">${v.lable}</div>
                        </div>
                    </div>
                </div>
            </div>`
        })
        $('.play_list_box .swiper-wrapper').html(case_list)
        var swiper = new Swiper('.swiper-container', {
            slidesPerView: 'auto',
            spaceBetween: 0
        });
    }
})


// 点击其他视频到详情
$('.play_list_box').on('click','.play_list',function () {
    var $this = $(this)
    let case_show_id = $this.attr('data-id')
    window.location.href = './play.html?caseShowId=' + case_show_id +'&cardShowId=' + cardShowId +'&caseNumber=' + caseNumber+ '&card_token=' + card_token
})

// 点赞记录
init()

function init() {
    let listData = JSON.parse(localStorage.getItem('caseList'))
    let playData = listData.find(v => v._id == cardShowId)['list'].find(v => v.case_show_id == caseShowId)
    if (!('hasSee' in playData)) {
        playData.hasSee = true
        localStorage.setItem('caseList', JSON.stringify(listData))
        //这里写第一次看的请求
        //如果是每次看都请求则次不需要此if
        postLog(0,caseShowId)
    }
    //如果是每次看都请求则此处写请求
    //...
    if ('_zan' in playData) {
        // $('.praise img').attr('src', playData['_zan'] ? './images/praise.png' : './images/praised.png')
        $('.praise img').attr('src', playData['_zan'] ? 'https://xinyuetest.oss-cn-shanghai.aliyuncs.com/doc/20319ff1892928f14cad23c61b99d288-f3f361a55ddcafa04e937a6ad15d5683.png' : 'https://xinyuetest.oss-cn-shanghai.aliyuncs.com/doc/a54131575965df691dffd388144c04a4-d61347a6738e244009e1ee41022eab93.png')
    } else {
        $('.praise img').attr('src', 'https://xinyuetest.oss-cn-shanghai.aliyuncs.com/doc/20319ff1892928f14cad23c61b99d288-f3f361a55ddcafa04e937a6ad15d5683.png')
    }
}


$('.praise').on('click', function () {
    var $img = $('.praise img')
    var src = $img.attr('src')
    //这里写点赞的请求
    //下面的js写在请求成功的回调函数里

    // if(src == './images/praise.png'){
    if(src == 'https://xinyuetest.oss-cn-shanghai.aliyuncs.com/doc/20319ff1892928f14cad23c61b99d288-f3f361a55ddcafa04e937a6ad15d5683.png'){
        $.ajax({
            url: url + '/wxapi/save/log',
            data: {type: 1, case_id: caseNumber, case_show_id: caseShowId},
            type: "post",
            xhrFields: {
                withCredentials: true
            },
            dataType: "json",
            success: function (res) {
                console.log(res, 'savelog')
            }
        })
    }
    // var type = src == './images/praise.png' ? true : false
    var type = src == 'https://xinyuetest.oss-cn-shanghai.aliyuncs.com/doc/20319ff1892928f14cad23c61b99d288-f3f361a55ddcafa04e937a6ad15d5683.png' ? true : false
    // $img.attr('src', src == './images/praised.png' ? './images/praise.png' : './images/praised.png')
    $img.attr('src', src == 'https://xinyuetest.oss-cn-shanghai.aliyuncs.com/doc/a54131575965df691dffd388144c04a4-d61347a6738e244009e1ee41022eab93.png' ? 'https://xinyuetest.oss-cn-shanghai.aliyuncs.com/doc/20319ff1892928f14cad23c61b99d288-f3f361a55ddcafa04e937a6ad15d5683.png' : 'https://xinyuetest.oss-cn-shanghai.aliyuncs.com/doc/a54131575965df691dffd388144c04a4-d61347a6738e244009e1ee41022eab93.png')
    let listData = JSON.parse(localStorage.getItem('caseList'))
    let playData = listData.find(v => v._id == cardShowId)['list'].find(v => v.case_show_id == caseShowId)
    playData['_zan'] = !type
    localStorage.setItem('caseList', JSON.stringify(listData))

})
