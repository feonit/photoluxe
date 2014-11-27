/**
 * Контрол "фильтрация по месторасположению"
 * Created by feonit on 21.08.14.
 * @example  var $location = new popupFilterLocation({ container : this.$page.find(".control-popupLocation")});
 * @events = ['change-location', 'change-nearby']
 */

define(['jquery', 'underscore', 'chosen' , 'options', 'select2'],
    function($, _, choosen, opt, select2){


     /**
      * Установка начальных значений
      * */

     function initDefaultState(){
        var $this = this;

        $this.data({
            'nearby': false,
            'location': false
        });

         // запоминаем дефолтную строку из вёрстки
         initDefaultState.defaultCaption = initDefaultState.defaultCaption || $this.find('.caption').text();
         $this.find('.caption').text(initDefaultState.defaultCaption)
     }

    /**
     * initialize Select2 plugin for node element
     * @this {Object} DOM object
     * */

     function initSelect2(){
        var $this = this;

        $this.select2({
            minimumInputLength: 3,                          // Minimum Input
            placeholder: "Select a Location",               // Placeholders
            maximumSelectionSize: 3,                        // Maximum Selection Size
            dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
            allowClear: true,                                          // formatSelection: format fn, Templating
            ajax: { // instead of writing the function to execute the request we use Select2's convenient helper

                //url: "/js/json/control-location.json", // фейковые данные (формат удобнее)
                url: "/user/search/complete-location.json",

                dataType: 'json',
                data: function (term, page) {
                    return {
                        query: term, // search term
                        limit: 10
                    };
                },
                results: function (data, page) { // parse the results into the format expected by Select2.
                    // since we are using custom formatting functions we do not need to alter remote JSON data
                    //return data;

                    function adapterAPI(){
                        data = {
                            more : false,
                            results: _.each(data, function(elem){
                                elem.id = Math.random() + ''; // need some id for tags option
                            })
                        };
                    }
                    adapterAPI();
                    return data;
                }
            },

            escapeMarkup: function(m) {
                return m;
            },        // Escape

            formatResult: function format(state, $obj) {
                return '<span>'+state.title+'</span>'
            },

            formatSelection: function format(state, $obj) {
                return '<span>'+state.title+'</span>'
            }
        });
    }

    /**
     * @params options.container {String} or {Node(jQuery) Object}
     * (Это декоратор)
     * */

    return function( options ){

        var $control = $(options.container),
            $caption = $control.find('.caption'),
            $popupPanel = $('.popupPanel', $control),
            $nearby = $('.control-nearby', $popupPanel),
            $clear = $('.control-clear', $popupPanel),
            $apply = $('.control-apply', $popupPanel),
            $select2 = $control.find('.control-select2');

        /**
         * Инициализация контрола
         * этот контрол работает на основе всего одного селекта
         * */

        initSelect2.call($select2);
        initDefaultState.call($control);

        /**
         * Привязка страницы к событиям контрола
         * */

        $control.on('click', function( event ){
            $control.toggleClass('open');
        });

        $popupPanel.on('click', function(){
            return false;
        });

        $apply.on('click', function( event ){
            var text = $select2.select2('data').title;

            $control.triggerHandler('change-location', {
                location : text
            });
            $control.data({
                location : text
            })
        });

        $nearby.on('click', function(){
            $nearby.toggleClass('active');
            var state = $nearby.hasClass('active');
            var data = {
                nearby : state,
                location : false
            };
            $control.data(data);
            $control.triggerHandler('change-nearby', data);
        });

        $clear.on('click', function(){
            $select2.select2('data', null);
            initDefaultState.call($control);
            $nearby.removeClass('active');
            $control.triggerHandler('change-nearby', { nearby : false, location : false });
        });

        $control.on('change-nearby', function(){
            $nearby.hasClass('active') ? $caption.text('Nearby') : 0;
            $control.toggleClass('open');
        });

        $control.on('change-location', function(){
            var text = $control.find('.control-select2').select2('data').title
            $caption.text(text);
            $control.toggleClass('open');

            $control.data({
                location : text,
                nearby : false
            });

            $nearby.removeClass('active');
        });

        return $control;
    }
});


