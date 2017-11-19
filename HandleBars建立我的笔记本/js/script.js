(function($) {
    var GETCLASSESS = 'http://imoocnote.calfnote.com/inter/getClasses.php';
    var GETCLASSCHAPTER = 'http://imoocnote.calfnote.com/inter/getClassChapter.php';
    var GETCLASSNOTE = 'http://imoocnote.calfnote.com/inter/getClassNote.php';
    //设置AJAX的全局默认选项
    $.ajaxSetup({
        error: function(jqXHR, textStatus, errorMsg) { // 出错时默认的处理函数
            // jqXHR 是经过jQuery封装的XMLHttpRequest对象
            // textStatus 可能为： null、"timeout"、"error"、"abort"或"parsererror"
            // errorMsg 可能为： "Not Found"、"Internal Server Error"等

            // 提示形如：发送AJAX请求到"/index.html"时出错[404]：Not Found
            alert('发送AJAX请求时出错[' + jqXHR.status + ']：' + errorMsg);
            return false;
        }
    });

    function renderTemplate(templateSelector, data, htmlselector) {
        //注册一个Handlebars模版，通过id找到某一个模版，获取模版的html框架
        var myTemplate = Handlebars.compile($(templateSelector).html());

        //将json对象用刚刚注册的Handlebars模版封装，得到最终的html，插入到基础table中。
        $(htmlselector).html(myTemplate(data));
    }

    function refreshClasses(curPage) {
        $.getJSON(GETCLASSESS, {
            curPage: curPage
        }, function(data) {
            renderTemplate("#class-template", data.data, '.classes');
            // 分页模板
            renderTemplate("#pag-template", formatPag(data), '.pag');
            // 分页点击交互
            /* $('li.clickable').on('click', function() {
                 // 获取data-id的值，用data('id')
                 refreshClasses($(this).data('id'));
             });*/
        });
    }
    // 事件委托:指定一个事件处理程序来管理某一类型的所有事件
    // 
    // 举个列子：有三个同事预计会在周一收到快递。为签收快递，
    // 有两种办法：一是三个人在公司门口等快递；二是委托给前台MM代为签收。
    // 现实当中，我们大都采用委托的方案（公司也不会容忍那么多员工站在门口就
    // 为了等快递）。前台MM收到快递后，她会判断收件人是谁，然后按照收件人的
    // 要求签收，甚至代为付款。这种方案还有一个优势，那就是即使公司里来了
    // 新员工（不管多少），前台MM也会在收到寄给新员工的快递后核实并代为签收。
    // 
    // 如果要频繁地添加DOM元素，并且给新添加的DOM元素绑定事件的话，
    // 用live(),delegate(),on()等方法。鉴于jQuery从1.7之后就不推荐live（）
    // 和delegate（）方法了，所以还是使用on（）方法
    function bindPageEvent() {
        // 父元素不会变，将事件委托给父元素处理
        $('#pag').on('click', 'li.clickable', function() {
            // 获取data-id的值，用data('id')
            refreshClasses($(this).data('id'));
        });
    }
    bindPageEvent();
    // 获取首页
    $.getJSON(GETCLASSESS, {
        curPage: 1
    }, function(data) {
        renderTemplate("#class-template", data.data, '.classes');
        // 分页模板
        renderTemplate("#pag-template", formatPag(data), '.pag');
        // 分页点击交互
        /*$('li.clickable').on('click', function() {
            // 获取data-id的值，用data('id')
            refreshClasses($(this).data('id'));
        });*/
    });

    function showNote(show) {
        if (show) {
            $('.overlap').css('display', 'block');
            $('.notedetail').css('display', 'block');
        } else {
            $('.overlap').css('display', 'none');
            $('.notedetail').css('display', 'none');
        }
    }
    //点击遮罩层处关闭遮罩
    $('.overlap').on('click', function() {
        showNote(false);
    });
    //课程点击委托
    function bindClassEvent() {
        // 父元素不会变，将事件委托给父元素处理
        $('.classes').on('click', 'li', function() {
            //取出点击的课程的id
            var classId = $(this).data('id');
            /* // 获取大纲
             $.getJSON(GETCLASSCHAPTER, {
                 cid: classId
             }, function(data) {
                 renderTemplate('#chapter-template', data, '#chapterdiv');
                 // 保证渲染完毕才出现课程，避免异步操作出现的延迟
                 showNote(true);
             });
             // 获取课程
             $.getJSON(GETCLASSNOTE, {
                 cid: classId
             }, function(data) {
                 renderTemplate('#note-template', data, '#notediv');
                 // 保证渲染完毕才出现课程，避免异步操作出现的延迟
                 showNote(true);
             });*/
            $.when($.getJSON(GETCLASSCHAPTER, {
                cid: classId
            }), $.getJSON(GETCLASSNOTE, {
                cid: classId
            })).done(function(chapterData, noteData) {
                renderTemplate('#chapter-template', chapterData[0], '#chapterdiv');
                renderTemplate('#note-template', noteData[0], '#notediv');
                // 保证渲染完毕才出现课程，避免异步操作出现的延迟
                showNote(true);
            });
        });
    }
    bindClassEvent();

    //注册一个比较大小的Helper,判断v1是否大于v2
    Handlebars.registerHelper("compare", function(v1, v2, options) {
        if (v1 == v2) {
            //满足添加继续执行
            return options.fn(this);
        } else {
            //不满足条件执行{{else}}部分
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper("long", function(v, options) {
        if (v.indexOf('小时') != -1) {
            //满足添加继续执行
            return options.fn(this);
        } else {
            //不满足条件执行{{else}}部分
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper("addone", function(value) {
        return parseInt(value) + 1;
    });
    // 格式化日期
    Handlebars.registerHelper("formatDate", function(value) {
        if (!value) {
            return '';
        }
        var d = new Date(value);
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var hour = d.getHours();
        var minute = d.getMinutes();
        var second = d.getSeconds();
        var str = year + '-' + month + '-' + day + '&nbsp;' + hour + ':' + minute + ':' + second;
        return str;
    });

    function formatPag(pagData) {
        var arr = [];
        var total = parseInt(pagData.totalCount);
        var cur = parseInt(pagData.curPage);
        // 处理到首页(<<)的逻辑
        var toLeft = {};
        toLeft.index = 1;
        toLeft.text = '&laquo;'; // <<
        if (cur != 1) {
            toLeft.clickable = true;
        }
        arr.push(toLeft);

        // 处理到上一页(<)的逻辑
        var pre = {};
        pre.index = cur - 1;
        pre.text = '&lsaquo;'; // <
        if (cur != 1) {
            pre.clickable = true;
        }
        arr.push(pre);
        // 处理到1-cur页的逻辑
        if (cur <= 5) {
            for (var i = 1; i < cur; i++) {
                var pag = {};
                pag.text = i;
                pag.index = i;
                pag.clickable = true;
                arr.push(pag);
            }
        } else {
            // 如果cur>5 那么cur前的页面要显示 1 ... cur-2 cur-1 
            var pag = {};
            pag.text = 1;
            pag.index = 1;
            pag.clickable = true;
            arr.push(pag);
            var pag = {};
            pag.text = '...';
            arr.push(pag);
            // 从当前页前两页开始打印
            for (var i = cur - 2; i < cur; i++) {
                var pag = {};
                pag.text = i;
                pag.index = i;
                pag.clickable = true;
                arr.push(pag);
            }
        }
        // 处理第cur页的逻辑
        var pag = {};
        pag.text = cur;
        pag.index = cur;
        pag.cur = true;
        arr.push(pag);
        // 处理到cur页后的逻辑
        if (cur >= total - 4) {
            for (var i = cur + 1; i <= total; i++) {
                var pag = {};
                pag.text = i;
                pag.index = i;
                pag.clickable = true;
                arr.push(pag);
            }
        } else {
            // 如果cur<total-4 ,cur后的页面显示...
            // cur后显示两页，再往后的页面显示...
            for (var i = cur + 1; i <= cur + 2; i++) {
                var pag = {};
                pag.text = i;
                pag.index = i;
                pag.clickable = true;
                arr.push(pag);
            }
            var pag = {};
            pag.text = '...';
            arr.push(pag);
            // 最后一页 total
            var pag = {};
            pag.text = total;
            pag.index = total;
            pag.clickable = true;
            arr.push(pag);
        }
        // 处理到下一页(>)的逻辑
        var next = {};
        next.index = cur + 1;
        next.text = '&rsaquo;'; // >
        if (cur != total) {
            next.clickable = true;
        }
        arr.push(next);
        // 处理到尾页(>>)的逻辑
        var toRight = {};
        toRight.index = total;
        toRight.text = '&raquo;'; // >>
        if (cur != total) {
            toRight.clickable = true;
        }
        arr.push(toRight);
        return arr;
    }
})(jQuery)
