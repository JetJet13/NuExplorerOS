angular.module('NE.mvFactory', ['NE.apiFactory']) //instantiates
.factory('mvFactory', ['apiFactory', function(apiFactory){ 

var mvFactory = {
	getMotions:getMotions,
	getCustodians:getCustodians,
	getSuccessMotions:getSuccessMotions,
	getSuccessCustodians:getSuccessCustodians,
	getBlockVotes:getBlockVotes
};
return mvFactory

function getMotions(){

	return apiFactory.getAllMotions().then(sendData);
	function sendData(response){
			return response;
	}
};

function getCustodians(){

	return apiFactory.getAllCustodians().then(sendData);
	function sendData(response){
			return response;
	}
};

function getSuccessMotions(){
	return apiFactory.getAllSuccessMotions().then(sendData);
	function sendData(response){
			return response;
	}
};

function getSuccessCustodians(){
	return apiFactory.getAllSuccessCustodians().then(sendData);
	function sendData(response){
			return response;
	}
};

function getSuccessCustodians(id,pageId){
	return apiFactory.getAllSuccessCustodians(id,pageId).then(sendData);
	function sendData(response){
			return response;
	}
};

function getBlockVotes(id,pageId){
	return apiFactory.getallBlockVotes(id,pageId).then(sendData);
	function sendData(response){
			return response;
	}
};


}]);