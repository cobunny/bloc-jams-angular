var blocJams = angular.module('blocJams', ['ui.router']);

blocJams.config(['$stateProvider', '$locationProvider', function ($stateProvider, $locationProvider) {

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $stateProvider
        .state('landing', {
            url: '/',
            controller: 'LandingController',
            templateUrl: '/templates/landing.html'
        })
        .state('collection', {
            url: '/colletion',
            controller: 'CollectionController',
            templateUrl: '/templates/collection.html'
        })
        .state('album', {
            url: '/album',
            controller: 'AlbumController',
            templateUrl: '/templates/album.html'
        });

}]);


blocJams.controller('LandingController', ['$scope', function ($scope) {
    $scope.tagLine = "Turn the music up!";
    $scope.points = [
        {
            icon: 'ion-music-note',
            title: 'Choose your music',
            description: 'The world is full of music; why should you have to listen to music that someone else chose?'
        },
        {
            icon: 'ion-radio-waves',
            title: 'Unlimited, streaming, ad-free',
            description: 'No arbitrary limits. No distractions.'
        },
        {
            icon: 'ion-iphone',
            title: 'Mobile enabled',
            description: 'Listen to your music on the go. This streaming service is available on all mobile platforms.'
        }];
    
}]);


blocJams.directive('qmSellingPoints', [function () {

    var linkFunction = function (scope, element, attributes) {
        var points = $('.point');

        var animatePoints = function (points) {
            angular.element(points).css({
                opacity: 1,
                transform: 'scaleX(1) translateY(0)'
            });
        };


        if ($(window).height() > 950) {
            angular.forEach(points, function (point) {
                animatePoints(point);
            });
        }

        var scrollDistance = $('.selling-points').offset().top - $(window).height() + 200;

        $(window).scroll(function (event) {
            if ($(window).scrollTop() >= scrollDistance) {
                angular.forEach(points, function (point) {
                    animatePoints(point);
                });
            }
        });
    };

    return {
        restrict: 'A',
        link: linkFunction
    }
}]);


blocJams.controller('CollectionController', ['$scope', function ($scope) {
    $scope.albums = [];
    for (var i = 0; i < 12; i++) {
        $scope.albums.push(angular.copy(albumPicasso));
    }
}]);


blocJams.filter('timeCode', function () {
    return function (timeInSeconds) {
        if (timeInSeconds) {
            var totalSeconds = parseFloat(timeInSeconds);
            var minutes = Math.floor(totalSeconds / 60) + "";
            var seconds = Math.floor(totalSeconds % 60) + "";

            return (minutes + ":" + seconds);
        } else {
            return null;
        }
    }
});


blocJams.controller('AlbumController', ['$scope', 'SongPlayer', function ($scope, SongPlayer) {
    $scope.album = albumPicasso;
    var albums = [albumPicasso, albumMarconi, albumMothership];
    var index = 1;
    $scope.switchAlbum = function(album){   
        $scope.album = albums[index];
        index++;
        if (index == albums.length) {
            index = 0;
        }      
    };
    
    $scope.setSong = function(song){
        //Prevent Multiple Songs From Playing Concurrently
        if ($scope.currentSoundFile) {
            $scope.currentSoundFile.stop();
        }

        $scope.currentSongFromAlbum = song;


        $scope.currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
            // #2
            formats: ['mp3'],
            preload: true
        });
    
        $scope.currentSoundFile.play();
        $scope.setVolume = SongPlayer.setVolume;
    
    };
}]);


blocJams.service('SongPlayer', function () {
    this.currentSoundFile = null;
    this.currentSongFromAlbum = null;
    this.currentAlbum = null;
    this.currentVolume = 80;
    
    var trackIndex = function (album, song) {
        return album.songs.indexOf(song);
    };
    
    
    return {
        play: function () {
            this.Playing = true;
            currentSoundFile.play();
            
        },
        pause: function () {
            this.Playing = false;
            currentSoundFile.pause();    
        },
        setVolume: function (value) {
            if (currentSoundFile) {
                currentSoundFile.setVolume(currentVolume);
            }
        },
        setTime: function(time) {
            if (currentSoundFile) {
                currentSoundFile.setTime(time);
            }
        },
        previousSong: function() {
            var currentSongIndex =trackIndex(currentAlbum,currentSong);
            currentSongIndex--;
            if (currentSongIndex < 0) {
                currentSongIndex = currentAlbum.songs.length - 1;
            }
            setSong(currentSongIndex + 1);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();          
        },
        nextSong: function() {
            var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
            currentSongIndex++;

            if (currentSongIndex >= currentAlbum.songs.length) {
                currentSongIndex = 0;
            }
            setSong(currentSongIndex + 1);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();        
        }
    };
});