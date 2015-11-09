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


blocJams.directive('qmSellingPoints', function () {

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
    };
});


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
    };
});


blocJams.service('SongPlayer', function ($window) {
    var currentVolume = 80;
    var trackIndex = function (album, song) {
        return album.songs.indexOf(song);
    };

    var currentSong = {
        stop: function () {},
        setPercent: function () {},
        setVolume: function () {},
        appData: {},
        previousSong: function () {},
        nextSong: function () {}
    };

    var toggle = function () {
        currentSong.togglePlay();
    };

    var play = function (song) {
        currentSong.stop();

        currentSong = new $window.buzz.sound(song.audioUrl, {
            formats: ['mp3'],
            preload: true
        });

        song.duration = $window.buzz.toTimer(currentSong.getDuration());

        currentSong.appData = song;

        currentSong.play();

    };

    var isCurrentSongLoaded = function (song) {
        return (song === currentSong.appData);
    };

    return {
        playOrPause: function (song) {
            var toggled = isCurrentSongLoaded(song) ? toggle() : play(song);
            return song;
        },
        setVolume: function (volume) {
            this.volume = currentVolume;
            currentSong.setVolume(volume);
        },
        onVolumeChange: function (callback) {
            currentSong.bind('volumechange', function (e) {
                callback(this.getVolume());
            });
        },
        setPercent: function (percent) {
            currentSong.setPercent(percent);
        },
        timeUpdate: function (callback) {
            currentSong.bind('timeupdate', function (e) {
                var timer = $window.buzz.toTimer(this.getTime());
                callback({
                    time: timer,
                    percent: this.getPercent()
                });
            });
        },
        getDuration: function (callback) {
            currentSong.bind('loadedmetadata', function (e) {
                var duration = $window.buzz.toTimer(currentSong.getDuration());
                callback(duration);
            });
        },
        previousSong: function () {
            var currentSongIndex = trackIndex(this.album, currentSong);
            currentSongIndex--;
            return currentSongIndex;

        },
        nextSong: function () {
            var currentSongIndex = trackIndex(this.album, currentSong);
            currentSongIndex++;
            return currentSongIndex;
        }
    };
});


blocJams.controller('AlbumController', ['$scope', 'SongPlayer', function ($scope, SongPlayer) {
    $scope.album = albumPicasso;
    var albums = [albumPicasso, albumMarconi, albumMothership];
    var index = 1;
    $scope.switchAlbum = function (album) {
        $scope.album = albums[index];
        index++;
        if (index == albums.length) {
            index = 0;
        }
    };

    var timeUpdate = function () {
        SongPlayer.timeUpdate(function (timeData) {
            $scope.timeData = timeData;
            $scope.$apply();
        });
    };

    var getDuration = function () {
        SongPlayer.getDuration(function (duration) {
            $scope.duration = duration;
        });
    };

    var resetSongs = function (song) {
        $scope.album.songs.forEach(function (item) {
            if (item !== song) {
                item.playing = false;
            }
        });
    };
    
    $scope.currentSong = {
        audioUrl: {}
    };
    
    $scope.setTime = function (event) {
        SongPlayer.setPercent(Math.round((event.offsetX / document.getElementById('seek-bar').clientWidth) * 100));
    };

    $scope.setVolume = function (volume) {
        SongPlayer.setVolume(volume);
    };

    $scope.playOrPause = function (song) {
        resetSongs(song);
        $scope.songPlayer = SongPlayer;
        song.playing = !song.playing;
        $scope.currentSong = SongPlayer.playOrPause(song);
        SongPlayer.timeUpdate(function (timeData) {
            $scope.timeData = timeData;
            $scope.$apply();
        });
        SongPlayer.getDuration(function (duration) {
            $scope.duration = duration;
        });
    };


    $scope.previousSong = function () {
        var currentSongIndex = function () {
            return SongPlayer.previousSong();
        };

        if (currentSongIndex < 0) {
            currentSongIndex = this.currentAlbum.songs.length - 1;
        }

        this.playOrPause(this.currentAlbum.songs[currentSongIndex]);
        timeUpdate();
        getDuration();
    };

    $scope.nextSong = function () {
        var currentSongIndex = function () {
            return SongPlayer.nextSong();
        };

        if (currentSongIndex >= this.album.songs.length) {
            currentSongIndex = 0;
        }

        this.playOrPause(this.album.songs[currentSongIndex]);
        timeUpdate();
        getDuration();
    };

}]);

blocJams.directive('slider', function ($document, SongPlayer) {
    // Returns a number between 0 and 1 to determine where the mouse event happened along the slider bar.
    var calculateSliderPercentFromMouseEvent = function ($slider, event) {
        var offsetX = event.pageX - $slider.offset().left; // Distance from left
        var sliderWidth = $slider.width(); // Width of slider
        var offsetXPercent = (offsetX / sliderWidth);
        offsetXPercent = Math.max(0, offsetXPercent);
        offsetXPercent = Math.min(1, offsetXPercent);
        return offsetXPercent;
    };

    var numberFromValue = function (value, defaultValue) {
        if (typeof value === 'number') {
            return value;
        }

        if (typeof value === 'undefined') {
            return defaultValue;
        }

        if (typeof value === 'string') {
            return Number(value);
        }
    };
    return {
        restrict: 'E',
        replace: true,
        scope: {
            onChange: '&'
        },
        templateUrl: '/templates/player_bar.html',
        link: function (scope, element, attributes) {

            scope.value = 0;
            scope.max = 100;
            var $seekBar = $(element);

            var percentString = function () {
                var value = scope.value || 0;
                var max = scope.max || 100;
                percent = value / max * 100;
                return percent + "%";
            };

            scope.fillStyle = function () {
                return {
                    width: percentString()
                };
            };

            scope.thumbStyle = function () {
                return {
                    left: percentString()
                };
            };

            scope.onClickSlider = function (event) {
                var percent = calculateSliderPercentFromMouseEvent($seekBar, event);
                scope.value = percent * scope.max;
                notifyCallback(scope.value);
            };

            scope.trackThumb = function () {
                $document.bind('mousemove.thumb', function (event) {
                    var percent = calculateSliderPercentFromMouseEvent($seekBar, event);
                    scope.$apply(function () {
                        scope.value = percent * scope.max;
                        notifyCallback(scope.value);
                    });
                });

                //cleanup
                $document.bind('mouseup.thumb', function () {
                    $document.unbind('mousemove.thumb');
                    $document.unbind('mouseup.thumb');
                });
            };

            attributes.$observe('value', function (newValue) {
                scope.value = numberFromValue(newValue, 0);
            });

            attributes.$observe('max', function (newValue) {
                scope.max = numberFromValue(newValue, 100) || 100;
            });
            var notifyCallback = function (newValue) {
                if (typeof scope.onChange === 'function') {
                    scope.onChange({
                        value: newValue
                    });
                }
            };
        }
    };
});
