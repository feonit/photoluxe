console.log('[application] start');

/* Application and Core */


define(['jquery', 'options'], function($, options){

    var APP;

    var core = {

        /**
         * Базовый адрес приложения
         * @param {String}
         * */

        root : options.Urls.baseUrl,

        nameSpaceProperty : '_namespace',

        baseModules : [
            'ajax',
            'menu',
            'scrollPages',
            'header-auth-actions',
            'helpers',
            'statusLoad'
        ],
        
        otherModules : {},

        /**
         * Инициализатор приложения
         * @private
         * */

         _initApp: function(){

            // Регистрируем готовность DOM
            $(function(){
                console.log('DOM is Ready');
            });

            // А тем временем подгружаем базовый функционал приложения

            this._initCore();

            return this;
        },

        /**
        * Инициализация ядра приложения
        * @private
        * */

        _initCore : function(){
            var that = this;

            require(that.baseModules, function(){
                var modules = Array.prototype.slice.call(arguments, 0);

                // Регистрируем наличие базового функционала
                console.log('[application] initializes the modules');

                // Регистрируем базовый функционал в очередь на инициализацию
                that.initModules(modules);

            });
        },

        /**
         * Инициализатор модулей приложения
         * @param {Array} modules Имена модулей для инициализации
         * @public
         * */

         initModules : function(modules) {
            var that = this;

            if ("undefined" === typeof modules && $.isArray(modules)){
                return Error;
            }
            var i, len, module;

            for (i = 0, len = modules.length; i < len; i += 1){
                module = modules[i];

                // Модули, зависящие от DOM
                if ( typeof module.init === "function" ) {

                    (function(module){
                        $(function() {

                            if( module.name ){
                                console.log('[application] complete: ' + module.name);
                            }

                            module.init();

                        });
                    }(module));
                }

                // Модули, не зависящие от DOM
                if ( typeof module.init === "undefined" ) {

                    if( module.name ){
                        console.log('[application] complete core: ' + module.name);
                    }
                }

                // Модули, имеющие интерфейсы из консоли
                if (options.namespaceSupport) {
                    if ( typeof module[that.nameSpaceProperty] === "string" ) {
                        var space = that._addNamespaceSupport( module[that.nameSpaceProperty] );

                        //todo избавиться от лишней области
                        space['api'] = module;
                    }
                }
            }
            return modules;
        },

        /**
        * Деинициализатор модулей приложения
        * возможность остановки не базовых модулей ( отписка от событий, освобождение памяти )
        * @public
        * */

        deinitAllModules : function(){
            for ( var moduleName in this.otherModules ) {
                if ( this.otherModules.hasOwnProperty(moduleName) && typeof this.otherModules[moduleName].destroy === "function") {
                    this.otherModules[moduleName].destroy();
                }
            }
            this.otherModules = [];
        },


        /**
         * Метод для создания пространства имен. Использован принцип неразрушения, то есть
         * если пространство имен с заданным именем уже существует, оно не будет создано заново.
         *
         * @param {String}      nsString Строка, задающая имя модуля в пространстве имен приложения
         * @return {Object}     Возвращает объект соответствующий заданному пространству
         * */

        _addNamespaceSupport : function (nsString) {
            var parts = nsString.split('.'),
                parent = APP,
                i;
            // отбросить начальный префикс – имя глобального объекта
            if (parts[0] === 'APP') {
                parts = parts.slice(1);
            }
            for (i = 0; i < parts.length; i += 1) {
                // создать свойство, если оно отсутствует
                if (typeof parent[parts[i]] === 'undefined') {
                    parent[parts[i]] = {};
                }
                parent = parent[parts[i]];
            }
            return parent;
        }
    };

    core._initApp();

    APP = {
        root : core.root,
        _initModules : function(){
            core.initModules.apply(core, arguments);
        },
        _deinitModules : function(){
            core.deinitAllModules.apply(core, arguments);
        },
        _addNamespaceSupport : function(){
            core._addNamespaceSupport.apply(core, arguments);
        }
    };

    if ( options.namespaceSupport ){
        window.app = APP;
    }

    return APP;
});
