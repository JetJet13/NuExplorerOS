angular.module('NE.functionFactory', []) //instantiates
.factory('functionFactory', [ function(){
var functionFactory = {
	extDet: false,
	coin: true,

};
return {ff:functionFactory,
	    toggleDet:toggleDet,
	    toggleCoin:toggleCoin,
	    isNumeric:isNumeric
	}


function toggleDet(){
	if (functionFactory.extDet === false){
		return functionFactory.extDet = true;
	}
	else{
		return functionFactory.extDet = false;
	}
};
function toggleCoin(){
	if (functionFactory.coin === false){
		return functionFactory.coin = true;
	}
	else{
		return functionFactory.coin = false;
	}

};

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

}]);