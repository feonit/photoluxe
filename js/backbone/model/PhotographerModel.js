define(['options', 'helpers'], function(options, helpers){

    return Backbone.Model.extend({

        url : function(){
            //var gid = this.get('gid');
            //var hash = helpers['hasher'].encode([gid]);
            //return "rest/users/" + hash + ".json"
            return 'js/json/user.json'
        },

        parse: function( model ){
            // parse работает при fetch и save ( пусто )
            if ( model ){
                return helpers.setExtendRecursive( model, this.defaults() )
            }
        },

        initialize: function( atributes ){
            this.set('gid', atributes.gid)
        },

        defaults: function(){
            return {
                "gid": "string",
                "first_name": "string",
                "last_name": "string",
                "avatar": {
                    thumbnail : "img/profile_default.png",
                    fullsize: ""
                },
                "status": "string",
                "about": "That user no have about info",
                "socials": {
                    "facebook_uid": "0",
                    "google_uid": "0"
                },
                "phones": ["string"],
                "email": null,
                "websites": ["http://google.com"],
                "languages": [
                    "English"
                ],
                "location": {
                    "country": {
                        gid: "Unknown",
                        title: "Russia"
                    },
                    "region": {
                        gid: "Unknown",
                        title: "M/o"
                    },
                    "city": {
                        gid: "Unknown",
                        title: "Moscow"
                    },
                    "longitude": null,
                    "latitude": null
                },
                "likes": {
                    amount: "0",
                    flag: false
                },
                "followers": {
                    amount: "0",
                    flag: false
                },
                "favorites": {
                    amount: "0",
                    flag: false
                },
                'portfolio' : null,
                'photos_amount': 0,
                'albums_amount': 0,
                'stories_amount': 0,
                "flag_chat": false
            }
        },

        idAttribute: '_id'

    });
});
