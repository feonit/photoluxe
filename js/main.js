define([   
        'app',
        'router', 
        'backbone', 
        'jquery', 
        'options', 
        'helpers', 
        'menu'
    ],
    function(
        app,  
        router,  
        Backbon,   
        $,        
        options,   
        helpers,   
        menu
        ){

    if (!options.modeSPA) return;

    // todo так уж получилось, что есть интерфейсы, которые зависят от роута
    app._initModules(menu);

    // Запуск начального маршрута в пространстве имён приложения
    // и запуск всей навигации из этого экземпляра
    app.router = router;

    app.router.on('route', function(){
        console.log( '[application] Сработал роут: ' + arguments[0] );
        //console.log(arguments)}
    });

    // Запуск начального маршрута и включение поддержки HTML5 History API,
    // задание '/' в качестве корневого каталога по умолчанию
    // Измените его в app.js
    Backbon.history.start({ pushState: true, root: app.root, silent: false });


    // Вся относительная навигация должна передаваться методу navigate
    // для обработки маршрутизатором. Если у ссылки есть атрибут 'data-bypass',
    // то полностью исключите делегирование.
    $(document).on('click', "a[href][data-bypass]", function(event){

        // Получение абсолютного href якоря.
        var href = { prop: $(this).prop('href'), attr: $(this).attr('href') };

        // Получение абсолютного корня.
        var root = location.protocol + '//' + location.host + app.root;

        // Корень должен входить в href якоря, указывая на его относительность.
        if (href.prop.slice(0, root.length) === root) {


            // Подавление события по умолчанию, чтобы ссылка
            // не приводила к обновлению страницы.
            event.preventDefault();

            // 'Backbone.history.navigate' достаточен для всех маршрутизаторов
            // и генериует корректные события. Внутренний метод
            // 'navigate' маршрутизатора
            // всегда вызывает его. Этот фрагмент взят из корня.

            // Вычитаем базовую часть из якоря (по идее, роутеру это должно быть и так понятно)
            // href.attr = href.attr.slice(app.root.length);
            var routIsFound = Backbone.history.navigate(href.attr,  {trigger: true});

            // Для дебага
            if ( !routIsFound ){
                console.log('Route is not found:' + href.attr);
            }
        }
    });
});
