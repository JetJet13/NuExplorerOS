//OTHER LINKS FACTORY
angular.module('NE.OLFactory', ['NE.apiFactory']) //instantiates
.factory('olFactory', ['apiFactory', function(apiFactory){ 

var olFactory = {
	getAllPeers:getAllPeers,
	getRichNSR:getRichNSR,
	getRichNBT:getRichNBT
};
return olFactory

function getAllPeers(pageId){

	return apiFactory.getAllPeers(pageId).then(sendData);
	function sendData(response){
		return response;
	};
};

function getRichNSR (){
	return apiFactory.getTopSharesAddresses().then(sendData);
	function sendData(response){
		return response;
	};
}

function getRichNBT(){
	return apiFactory.getTopBitsAddresses().then(sendData);
	function sendData(response){
		return response;
	};
}

}]);