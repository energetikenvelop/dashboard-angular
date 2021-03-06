(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transactions.history')
        .controller('DebitCtrl', DebitCtrl);

    function DebitCtrl($http,$scope,errorHandler,toastr,environmentConfig,_,metadataTextService,$window,
                        sharedResources,localStorageManagement,$state,typeaheadService,currencyModifiers) {

        var vm = this;
        vm.token = localStorageManagement.getValue('TOKEN');
        $scope.debitSubtypeOptions = [];
        $scope.debitCurrencyOptions = [];
        $scope.debitTransactionData = {
            tx_type: 'debit',
            user: null,
            amount: null,
            reference: "",
            status: 'Complete',
            metadata: "",
            currency: {},
            subtype: {},
            note: "",
            account: {}
        };
        $scope.showAdvancedDebitOption = false;
        $scope.retrievedDebitUserObj = {};
        $scope.retrievedDebitUserAccountsArray = [];
        $scope.retrievedDebitAccountTransactions = [];
        $scope.debitTransactionStatus = ['Complete','Pending','Failed','Deleted'];
        $scope.debitUserAccountsAvailable = true;
        $scope.debitCurrencyAccountsAvailable = true;

        vm.getDebitCompanyCurrencies = function(){
            if(vm.token){
                $http.get(environmentConfig.API + '/admin/currencies/?enabled=true&page_size=250', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    if (res.status === 200) {
                        $scope.debitCurrencyOptions = res.data.data.results;
                        if($scope.newTransactionParams.currencyCode) {
                            $scope.debitTransactionData.currency = $scope.debitCurrencyOptions.find(function (element) {
                                return element.code == $scope.newTransactionParams.currencyCode;
                            });
                            vm.getDebitUserAccounts($scope.retrievedDebitUserObj,$scope.debitTransactionData);
                        }
                    }
                }).catch(function (error) {
                    errorHandler.evaluateErrors(error.data);
                    errorHandler.handleErrors(error);
                });
            }
        };
        if(!$scope.newTransactionParams.txType){
            vm.getDebitCompanyCurrencies();
        }

        $scope.getSubtypes = function () {
            sharedResources.getSubtypes().then(function (res) {
                $scope.debitSubtypeOptions = res.data.data;
            });
        };
        $scope.getSubtypes();

        $scope.getUsersEmailTypeahead = typeaheadService.getUsersEmailTypeahead();

        $scope.displayAdvancedDebitOption = function () {
            $scope.showAdvancedDebitOption = !$scope.showAdvancedDebitOption;
        };

        vm.getDebitUserObj = function (debitTransactionData) {
            var user;

            $scope.retrievedDebitUserObj = {};
            user = debitTransactionData.user;

            $http.get(environmentConfig.API + '/admin/users/?user=' + encodeURIComponent(user), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.status === 200) {
                    if(res.data.data.results.length == 1){
                        $scope.retrievedDebitUserObj = res.data.data.results[0];
                        $scope.retrievedDebitUserObj.metadata = metadataTextService.convertToText($scope.retrievedDebitUserObj.metadata);
                        if($scope.debitCurrencyOptions.length === 1){
                            $scope.debitTransactionData.currency = $scope.debitCurrencyOptions[0];
                            vm.getDebitUserAccounts($scope.retrievedDebitUserObj,$scope.debitTransactionData);
                        } else if($scope.newTransactionParams.txType){
                            vm.getDebitCompanyCurrencies();
                        }
                    } else {
                        $scope.retrievedDebitUserObj = {};
                        $scope.retrievedUserAccountsArray = [];
                        debitTransactionData.currency = {};
                    }
                }
            }).catch(function (error) {
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };

        $scope.$watch('debitTransactionData.user',function () {
            if($scope.debitTransactionData.user){
                vm.resetDebitData();
                if(!$scope.newTransactionParams.txType){
                    vm.getDebitUserObj($scope.debitTransactionData);
                }
            } else {
                vm.resetDebitData();
            }
        });

        vm.resetDebitData = function () {
            $scope.retrievedDebitUserObj = {};
            $scope.retrievedDebitUserAccountsArray = [];
            $scope.retrievedDebitAccountTransactions = [];
            $scope.debitTransactionData.currency = {};
            $scope.debitTransactionData.account = {};
            $scope.debitUserAccountsAvailable = true;
            $scope.debitCurrencyAccountsAvailable = true;
        };

        $scope.debitCurrencySelected = function (debitTransactionData) {
            $scope.retrievedDebitUserAccountsArray = [];
            debitTransactionData.account = {};
            vm.getDebitUserAccounts($scope.retrievedDebitUserObj,debitTransactionData);
        };

        vm.getDebitUserAccounts = function (user,debitTransactionData) {
            $http.get(environmentConfig.API + '/admin/accounts/?user='+ user.identifier, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.status === 200) {
                    if(res.data.data.results.length > 0){
                        $scope.debitUserAccountsAvailable = true;
                        vm.getDebitAccounts(user,debitTransactionData);
                    } else {
                        $scope.debitUserAccountsAvailable = false;
                    }
                }
            }).catch(function (error) {
                $scope.loadingTransactionSettings = false;
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };

        vm.getDebitAccounts = function (user,debitTransactionData) {

            $http.get(environmentConfig.API + '/admin/accounts/?user='+ user.identifier + '&currency=' + debitTransactionData.currency.code, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.status === 200) {
                    if(res.data.data.results.length > 0){
                        $scope.debitCurrencyAccountsAvailable = true;
                        res.data.data.results.find(function (account) {
                            if(account.reference == $scope.newTransactionParams.accountUser){
                                debitTransactionData.account = account;
                                $scope.debitAccountSelected(debitTransactionData);
                                return true;
                            } else if(account.primary){
                                account.name = account.name + ' - (primary)';
                                debitTransactionData.account = account;
                                $scope.debitAccountSelected(debitTransactionData);
                                return true;
                            }
                        });
                        $scope.retrievedDebitUserAccountsArray = res.data.data.results;
                    } else {
                        $scope.debitCurrencyAccountsAvailable = false;
                        $scope.retrievedDebitUserAccountsArray = res.data.data.results;
                    }
                }
            }).catch(function (error) {
                $scope.loadingTransactionSettings = false;
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };

        $scope.debitAccountSelected = function (debitTransactionData) {

            var accountRef;

            if(debitTransactionData){
                $scope.retrievedDebitAccountTransactions = [];
                accountRef = debitTransactionData.account.reference;

                $http.get(environmentConfig.API + '/admin/transactions/?page=1&page_size=5&orderby=-created&account=' + accountRef, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    if (res.status === 200) {
                        $scope.loadingTransactionSettings = false;
                        $scope.retrievedDebitAccountTransactions = res.data.data.results;
                    }
                }).catch(function (error) {
                    errorHandler.evaluateErrors(error.data);
                    errorHandler.handleErrors(error);
                });
            }
        };

        $scope.goToDebitUserAccountCreate = function () {
            $window.open('/#/user/' + $scope.retrievedDebitUserObj.identifier + '/accounts?accountAction=newAccount','_blank');
        };

        if($scope.newTransactionParams.userEmail){
            $scope.debitTransactionData.user = $scope.newTransactionParams.userEmail;
        }

        if($scope.newTransactionParams.txType){
            $scope.loadingTransactionSettings = true;
            $scope.debitTransactionData.user = $scope.newTransactionParams.emailUser;
            vm.getDebitUserObj($scope.debitTransactionData);
        }

    }
})();
