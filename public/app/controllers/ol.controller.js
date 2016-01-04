//OL represents Other Links (located on status page)
angular.module('NE.OLController', ['NE.OLFactory','ngRoute']) //instantiates
.controller('AllPeersController', [ '$scope','olFactory','$q','$routeParams',
function($scope,olFactory,$q,$routeParams) {

var deferred = $q.defer();
var promise = deferred.promise;
promise = promise.then(getAP).then(activate);
deferred.resolve();

function getAP(){

return	olFactory.getAllPeers($routeParams.page_id).then(function(result){
		$scope.peers = result.data.info;
		$scope.numPeers = result.data.numPeers;
});
};
function activate(){
	return $scope.isLoading = false,
		   $scope.infScroll = false,
		   $scope.pageIndex = 2,
		   $scope.go = function (pageId,numPeers){
    				console.log(pageId,numPeers);
    				if (pageId <= Math.ceil(numPeers/20)){
    					$scope.isLoading = true;
        				$scope.infScroll = true;
    					return olFactory.getAllPeers(pageId).then(function(result){

				            $scope.infScroll = false;    
				            $scope.isLoading = false;      
				            $scope.peers = $scope.peers.concat(result.data.info);
				            $scope.pageIndex ++;
			            });
    				}
    				else{
    					$scope.infScroll = true;
    					$scope.isLoading = false;
        				return null

    				}
			};


};


}])
.controller('TopSharesAddressesController', [ '$scope','olFactory',
function($scope,olFactory) {


olFactory.getRichNSR().then(function(result){
		$scope.NSRaddresses = result.data.info;
		$scope.NSRsupply = result.data.NSRsupply;
});

}])
.controller('TopBitsAddressesController', [ '$scope','olFactory',
function($scope,olFactory) {


olFactory.getRichNBT().then(function(result){
		$scope.NBTaddresses = result.data.info;
		$scope.NBTsupply = result.data.NBTsupply;
});

}]);