(function () {
    'use strict';

    angular.module('BlurAdmin.pages.services')
        .controller('ServicesCtrl', ServicesCtrl);

    /** @ngInject */
    function ServicesCtrl($rootScope,$scope,$location,$http,environmentConfig,localStorageManagement,
                          errorHandler,$ngConfirm,$timeout,toastr) {

        var vm = this;
        vm.token = localStorageManagement.getValue('TOKEN');
        $rootScope.dashboardTitle = 'Services | Rehive';
        $scope.loadingServices = true;
        $scope.showingFilters = false;

        $scope.showFilters = function () {
            $scope.showingFilters = !$scope.showingFilters;
        };

        $scope.closeOptionsBox = function () {
            $scope.optionsCode = '';
        };

        $scope.getServices = function(){
          $scope.loadingServices = true;
            $http.get(environmentConfig.API + '/admin/services/?enabled=true', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
              $scope.loadingServices = false;
                if (res.status === 200) {
                  $scope.servicesList =  res.data.data.results;
                }
            }).catch(function (error) {
              $scope.loadingServices = false;
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };
        $scope.getServices();

        $scope.deactivateServicePrompt = function(selectedService) {
            $ngConfirm({
                title: 'Deactivate service',
                contentUrl: 'app/pages/services/deactivateServicePrompt.html',
                animationBounce: 1,
                animationSpeed: 100,
                scope: $scope,
                buttons: {
                    close: {
                        text: "Cancel",
                        btnClass: 'btn-default dashboard-btn'
                    },
                    Add: {
                        text: "Deactivate",
                        btnClass: 'btn-danger dashboard-btn',
                        keys: ['enter'], // will trigger when enter is pressed
                        action: function(scope){
                            if(!scope.password){
                                toastr.error('Please enter your password');
                                return;
                            }
                            scope.deactivateServices(selectedService,scope.password)
                        }
                    }
                }
            });
        };

        $scope.deactivateServices = function(service,password){
            $scope.loadingServices = true;
            $http.put(environmentConfig.API + '/admin/services/' + service.id + '/',{password: password,active: false}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.status === 200) {
                    $timeout(function () {
                        $scope.loadingServices = false;
                        toastr.success('Service has been successfully deactivated');
                        $scope.getServices();
                    },600);
                }
            }).catch(function (error) {
                $scope.loadingServices = false;
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };

        $scope.goToAddService = function(){
            $location.path('/services/add');
        };

        $scope.goToService = function(service) {
            localStorageManagement.setValue('SERVICEURL',service.url);
            var serviceNameArray = service.name.split(' ');
            var pathName = serviceNameArray[0].toLowerCase();
            $location.path('/services/' + pathName);
        };
    }
})();
