define(['jquery', 'underscore', 'options'], function($, _, options) {

    return new function(){

        this.name = "header-auth-actions";

        this.init = function(){
            //опции окошка
            var winOpts = {
                "width": 800,
                "height": 600,
                "toolbar": 0,
                "location": 0,
                "directories": 0,
                "menubar": 0,
                "scrollbars": 0,
                "resizable": 0,
                "status": 0,
                "fullscreen": 0,
                //"left": screen.width/2,
                //"top": screen.height/2
            };
            winOpts = JSON.stringify(winOpts).replace(/(\"|\{|\})/g,'').replace(/\:/g,'\=');
            var authWin;

            $('.control-login').on('click', function(){
                authWin = window.open(options.Urls.cabinet.login, 'authWin', winOpts);
                authWin.focus();
                return false;
            });
            $('.control-register').on('click', function(){
                authWin = window.open(options.Urls.cabinet.register, 'authWin', winOpts);
                authWin.focus();
                return false;
            });

            return true;
        }
    };

});
