angular.module('NE.statusFactory', ['NE.apiFactory']) //instantiates
.factory('statusFactory', ['apiFactory', function(apiFactory){

	var statusFactory = {
		getStatusInfo:getStatusInfo
	};

return statusFactory;
	function getStatusInfo(){
		
		return apiFactory.getStatusInfo().then(sendData);

		function sendData(response){
			return response;
		}
		
	};
}]);
