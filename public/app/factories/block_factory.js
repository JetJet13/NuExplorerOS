angular.module('NE.blockFactory', ['NE.apiFactory']) //instantiates
.factory('blockFactory', ['apiFactory', function(apiFactory){

	var blockFactory = {
		getBlockDetails:getBlockDetails,
		getAllBlocks:getAllBlocks,
		getOrphanBlockDetails:getOrphanBlockDetails,
		getAllOrphanBlocks:getAllOrphanBlocks
	};
	return blockFactory;

	function sendData(response){
			return response;
	}

	function getBlockDetails(block_id,page_id){
		
		return apiFactory.getBlockDetails(block_id,page_id).then(sendData);		
	};

	function getAllBlocks(page_id){
		
		return apiFactory.getAllBlockInfo(page_id).then(sendData);		
	};

	function getOrphanBlockDetails(block_id,page_id){
		
		return apiFactory.getOrphanBlockDetails(block_id,page_id).then(sendData);
	};

	function getAllOrphanBlocks(page_id){
		
		return apiFactory.getAllOrphanBlockInfo(page_id).then(sendData);
	};
}]);
