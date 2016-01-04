angular.module('NE.FormController',['ngRoute','NE.functionFactory','NE.formFactory','NE.navFactory'])
.controller('FormController', ['$scope','$location', 'formFactory', 'functionFactory','navFactory',
    function($scope,$location,formFactory,functionFactory,navFactory){

        $scope.fof = formFactory.fof;
        $scope.querySubmit = formFactory.checkInput;
                             

$scope.$on('$locationChangeSuccess', function(event) {
    $scope.fof.noResult = false;
    navFactory.navRoute($location.path());
});

    }]);        
