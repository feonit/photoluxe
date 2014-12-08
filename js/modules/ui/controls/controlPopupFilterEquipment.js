/**
 * Контрол "фильтрация по аппаратуре"
 * Created by feonit on 21.08.14.
 *
 * @events = ['change']
 */

define(["jquery", 'underscore', 'helpers', 'options'], function($, _, helpers, options ) {

    var curSort = 'abc'; // or 'popular'

    function initControl(){
        var $this = this;

        $.when(
                $.get(_.template(options.Urls.discover['dict-model'], { sort : curSort })),
                $.get(_.template(options.Urls.discover['dict-lens'], { sort : curSort }))
            )
        .then(function( responseCamera, responseLens) {

            $this.find('.select2-camera').select2({
                data: { results: responseCamera[0], text: 'text' },
                placeholder: "Select a Camera",
                multiple: true
            });

            $this.find('.select2-lens').select2({
                data: { results: responseLens[0], text: 'text' },
                placeholder: "Select a Lens",
                multiple: true
            });
        });

        /**
         * Установка пустого состояния
         * */
        $this.data({
            collectionLensId : false,
            collectionCameraId : false
        });
    }

    /**
     * @params options.container {String} or {Node(jQuery) Object}
     * (Это декоратор)
     * */

     return function ( options ) {

        var $control = $(options.container),
            $btnApply = $control.find('.control-apply'),
            $selectCamera = $control.find('.select2-camera'),
            $selectLens = $control.find('.select2-lens'),
            $switchSort = $control.find('.control-sorting');


        /**
         * Инициализация контрола
         * */

         initControl.call($control);

        /**
         * Привязка страницы к событиям контрола
         * */

        $control.on('click', function( event ){
            $control.toggleClass('open');
        });

        $control.find('.control-clear').on('click', function( event ){
            $selectCamera.select2('data', null);
            $selectLens.select2('data', null);
            event.stopImmediatePropagation();
        });

         /**
          * Применение выбранных значений
          * */

         $btnApply.on('click', function( event ){

             $selectLens.select2('data');

             $btnApply.removeClass('active');

            /**
             * Публикуется событие с массивами идентификаторов сущностей
             * */

             var data = {
                collectionLensId : _.map($selectLens.select2('data'), function( lens ){
                    return lens.id + ''; //for GET need string
                }),
                collectionCameraId : _.map($selectCamera.select2('data'), function( camera ){
                    return camera.id + '';
                })
            };

             $control.data( data );
             $control.triggerHandler('change-filter', data );
        });

        /**
         * Смена сортировки
         * */

        $control.find('.control-sorting').on('click', function( event ){
            $switchSort.find('button').removeClass('active');
            $(event.target).addClass('active');
            curSort = $(event.target).data('sort');
            initControl.call($control);
            event.stopImmediatePropagation();
        });

        $control.on('change', function(){
            $btnApply.addClass('active');
        });

        return $control;
    };
});