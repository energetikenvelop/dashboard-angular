(function () {
    'use strict';

    angular.module('BlurAdmin.pages.settings.companyInfo')
        .controller('CompanyInfoCtrl', CompanyInfoCtrl);

    /** @ngInject */
    function CompanyInfoCtrl($scope,environmentConfig,$rootScope,toastr,$http,localStorageManagement,errorHandler,_) {

        var vm = this;
        vm.token = localStorageManagement.getValue('TOKEN');
        $scope.companyImageUrl = "/assets/img/app/placeholders/hex_grey.svg";
        $scope.loadingCompanyInfo = true;
        $scope.company = {
            details : {
                settings: {}
            }
        };
        vm.updatedCompanyInfo = {};
        vm.updatedCompanySettings = {
            settings: {}
        };
        $scope.statusOptions = ['Pending','Complete'];

        vm.getCompanyInfo = function () {
            if(vm.token) {
                $scope.loadingCompanyInfo = true;
                $http.get(environmentConfig.API + '/admin/company/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    $scope.loadingCompanyInfo = false;
                    if (res.status === 200) {
                        $scope.company.details = res.data.data;
                    }
                }).catch(function (error) {
                    $scope.loadingCompanyInfo = false;
                    errorHandler.evaluateErrors(error.data);
                    errorHandler.handleErrors(error);
                });
            }
        };
        vm.getCompanyInfo();

        $scope.companySettingsChanged = function(field){
            vm.updatedCompanySettings.settings[field] = $scope.company.details.settings[field];
        };

        $scope.updateCompanySettings = function () {
            if(Object.keys(vm.updatedCompanySettings.settings).length != 0){

                $scope.loadingCompanyInfo = true;
                $http.patch(environmentConfig.API + '/admin/company/settings/',vm.updatedCompanySettings.settings, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    if (res.status === 200) {
                        vm.updatedCompanySettings.settings = {};
                        vm.getCompanyInfo();
                        toastr.success('You have successfully updated the company info');
                    }
                }).catch(function (error) {
                    $scope.loadingCompanyInfo = false;
                    vm.updatedCompanyInfo = {};
                    errorHandler.evaluateErrors(error.data);
                    errorHandler.handleErrors(error);
                });
            } else{
                vm.getCompanyInfo();
                toastr.success('You have successfully updated the company info');
            }
        };

        $scope.companyInfoChanged = function(field){
            vm.updatedCompanyInfo[field] = $scope.company.details[field];
        };

        $scope.updateCompanyInfo = function () {
            $scope.loadingCompanyInfo = true;
            $http.patch(environmentConfig.API + '/admin/company/',vm.updatedCompanyInfo, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.status === 200) {
                    vm.updatedCompanyInfo = {};
                    $scope.company.details = {};
                    $rootScope.pageTopObj.companyObj = {};
                    $rootScope.pageTopObj.companyObj = res.data.data;
                    $scope.updateCompanySettings();
                }
            }).catch(function (error) {
                $scope.loadingCompanyInfo = false;
                vm.updatedCompanyInfo = {};
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };

    }
})();
