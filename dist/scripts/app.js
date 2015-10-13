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
    
    $scope.play = function(song) {
        SongPlayer.setSong($scope.album, song);
    };
    
    $scope.pause = function() {
        $scope.Playing = SongPlayer.Playing;
        SongPlayer.pause();
    };
    
    
}]);


blocJams.service('SongPlayer', function () {
    var currentSoundFile = null;
    var currentVolume = 80;
    var trackIndex = function (album, song) {
        return album.songs.indexOf(song);
    };
    
    
    return {
        Playing: false,
        play: function () {
            this.Playing = true;
            currentSoundFile.play();
            
        },
        pause: function () {
            this.Playing = false;
            currentSoundFile.pause();    
        },
        setVolume: function (volume) {
            if (currentSoundFile) {
                currentSoundFile.setVolume(volume);
            }
        },
        setTime: function(time) {
            if (currentSoundFile) {
                currentSoundFile.setTime(time);
            }
        },
        getTimePosition: function() {
            if (currentSoundFile) {
                currentSoundFile.bind('timeupdate', function (event) {
                    return this.getTime() / this.getDuration();
                });
            }
        },
        previousSong: function() {
            var currentSongIndex =trackIndex(currentAlbum,currentSongFromAlbum);
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
        },
        setSong: function(album, song){
            if (currentSoundFile) {
                currentSoundFile.stop();
            }

            this.currentAlbum = album;
            this.currentSong = song;
            
            currentSoundFile = new buzz.sound(song.audioUrl, {
                formats: ['mp3'],
                preload: true
            });

            this.play();
            this.setVolume(currentVolume);
        }
    };
});