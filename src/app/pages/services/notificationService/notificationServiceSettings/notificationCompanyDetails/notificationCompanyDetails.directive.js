(function () {
    'use strict';

    angular.module('BlurAdmin.pages.services.notificationService.notificationServiceSettings')
        .directive('notificationCompanyDetails', notificationCompanyDetails);

    /** @ngInject */
    function notificationCompanyDetails() {
        return {
            restrict: 'E',
            require: '^parent',
            templateUrl: 'app/pages/services/notificationService/notificationServiceSettings/notificationCompanyDetails/notificationCompanyDetails.html'
        };
    }
})();
