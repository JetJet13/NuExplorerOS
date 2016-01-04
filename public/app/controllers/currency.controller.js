angular.module('NE.CurrencyController',['NE.currencyFactory'])
.controller("CurrencyController",['$scope','currencyFactory', function($scope, currencyFactory){
        
    $scope.getCF = currencyFactory.getCF();
    $scope.changeCur = currencyFactory.changeCur; 


}]);