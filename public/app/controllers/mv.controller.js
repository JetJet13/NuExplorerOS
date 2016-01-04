angular.module('NE.MVController', ['NE.wsFactory','NE.currencyFactory','NE.functionFactory','ngRoute','NE.mvFactory','NE.pageFactory']) //instantiates
.controller('AllMotionsController', [ '$scope','$location','mvFactory', 
function($scope,$location,mvFactory) {

    mvFactory.getMotions().then(function(result){
    	$scope.moData = result.data;
    	$scope.isData = result.data.length;
    });

    $scope.goSuccess = function(){
     	$location.path("/motions/success");
	};

}])
.controller('JAllSuccessMotionsController', [ '$scope','$location','mvFactory', 
function($scope,$location,mvFactory) {

    mvFactory.getSuccessMotions().then(function(result){
    	$scope.moData = result.data;
    	$scope.isData = result.data.length;
    });

    $scope.goVotes = function(){
     	$location.path("/motions/");
	};

}])
.controller('AllCustodiansController', ['$scope','$location','wsFactory','functionFactory','mvFactory','currencyFactory',
	function($scope,$location,wsFactory,functionFactory,mvFactory,currencyFactory){

		$scope.ff = functionFactory.ff;
	    $scope.toggleCoin = functionFactory.toggleCoin;
	    $scope.convertCurrency = currencyFactory.convertCurrency;
	    $scope.cf = currencyFactory.getCF();

	    mvFactory.getCustodians().then(function(result){
    		$scope.custData = result.data;
    		$scope.isData = result.data.length;
    	});

    	$scope.goSuccess = function(){

     		$location.path("/votes/success");
     	};

}])
.controller('AllSuccessCustodiansController', ['$scope','$location','wsFactory','functionFactory','mvFactory','currencyFactory',
	function($scope,$location,wsFactory,functionFactory,mvFactory,currencyFactory){

		$scope.ff = functionFactory.ff;
	    $scope.toggleCoin = functionFactory.toggleCoin;
	    $scope.convertCurrency = currencyFactory.convertCurrency;
	    $scope.cf = currencyFactory.getCF();

	    mvFactory.getSuccessCustodians().then(function(result){
    		$scope.custData = result.data;
    		$scope.isData = result.data.length;
    	});

$scope.goVotes = function(){

     $location.path("/votes");


}; 

 
}])
.controller('AllBlockVotesController',['$scope','$routeParams','mvFactory','$q',
function($scope,$routeParams,mvFactory,$q){
	
var deferred = $q.defer();
var promise = deferred.promise;
promise = promise.then(getBV).then(activate);
deferred.resolve();

function getBV(){
	return mvFactory.getBlockVotes($routeParams.cust_id,$routeParams.page_id).then(function(result){
				$scope.blocks = result.data;
			});
};
function activate(){
	return $scope.cust_address = $routeParams.cust_id,
		   $scope.infScroll = false,
		   $scope.pageIndex = 2,
		   $scope.go = function (id,pageId,numVotes){
    				console.log(id,pageId,numVotes);
    				if (pageId <= Math.ceil(numVotes/20)){
    					$scope.isLoading = true;
        				$scope.infScroll = true;
    					return mvFactory.getBlockVotes(id,pageId).then(function(result){

				            $scope.infScroll = false;    
				            $scope.isLoading = false;      
				            $scope.blocks = $scope.blocks.concat(result.data);
				            $scope.pageIndex ++;
			            });
    				}
    				else{
    					$scope.infScroll = true;
    					$scope.isLoading = false;
        				return null

    				}

};

}




}]);