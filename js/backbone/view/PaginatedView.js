/*
* Прототип представления для любого пагинатора
*
* */

define(['text!templates/pagination.html'], function(paginationTemplate){

    return Backbone.View.extend({

        events: {
            'click a.control-page': 'gotoPage',
            'click a.control-page-left' : 'leftAction',
            'click a.control-page-right' : 'rightAction'
        },

        template: _.template(paginationTemplate),

        initialize: function(){
            this.collection.on('reset', this.render, this);
            //this.collection.on('change', this.render, this);
            //копируем зыс в дата-свойство элемента, для  доступа в переключалке пагинации стрелочками.
            //this.$el.data('paginator', this);
        },

        render: function () {
            //уже не испльзуется getParametersSpace
            //this.collection.state = _.extend ( this.collection.state, this.getParametersSpace());
            this.$el.html( this.template( this.collection.state ));
        },

        gotoPage: function (e) {
            e.preventDefault();
            this.collection.getPage( parseInt($(e.target).data('page')) );
        },

        leftAction: function(e){
            //var page = (page < state.firstPage) ? state.firstPage : page;
            e.preventDefault();
            this.gotoPage(e);
        },

        rightAction: function(e){
            e.preventDefault();
            this.gotoPage(e);
        }


        /**
         * дополнительные параметры для пагинации
         * на случай, если вновь понадобятся вид 1,2,3...14,15.
         * http://habrahabr.ru/post/160651/
         * @deprecated
         * */

//         getParametersSpace : function(){
//            // дополнительные параметры для пагинации
//            // http://habrahabr.ru/post/160651/
//            var page_active = this.collection.state.currentPage;
//            var page_count = this.collection.state.totalPages;
//
//            var range = Math.floor(this.page_show / 2);
//            var nav_begin = page_active - range;
//
//            if (this.page_show % 2 == 0) { // Если четное кол-во
//                nav_begin++;
//            }
//            var nav_end = page_active + range;
//
//            var left_dots = true;
//            var right_dots = true;
//            if (nav_begin <= 2) {
//                nav_end = this.page_show;
//                if (nav_begin == 2) {
//                    nav_end++;
//                }
//                nav_begin = 1;
//                left_dots = false;
//            }
//
//            if (nav_end >= page_count - 1 ) {
//                nav_begin = page_count - this.page_show + 1;
//                if (nav_end == page_count - 1) {
//                    nav_begin--;
//                }
//                nav_end = page_count;
//                right_dots = false;
//            }
//
//            // нормализация, алгоритм хреновый оказался
//            if (nav_begin < 1) nav_begin = 1;
//
//            return  {
//                nav_begin: nav_begin,
//                nav_end: nav_end,
//                left_dots: left_dots,
//                right_dots: right_dots
//            };
//        }
    });
});