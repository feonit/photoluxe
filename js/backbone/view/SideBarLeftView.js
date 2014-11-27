define(['underscore', 'text!templates/leftBar.html', 'SideBar', 'PhotographerModel', 'options'], function(_, leftBarTemplate, SideBar, PhotographerModel, options){
    return Backbone.View.extend({

        template: _.template(leftBarTemplate),

        userGid: null,
        userData: null,

        interface: null,

        initialize: function( data ) {
            this.userGid = data.userGid;
            this.interface = new SideBar('left');
            this.readyUserData();
        },
        render: function(){
            this.interface.setHTML(this.template(
                // подмешиваем настройки персонализации ( authorized )
                _.extend( this.userData.toJSON(), options.user )
            ));
            this.interface.open();
        },
        readyUserData: function(){
            var that = this;
            var userData = this.userData = new PhotographerModel( { gid : this.userGid } );

            userData.on('sync', function(){
                that.render();
            });
            userData.fetch();
        }
    })
});