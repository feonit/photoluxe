/**
 * Created by feonit on 04.10.14.
 * Регистратор асинхронных процессов
 */

define(['jquery'], function($){
    return new function(){

        this._namespace = 'modules.ui.statusLoad';

        var $ajaxLoader;

        /**
         * @public Визуализировать ход процесса
         * */
        this.start = function(){
            if ($ajaxLoader){
                $ajaxLoader.fadeIn();
            }
        };

        /**
         * @public Остановить визуализацию процесса
         * */
        this.stop = function(){
            if ($ajaxLoader){
                $ajaxLoader.fadeOut();
            }
        };

        this.init = function(){
            $ajaxLoader = $('#ajax_loader');
        }
    };
});
