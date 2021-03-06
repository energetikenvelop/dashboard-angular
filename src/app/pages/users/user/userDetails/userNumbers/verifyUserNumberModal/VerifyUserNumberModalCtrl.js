(function () {
    'use strict';

    angular.module('BlurAdmin.pages.users.user')
        .controller('VerifyUserNumberModalCtrl', VerifyUserNumberModalCtrl);

    function VerifyUserNumberModalCtrl($scope,$uibModalInstance,number,user,toastr,$http,environmentConfig,localStorageManagement,errorHandler) {

        var vm= this;
        $scope.mobile = number;
        $scope.user = user;
        vm.token = localStorageManagement.getValue('TOKEN');
        $scope.verifyingMobile = false;
        vm.company = {};

        vm.getCompanyDetails = function () {
            $http.get(environmentConfig.API + '/company/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.status === 200) {
                    vm.company =  res.data.data;
                }
            }).catch(function (error) {
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };
        vm.getCompanyDetails();

        $scope.verifyMobile = function () {
            $scope.verifyingMobile = true;
            $http.patch(environmentConfig.API + '/admin/users/mobiles/' + $scope.mobile.id + '/', {verified: true}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                $scope.verifyingMobile = false;
                if (res.status === 200) {
                    toastr.success('Mobile number successfully verified');
                    $uibModalInstance.close($scope.mobile);
                }
            }).catch(function (error) {
                $scope.verifyingMobile = false;
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };

        $scope.resendMobileVerification = function () {
            $scope.verifyingMobile = true;
            $http.post(environmentConfig.API + '/auth/mobile/verify/resend/', {mobile: $scope.mobile.number,company: vm.company.identifier}, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                $scope.verifyingMobile = false;
                if (res.status === 200) {
                    toastr.success('Mobile number verification resent successfully');
                    $uibModalInstance.close();
                }
            }).catch(function (error) {
                $scope.verifyingMobile = false;
                errorHandler.evaluateErrors(error.data);
                errorHandler.handleErrors(error);
            });
        };


    }
})();
