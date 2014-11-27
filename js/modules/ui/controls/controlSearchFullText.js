/**
 * Контрол "полнотекстовой фильтрации"
 * Created by feonit on 21.08.14.
 */

define(['jquery', 'underscore', 'select2', 'options'],
    function($, _, select2, options){

    /**
     * initialize Select2 plugin for node element
     * @this {Object} DOM object
     * */

    function initSelectControl(){
        var $this = this;

        $this.select2({
            minimumInputLength: 3,                          // Minimum Input
            placeholder: "Select by some word",               // Placeholders
            maximumSelectionSize: 3,                        // Maximum Selection Size
            dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
            allowClear: true,                                          // formatSelection: format fn, Templating
            ajax: { // instead of writing the function to execute the request we use Select2's convenient helper

                //url: "/js/json/control-location.json", // фейковые данные (формат разумнее)
                url: options.Urls.discover.searchFullTextUrl,

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
     * (Это фабрика(декоратор элемента) по данному контролу)
     * */

    return function( options ){
        var $control = $(options.container);

        /**
         * Инициализация контрола
         * */

         initSelectControl.call($control);

        /**
         * Привязка страницы к событиям контрола
         * (привязка видимости контрола к кнопке главного меню)
         * */

        $('.control-search').on('click', function(){
            $(this).toggleClass('open');
            $control.parent().toggleClass('open');
        });

        return $control;
    }
});
