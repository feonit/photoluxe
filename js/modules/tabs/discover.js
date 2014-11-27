/**
 * Вкладка Discover
 * Created by feonit on 21.08.14.
 * */

define(["jquery", 'underscore',
            // пакет для селект-контролов
            'controlPopupFilterEquipment', 'controlPopupFilterBrowse', 'controlPopupFilterLocation', 'controlSearchFullText',
            // пакет для контента
            'PaginatedView', 'PhotographerListView', 'PhotographersPageableCollection'],
    function($, _,
             popupFilterEquipment, popupFilterBrowse, popupFilterLocation, controlSearchFullText,
             PaginatedView, PhotographerListView, PhotographersPageableCollection){

    return new function(){

        var that = this;

        this.pageName = 'discover';
        this.$page = $('.' + this.pageName);

        var $browse     = popupFilterBrowse({ container : this.$page.find('.control-popupBrowse')}),
            $equipment  = popupFilterEquipment({"container": '.control-popupEquipment'}),
            $location   = popupFilterLocation({ container : this.$page.find(".control-popupLocation")}),
            $searchText = controlSearchFullText({"container": this.$page.find('.control-search-select')});


        /**
         * Проверить все контролы, составить хеш всех фильров
         * */

         function getAllFilters(){
            var dataBrowse = $browse.data();
            var dataLocation = $location.data();
            var dataEquipment = $equipment.data();

            return {
                type : dataBrowse.type,
                range : dataBrowse.range,
                nearby : dataLocation.nearby,
                location : dataLocation.location,
                lens : (dataEquipment.collectionLensId !== false) && $.param( { lens : dataEquipment.collectionLensId} ),
                camera : (dataEquipment.collectionCameraId !==false ) && $.param( { camera : dataEquipment.collectionCameraId} )
            }
        }
        /**
         * Обработка фильтра временного
         * */

        $browse.on('change', function(ev, data) {
            that.filterAction({
                queryParams : getAllFilters()
            });
        });

        /**
         * Обработка фильтра месторасположения
         * */

        $location.on('change-location', function(ev, data) {
            that.filterAction({
                queryParams : getAllFilters()
            });
        });

        /**
         * Обработка фильтра месторасположения (неподалёку)
         * */

        $location.on('change-nearby', function(ev, data) {
            that.filterAction({
                queryParams : getAllFilters()
            });
        });

        /**
         * Обработка фильтра полнотекствого поиска
         * */

        $searchText.on('change', function() {
            that.filterAction({
                queryParams : {
                    search : $(this).select2('data').title
                }
            });
        });

        /**
         * Обработка фильтра по аппаратуре
         * */

        $equipment.on('change-filter',function(ev, data) {
            that.filterAction({
                queryParams : getAllFilters()
            });
        });

        /**
         * @description Это метод генерациии контента на основе полученной коллекции объектов по модели фотографа
         * по умолчанию фильтрации нет, параметры фильтрации контента передаются от контролов, на их основе
         * вызывается новый контент.
         * При загрузке страницы метод вызывается автоматически.
         *
         * @param {Object} queryParams Хеш выбранных фильтров.
         * */

         that.init = function( queryParams ){
            that.filterAction = that.filterAction || that.init;

            var photographersCollectionEditors = new PhotographersPageableCollection( queryParams );
            new PhotographerListView({el: '#control-content-photographer-list', collection: photographersCollectionEditors});
            new PaginatedView({ el: '.control-pagination-photographer', collection: photographersCollectionEditors});

            /**
             * Далее происходит только автоматическое обновление коллекции, и если что-то изменится
             * в модели, вьюшки себя перерисуют
             * */
            that.init = function(){
                photographersCollectionEditors.fetch();
            }
         };

        /**
         * Фильтрация контента происходит как переинициализация
         * контента на основе новой полученной коллекции
         * */
        that.filterAction = null;
    };
});