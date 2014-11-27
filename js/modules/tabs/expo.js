/*
 * Вкладка Photo
 *
 * */

expoModules = [
    "jquery",
    'underscore',
    'ajax',
    'filtrationChangeHandler',
    'PhotoSliderView',
    'PaginatedView',
    'FrameView',
    'PhotosPageableCollection',
    'options'
];

expoInit = function ($, _, ajax, filtrationChangeHandler, PhotoSliderView, PaginatedView, FrameView, PhotosPageableCollection, options) {
    return new function () {
        this.name = this.pageName = "expo";


        this.init = function () {

            //биндим кнопулю по которой будет всплывать сёрч
            //var bindSearch = function(){
            //    $('.search')
            //        .unbind()
            //        .bind('click',function(){
            //            $('.container-expo-search-panel').toggle();
            //        })
            //};

            //bindSearch();

            var photosCollectionEditors = new PhotosPageableCollection({
                queryParams: {
                    type: 'is_editor_choice'
                }
            });

            var firstFrameView = new FrameView({el: '.content-photo-editors', collection: photosCollectionEditors});
            new PaginatedView({ el: '.pagination-editors', collection: photosCollectionEditors});
            photosCollectionEditors.on('reset', function(){
                new PhotoSliderView({
                    el: '.photo-slider',
                    model: this.models[0]
                });
            });

            this.init = function(){
                photosCollectionEditors.fetch();
                //bindSearch();
            };

            return true;
        };


        /*
         * Деинициализация модуля
         * */

        this.destroy = function(){
            //empty
        };
    };
};

define(expoModules, expoInit);
