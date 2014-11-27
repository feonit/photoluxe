/*
 * Прототип сайдбара для страниц
 *
 * @param {String} namePage Имя страницы(секции)
 * @param {String} arrow Левый или правый бар
 *
 * @example new SideBar('photo', 'left');
 * */

define(['jquery', 'underscore', 'options', 'router'], function($, _, options, router){


    //===== Interface ==============================

    /*
     * Открывает бар
     * */

    SideBar.prototype.open = open;

    /*
     * Закрывает бар
     * */

    SideBar.prototype.close = close;

    /*
     * Очищает то что внутри
     * */

    SideBar.prototype.clear = clear;

    /*
     * Вставляет разметку
     * */

    SideBar.prototype.setHTML = setHTML;




    //===== Realization ==============================

    function SideBar (arrow) {
        var $body = $('body');

        var selector = '.control-panel-' + arrow;
        var barExist = $body.find(selector);

        // если бар уже есть, возвращаем его
        if (barExist.length){
            return barExist.data();
        }

        var that = this;

        // синтезируется разметка бара помещается на странице
        $body.append(_.template(templateBar, {arrow:arrow}));

        // API контрола
        this.arrow = arrow;
        this.box = $body.find(selector);
        this.content = $body.find('.content-control-panel-' + arrow);

        // события
        this.box.find('.hide-control-panel-' + arrow).on('click', _clickHideBtn.bind(this));

        // так можно повесить событие на закрытие бара
        this.onclose = null;

        // привязываем API к элементу
        this.box.data(this);

        router.on('all', function(){
            that.close();
        })
    }

    function _clickHideBtn (){
        this.close();
        if ('function' === typeof this.onclose){
            this.onclose();
        }
    }

    var templateBar = "" +
        "<div class='control-panel-<%= arrow%>'>" +
            "<div class='hide-control-panel-<%= arrow%>'></div>" +
            "<div class='content-control-panel-<%= arrow%>'></div>" +
        "</div>";

    function open (){
        var animation = {};
            animation[this.arrow] = 0;

        this.box.show().animate(animation, options.mainAnimateSpeed);
        return this;
    }

    function close (){
        var animation = {},
            that = this;
        animation[this.arrow] = '-600px';

        this.box.show().animate(animation, options.mainAnimateSpeed);

        if ('function' === typeof that.onclose){
            that.onclose();
        }
        return this;
    }

    function clear (){
        this.content.empty();
        return this;
    }


    function setHTML (html){
        this.content.html(html);
        return this;
    }

    return SideBar;
});



