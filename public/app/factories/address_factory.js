angular.module('NE.addressFactory',['NE.apiFactory'])
.factory('addressFactory',['apiFactory',function(apiFactory){
	var addressFactory = {
		getAddress:getAddress,
		addressInfo:getAddressInfo,
		addressTxs:getAddressTxs,
		addressOrphans:getAddressOrphans
	};
	return addressFactory

	function getAddress(id,pageId,sortId){

		if (sortId === 'orphan'){
			return {
				info:getAddressInfo(id), 
				tx:getAddressOrphans(id,pageId,sortId)
			};
		}
		else{
			return {
				info:getAddressInfo(id), 
				tx:getAddressTxs(id,pageId,sortId)
			};
		}
	};

		function sendData(response){
			return response
		};
		function getAddressInfo(id){
			return apiFactory.getAddressInfo(id).then(sendData);
		};
		function getAddressTxs(id,pageId,sortId){
			return apiFactory.getAddressDetails(id,pageId,sortId).then(sendData);
		};
		function getAddressOrphans(id,pageId,sortId){
			return apiFactory.getAddressOrphans(id,pageId,sortId).then(sendData);
		};

}]);