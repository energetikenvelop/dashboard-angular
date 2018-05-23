(function () {
    'use strict';

    angular.module('BlurAdmin.pages.users.user.accounts')
        .controller('UserAccountsOnlyCtrl', UserAccountsOnlyCtrl);

    /** @ngInject */
    function UserAccountsOnlyCtrl($scope,environmentConfig,$stateParams,$rootScope,$uibModal,
                              $http,localStorageManagement,errorHandler,$location,serializeFiltersService) {

        var vm = this;
        vm.token = localStorageManagement.getValue('TOKEN');
        $rootScope.shouldBeBlue = 'Users';
        vm.uuid = $stateParams.uuid;
        vm.reference = '';
        $scope.newAccountCurrencies = {list: []};
        vm.createNewAccountRequest = $location.search();
        $scope.loadingUserAccounts = true;
        $scope.optionsCode = '';
        $scope.optionsReference = '';
        $scope.accountsFiltersCount = 0;
        $scope.showingAccountsFilters = false;
        $scope.accounts = [];
        $scope.filtersObj = {
            accountNameFilter: false,
            accountReferenceFilter: false
        };
        $scope.applyFiltersObj = {
            accountNameFilter: {
                selectedAccountName: ''
            },
            accountReferenceFilter: {
                selectedAccountReference: ''
            }
        };

        $scope.showAccountsFilters = function () {
            $scope.showingAccountsFilters = !$scope.showingAccountsFilters;
        };

        $scope.closeOptionsBox = function () {
            $scope.optionsCode = '';
            $scope.optionsReference = '';
        };

        $scope.showCurrenciesOptions = function (code,reference) {
            $scope.optionsCode = code;
            $scope.optionsReference = reference;
        };

        vm.getUsersAccountsUrl = function(){
            $scope.accountsFiltersCount = 0;

            for(var x in $scope.filtersObj){
                if($scope.filtersObj.hasOwnProperty(x)){
                    if($scope.filtersObj[x]){
                        $scope.accountsFiltersCount = $scope.accountsFiltersCount + 1;
                    }
                }
            }

            var searchObj = {
                page_size: 250,
                user: vm.uuid,
                reference: $scope.filtersObj.accountReferenceFilter ? ($scope.applyFiltersObj.accountReferenceFilter.selectedAccountReference ?  $scope.applyFiltersObj.accountReferenceFilter.selectedAccountReference : null): null,
                name: $scope.filtersObj.accountNameFilter ?($scope.applyFiltersObj.accountNameFilter.selectedAccountName ?  $scope.applyFiltersObj.accountNameFilter.selectedAccountName : null): null
            };

            return environmentConfig.API + '/admin/accounts/?' + serializeFiltersService.serializeFilters(searchObj);
        };

        $scope.getUserAccounts = function(){
            if(vm.token) {
                $scope.loadingUserAccounts = true;
                $scope.showingAccountsFilters = false;

                if($scope.accounts.length > 0 ){
                    $scope.accounts.length = 0;
                }

                var usersAccountsUrl = vm.getUsersAccountsUrl();

                $http.get(usersAccountsUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    $scope.loadingUserAccounts = false;
                    if (res.status === 200) {
                        if(res.data.data.results.length > 0 ){
                            $scope.accounts = res.data.data.results;
                        } else {
                            $scope.accounts = [];
                        }

                    }
                }).catch(function (error) {
                    $scope.loadingUserAccounts = false;
                    errorHandler.evaluateErrors(error.data);
                    errorHandler.handleErrors(error);
                });
            }
        };
        $scope.getUserAccounts();

        $scope.goToView = function(txType,currency,email,account){
            $location.path('/transactions/history').search({txType: txType,currencyCode: currency.code,emailUser: email,accountUser: account});

        };

        $scope.goToSettings = function(currencyCode, account){
            $location.path('user/' + vm.uuid + '/account/'+account+'/settings/'+ currencyCode);
        };

        $scope.clearAccountsFilters = function () {
            $scope.filtersObj = {
                accountNameFilter: false,
                accountReferenceFilter: false
            };
        };

        $scope.openAddAccountModal = function (page, size) {
            vm.theAccountModal = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: 'AddAccountModalCtrl',
                scope: $scope
            });

            vm.theAccountModal.result.then(function(account){
                if(account){
                    $scope.getUserAccounts();
                }
            }, function(){
            });
        };

        if(vm.createNewAccountRequest.accountAction == 'newAccount'){
            $scope.openAddAccountModal('app/pages/users/user/userAccountsOnly/addAccountModal/addAccountModal.html','md');
            $location.search('accountAction',null);
        }

        $scope.openEditAccountModal = function (page, size,account,currencies) {
            vm.theEditAccountModal = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: 'EditAccountModalCtrl',
                scope: $scope,
                resolve: {
                    account: function () {
                        return account;
                    },
                    currenciesList: function () {
                        return currencies;
                    }
                }
            });

            vm.theEditAccountModal.result.then(function(account){
                if(account){
                    $scope.getUserAccounts();
                }
            }, function(){
            });
        };

    }
})();
