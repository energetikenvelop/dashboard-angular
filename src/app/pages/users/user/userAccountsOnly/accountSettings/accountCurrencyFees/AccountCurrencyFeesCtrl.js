(function () {
    'use strict';

    angular.module('BlurAdmin.pages.users.user.accountSettings.accountCurrencyFees')
        .controller('AccountCurrencyFeesCtrl', AccountCurrencyFeesCtrl);

    /** @ngInject */
    function AccountCurrencyFeesCtrl($scope,$window,$stateParams,$http,$uibModal,environmentConfig,_,$rootScope,
                                     localStorageManagement,errorHandler) {

        var vm = this;
        vm.token = localStorageManagement.getValue('TOKEN');
        $rootScope.shouldBeBlue = 'Users';
        vm.currencyCode = $stateParams.currencyCode;
        vm.currenciesList = JSON.parse($window.sessionStorage.currenciesList);
        vm.reference = $stateParams.reference;
        $scope.userData = JSON.parse($window.sessionStorage.userData);
        $scope.currencyObj = {};
        $scope.loadingAccountCurrencyFees = true;

        vm.getCurrencyObjFromCurrenciesList = function(){
            $scope.currencyObj = vm.currenciesList.find(function(element){
                return element.code == vm.currencyCode;
            });
        };
        vm.getCurrencyObjFromCurrenciesList();

        $scope.getAccountCurrencyFees = function(){
            if(vm.token) {
                $scope.loadingAccountCurrencyFees = true;
                $http.get(environmentConfig.API + '/admin/accounts/' + vm.reference + '/currencies/' + vm.currencyCode + '/fees/',{
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    $scope.loadingAccountCurrencyFees = false;
                    if (res.status === 200) {
                        $scope.accountCurrencyFeesList = res.data.data;
                    }
                }).catch(function (error) {
                    $scope.loadingAccountCurrencyFees = false;
                    errorHandler.evaluateErrors(error.data);
                    errorHandler.handleErrors(error);
                });
            }
        };
        $scope.getAccountCurrencyFees();

        $scope.openAddAccountCurrencyFeeModal = function (page, size) {
            vm.theAddModal = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: 'AddAccountCurrencyFeeCtrl',
                scope: $scope,
                resolve: {
                    currencyCode: function () {
                        return vm.currencyCode;
                    },
                    reference: function () {
                        return vm.reference;
                    }
                }
            });

            vm.theAddModal.result.then(function(accountCurrencyFee){
                if(accountCurrencyFee){
                    $scope.getAccountCurrencyFees();
                }
            }, function(){
            });
        };

        $scope.openEditAccountCurrencyFeeModal = function (page, size,accountCurrencyFee) {
            vm.theEditModal = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: 'EditAccountCurrencyFeeCtrl',
                scope: $scope,
                resolve: {
                    accountCurrencyFee: function () {
                        return accountCurrencyFee;
                    },
                    currencyCode: function () {
                        return vm.currencyCode;
                    },
                    reference: function () {
                        return vm.reference;
                    }
                }
            });

            vm.theEditModal.result.then(function(accountCurrencyFee){
                if(accountCurrencyFee){
                    $scope.getAccountCurrencyFees();
                }
            }, function(){
            });
        };

        $scope.openAccountCurrencyFeesModal = function (page, size,accountCurrencyFee) {
            vm.theModal = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: 'AccountCurrencyFeesModalCtrl',
                scope: $scope,
                resolve: {
                    accountCurrencyFee: function () {
                        return accountCurrencyFee;
                    },
                    currencyCode: function () {
                        return vm.currencyCode;
                    },
                    reference: function () {
                        return vm.reference;
                    }
                }
            });

            vm.theModal.result.then(function(accountCurrencyFee){
                if(accountCurrencyFee){
                    $scope.getAccountCurrencyFees();
                }
            }, function(){
            });
        };


    }
})();