angular.module('blocJams', ['ui.router'])
    .config(function ($stateProvider, $locationProvider) {

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
    
    $stateProvider
        .state('landing', {
        url: '/landing',
        controller: 'Landing.controller',
        templateUrl: '/templates/landing.html'
    })
        .state('collection', {
        url: '/colletion',
        controller: 'Collection.controller',
        templateUrl: '/templates/collection.html'
    })
        .state('album', {
        url: '/album',
        controller: 'Album.controller',
        templateUrl: '/templates/album.html'
    });

});