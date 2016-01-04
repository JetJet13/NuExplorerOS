angular.module('NE.TXController', ['NE.txFactory','NE.currencyFactory','NE.functionFactory','ngRoute']) //instantiates
.controller('TransController', ['$scope','$rootScope','txFactory','currencyFactory','functionFactory','$routeParams' ,
	function($scope,$rootScope,txFactory,currencyFactory,functionFactory,$routeParams){


		txFactory.getTx($routeParams.tx_id).then(function(result){
			$scope.txData = result.data;
		});

		$scope.hex2a = txFactory.hex2a;
		$scope.ff = functionFactory.ff;
		$scope.toggleDet = functionFactory.toggleDet;
		$scope.toggleCoin = functionFactory.toggleCoin;
		$scope.convertCurrency = currencyFactory.convertCurrency;
		$scope.cf = currencyFactory.getCF();



}])
.controller('LiveTransController', ['$scope','wsFactory', function($scope, wsFactory){ 

    
    $scope.tx = wsFactory.wsTX;
 

}]);