(function () {
    'use strict';

    angular.module('BlurAdmin.pages.login')
        .controller('LoginCtrl', LoginCtrl);

    /** @ngInject */
    function LoginCtrl($rootScope,$scope,$http,localStorageManagement,environmentConfig,$location,errorHandler,userVerification,$timeout) {

        var vm = this;
        localStorageManagement.deleteValue('TOKEN');
        $rootScope.dashboardTitle = 'Rehive';
        $scope.path = $location.path();
        $scope.showLoginPassword = false;

        $scope.toggleLoginPassword = function () {
            $scope.showLoginPassword = !$scope.showLoginPassword;
        };

        $scope.login = function(user, company, password) {
            $rootScope.$pageFinishedLoading = false;

            $http.post(environmentConfig.API + '/auth/login/', {
                user: user,
                company: company,
                password: password
            }).then(function (res) {
                if (res.status === 200) {
                    localStorageManagement.setValue('TOKEN','Token ' + res.data.data.token);
                    vm.checkMultiFactorAuthEnabled(res.data.data.token);

                }
            }).catch(function (error) {
                $rootScope.$pageFinishedLoading = true;
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };

        vm.checkMultiFactorAuthEnabled = function (token) {
            if(token) {
                $http.get(environmentConfig.API + '/auth/mfa/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Token ' + token
                    }
                }).then(function (res) {
                    if (res.status === 200) {
                        var enabledObj = vm.checkMultiFactorAuthEnabledFromData(res.data.data);
                        if(enabledObj.enabled){
                            $rootScope.$pageFinishedLoading = true;
                            $location.path('/authentication/multi-factor/verify/' + enabledObj.key).search({prevUrl: 'login'});
                        } else {
                            $rootScope.$pageFinishedLoading = false;
                            userVerification.verify(function(err,verified){
                                if(verified){
                                    $rootScope.userFullyVerified = true;
                                    $rootScope.$pageFinishedLoading = true;
                                    $location.path('/currencies');
                                } else {
                                    $rootScope.userFullyVerified = false;
                                    $rootScope.$pageFinishedLoading = false;
                                    $location.path('/verification');
                                }
                            });
                        }

                    }
                }).catch(function (error) {
                    $rootScope.$pageFinishedLoading = true;
                    errorHandler.evaluateErrors(error.data);
                    errorHandler.handleErrors(error);
                });
            }
        };

        vm.checkMultiFactorAuthEnabledFromData = function(multiFactorAuthObj){
            var enabledObj = {enabled: false,key: ''};
            for (var key in multiFactorAuthObj) {
                if (multiFactorAuthObj.hasOwnProperty(key)) {
                    if(multiFactorAuthObj[key] == true){
                        enabledObj.enabled = true;
                        enabledObj.key = key;
                        break;
                    }
                }
            }
            return enabledObj;
        };

    }
})();
