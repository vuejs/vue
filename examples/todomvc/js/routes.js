/*global app, Router */

(function (app, Router) {

    'use strict';

    var router = new Router();

    Object.keys(app.filters).forEach(function (filter) {
        router.on(filter, function () {
            app.activeFilter = filter;
        });
    });

    router.configure({
        notfound: function () {
            window.location.hash = '';
            app.activeFilter = 'all';
        }
    });

    router.init();
    
})(app, Router);