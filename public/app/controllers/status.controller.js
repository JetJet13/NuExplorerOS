angular.module('NE.StatusController', ['NE.wsFactory','NE.currencyFactory','NE.statusFactory']) //instantiates
.controller('StatusController', ['$scope','$rootScope','wsFactory','currencyFactory', 
function($scope,$rootScope,wsFactory,currencyFactory){ 
 
 $scope.s = wsFactory.ws; 
 console.log($scope.s);
 $scope.getCF = currencyFactory.getCF();
 
 


}])
.controller('StatusPageController',['$scope','statusFactory','currencyFactory', 
function($scope,statusFactory,currencyFactory){


$scope.cf = currencyFactory.getCF();
$scope.convertCurrency = currencyFactory.convertCurrency;
statusFactory.getStatusInfo().then(function(result){
    $scope.data = result.data;    
});

}]);