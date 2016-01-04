angular.module('NE.txFactory', ['NE.apiFactory']) //instantiates
.factory('txFactory', ['apiFactory', function(apiFactory){

var txFactory = {
	getTx:getTx,
	hex2a:hex2a
};
return txFactory

function getTx(id){

	return apiFactory.getTxDetails(id).then(sendData);
	function sendData(response){
		return response;
	};
};

function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
} 

}]);