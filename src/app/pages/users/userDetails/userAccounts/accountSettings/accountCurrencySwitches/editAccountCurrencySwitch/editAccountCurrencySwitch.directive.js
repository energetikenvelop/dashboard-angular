(function () {
    'use strict';

    angular.module('BlurAdmin.pages.accountSettings')
        .directive('editAccountCurrencySwitch', editAccountCurrencySwitch);

    /** @ngInject */
    function editAccountCurrencySwitch() {
        return {
            restrict: 'E',
            templateUrl: 'app/pages/users/userDetails/userAccounts/accountSettings/accountCurrencySwitches/editAccountCurrencySwitch/editAccountCurrencySwitch.html'
        };
    }
})();
