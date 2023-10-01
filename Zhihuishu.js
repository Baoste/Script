/*
    暂不完善
    ！！！一开始运行时，必须暂停在接近视频开头处！！！
*/

function click(dom) {
    var func = $._data(dom).events.click[0].handler
    window.fakeclick = function(){
        var event = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            clientX: 150,
            clientY: 150
        });
        const wrapevent = new Proxy(event, {
            get: function(target, property) {
                if (property === 'isTrusted') {
                    return true;
                } else {
                    return Reflect.get(target, property);
                }
            }
        });
        var clickevent = {
            originalEvent: wrapevent,
        }
        func(clickevent)
    }
    fakeclick()
}

function safeclick() {
    Element.prototype._addEventListener = Element.prototype.addEventListener
    Element.prototype.addEventListener = function () {
        const args = [...arguments]
        const temp = args[1]
        args[1] = function () {
            const args2 = [...arguments]
            args2[0] = new Proxy(args2[0], {
                get(target, p) {
                    return p === 'isTrusted' ? true : target[p]
                }
            })
            return temp(...args2)
        }
        return this._addEventListener(...args);
    }
}
    
function gettime(dom) {
    $('.controlsBar').attr('style', 'z-index: 2; overflow: inherit;')
    var re = /\d+.\d/
    var str = dom.attr('style')
    if (re.test(str)) {
        return Number(re.exec(str)[0])
    }
    return 0
}

function playvideo() {
    $('.controlsBar').attr('style', 'z-index: 2; overflow: inherit;')
    var speedButton = document.querySelector('[class="speedTab speedTab15"]')
    click(speedButton)
    var playButton = document.querySelector('.playButton')
    click(playButton)
}

function playnext() {
    var playNext = document.querySelector('.current_play + li')
    if (playNext == null) {
        playNext = $('.current_play').parent().parent().next().find('li')
        if (playNext.length != 0) {
            playNext = playNext[1]
        } else {
            playNext = $('.current_play').parent().parent().parent().next().find('li')[2]
        }
    }
    var e = new Event('click')
    playNext.dispatchEvent(e)
}


var iframe = document.createElement('iframe')
document.body.appendChild(iframe)
window.console = iframe.contentWindow.console


var videoProgress = 0
var flag = true
var old = Element.prototype.addEventListener
var videoBreak = gettime($('div.video-topic li')) - 1


playvideo()
setInterval(() => {
    if ($('[aria-label="弹题测验"]').length != 0) {
        var e = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            clientX: 150,
            clientY: 150
        });
        $('li.topic-item')[2].dispatchEvent(e)
        $('div.btn')[0].click()
        Element.prototype.addEventListener = old
        playvideo()
    } else {
        videoProgress = gettime($('.passTime'))
        console.log(videoProgress)
        if (videoProgress >= 99.5) {
            playnext()
            flag = true
            setTimeout(() => {
                videoBreak = gettime($('div.video-topic li')) - 0.5
                playvideo()
            }, 3000);
        } else if ( videoProgress > videoBreak && videoProgress <90 && flag) {
            safeclick()
            flag = false
        }
    }
}, 1000);
