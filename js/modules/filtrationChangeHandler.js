define(['jquery', 'underscore', 'text!templates/photoGrid.html'], function($, _, photoGridTemplate) {

    return new function () {
        var module = this;
        this.go = function (currentPageName) {
            /* * * * * * * * * * * * * * * * * * * * * * *
             * Функция апдейта "плитки фотографий" по сёрчу
             * 1) ищем поля фильтрации
             * 2) формируем строку запроса
             * 3) запрашиваем данные для плитки
             * 3.1) если данные есть
             * 3.1.1) убираем старую плитку, строим новую
             * 3.2) если данных нет - отображаем плашку "Нет результатов поиска для выбранных критериев"
             * */
            currentPageName = currentPageName || '';

            var curGridContainer = '';
            if (currentPageName) {
                curGridContainer = '#' + currentPageName;
            } else {
                console.log('warning! Filtration runs without container-name parameter');
            }

             //1)
            function getRequestData() {
                /**
                 * надо найти три контрола - Едиторс чус, категория, цвет, и определить их параметры
                 */
                var data = [];

                //добавляем имя страницы, которое прийдёт из
                if (currentPageName && typeof currentPageName === 'string') {
                    data.push({
                        name:'currentPageName',
                        value: currentPageName
                    });
                }

                var currentContainer = $(curGridContainer);
                //попап - фильтры более-менее однотипные поэтому собираем их одним селектором
                //todo: переписать эти контролы с сохранением инфы не в скрытые инпуты а в dataset или в  jQuery.data(), как в примере ниже (color)
                var popupFilters = $(
                        '.control-photo-type input[type=hidden],' +
                        '.control-photo-category input[type=hidden]',
                    currentContainer
                ).serializeArray();

                if (popupFilters.length) {
                    data = data.concat(popupFilters);
                }
                var controlColor = $('.control-color-picker', currentContainer);
                var color = controlColor.data().color;
                if (color) {
                    data.push({
                        name: "color",
                        value: color
                    });
                }
//                console.log(photoGridTemplate);
                return data;

            }


//            -------------------------------------------------------------------------

            //start here
            console.log(getRequestData());

        };
    };
});
