// Creating the Images collection (both on client and server)
Images = new Mongo.Collection("Images");

if (Meteor.isClient) {
    var ImageApp = angular.module('ImageApp', [
        'angular-meteor',
        'ionic',
        'ngCordova.plugins.camera']);

    function onReady() {
        angular.bootstrap(document, ['ImageApp']);
    }

    if (Meteor.isCordova) {
        angular.element(document).on("deviceready", onReady);
    }
    else {
        angular.element(document).ready(onReady);
    }

    Meteor.subscribe('Images');

    ImageApp.controller('ImageAppCtrl', ['$scope', '$rootScope', '$meteor', '$ionicPopup', '$cordovaCamera',
        function ($scope, $rootScope, $meteor, $ionicPopup, $cordovaCamera) {

            $scope.images = $meteor.collection(Images);

            $scope.upload = function() {
                if ($rootScope.currentUser !== null){
                    var options = {
                        quality : 75,
                        destinationType : Camera.DestinationType.DATA_URL,
                        sourceType : Camera.PictureSourceType.CAMERA,
                        allowEdit : true,
                        encodingType: Camera.EncodingType.JPEG,
                        popoverOptions: CameraPopoverOptions,
                        targetWidth: 500,
                        targetHeight: 500,
                        saveToPhotoAlbum: false
                    };
                    $cordovaCamera.getPicture(options).then(function(imageData) {
                        $scope.images.push({image: imageData, owner: $rootScope.currentUser._id});
                    });
                }
                else{
                    $ionicPopup.alert({
                        title: 'No user logged in',
                        template: 'Please log in...'
                    });
                }
            };

            $scope.remove = function(index) {
                $scope.images.splice(index, 1);
            };
        }
    ]);
}

if (Meteor.isServer) {
    // Publish only the user's images from the Images collection
    Meteor.publish('Images', function(){
        return Images.find({owner: this.userId})
    });

    // Allow only the owner of the images to insert and remove them
    Images.allow({
        insert: function (userId, image) {
            return userId === image.owner;
        },
        remove: function (userId, image) {
            return userId === image.owner;
        }
    });
}
