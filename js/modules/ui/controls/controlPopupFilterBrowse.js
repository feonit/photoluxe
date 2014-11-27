/**
 * Контролл "фильтрации контента основная"
 * control init only when DOM is ready
 * Created by feonit on 21.08.14.
 *
 * @events = ['change']
 * @example = new popupFilterBrowse({"container": ".control-popupBrowse"})
 *
 * */

define(['jquery','underscore','helpers'], function($,_,helpers){

    var selectorCaption = '.control-caption-text',
        selectorTimeCaption = '.control-caption-time-text',
        selectorContext = '.context',
        selectorTime = '.time',
        selectorPopupPanel = '.popupPanel';


    /**
     * Перерисовывает шапку контрола, 
     * ориентируется на выбранные элементы списков
     * Внимание! фича с иконками основана на атрибуте "data-icon"
     * @this {Object} DOM element
     * */

    function redrawCaptions() {
        var $this = this;

        var curContext = $this.find(selectorContext + ' .control-link.active').eq(0).text();
        var curTime = $this.find(selectorTime + ' .control-link.active').eq(0).text();

        $this.find(selectorCaption).text( curContext + (curTime ? ' / \n' + curTime : '') );
        $this.find(selectorTimeCaption).text( curTime );

        // управление иконкой
        redrawCaptions.iconClass = redrawCaptions.iconClass || '';
        $this.removeClass(redrawCaptions.iconClass);
        var iconClass = $this.find('.active').attr('data-icon');
        redrawCaptions.iconClass = iconClass;
        $this.addClass(iconClass);
    }

    /**
     * Callback for popup
     * @this {Object} DOM element
     * */

    function clickControlFn( event ){
        var $this = this;
        
        var $node = $(event.currentTarget);
        var data = $this.data();

        if ($node.hasClass('control-popupBrowse')) {
            $this.find(selectorPopupPanel).is(':visible') ? $this.removeClass('open') : $this.addClass('open'); // todo хрень какая-то
            return true;
        }

        if ($node.hasClass('time-caption')) {
            $this.find(selectorTime).toggleClass('open');
            event.stopImmediatePropagation();
            return true;
        }

        if ($node.hasClass('context')) {                     //меняем данные
            data.type = $(event.target).data('request');  //обновляем значение
        }

        if ($node.hasClass('time')) {
            data.range = $(event.target).data('request');
        }

        $this.find(selectorTime).addClass('open');                            //закрываем список времени

        $this.removeClass('open');                                   //закрываем панель

        $this.data(data);                       //записываем состояние контрола в ДОМЭлемент
        $this.triggerHandler('change', data); //публикуем событие
    }

    /**
     * Sets default state of control
     * Adds toggler on items
     * @this {Object} DOM element
     * */

    function initFirstState(){
        var $this = this;

         $this.data({
             type : $this.find(selectorContext + ' .control-link.active').data('request'),
             range : $this.find(selectorTime + ' .control-link.active').data('request')
         });

        helpers.switchToggler( $this.find(selectorContext).find('.control-link'), 'active', 'context');
        helpers.switchToggler($this.find(selectorTime).find('.control-link'), 'active', 'time');
        redrawCaptions.call($this);
    }


    /**
     * @params options.container {String} or {Node(jQuery) Object}
     * (Это декоратор)
     * */

     return function( options ) {

        var $control = $(options.container);

         /**
          * Инициализация контрола
          * */

          initFirstState.call($control);

         /**
          * Привязка страницы к событиям контрола
          * */

         $control.on('change', function(){
             redrawCaptions.call($control);
         });

         $control.on('click', '.context, .time, .time-caption', function( event ){
             clickControlFn.call($control, event);
         });

         $control.on('click', function(){
             clickControlFn.call($control, event);
         });

         $control.attr('data-control', 'is-browse');

         return $control;
    };
});

