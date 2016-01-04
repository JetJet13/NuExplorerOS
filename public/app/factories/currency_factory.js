angular.module('NE.currencyFactory', ['NE.apiFactory','NE.wsFactory','NE.functionFactory']) //instantiates
.factory('currencyFactory', ['apiFactory','wsFactory','functionFactory', function(apiFactory,wsFactory,functionFactory){

var currencyFactory = {
	currencies: [
                     { id: 0, name: 'USD',             symbol:"USD", icon:"$" },
                     { id: 1, name: 'EUR',             symbol:"EUR", icon:"\u20AC"},
                     { id: 2, name: 'CNY',             symbol:"CNY", icon:"\u00A5"}
                    ],
    curr:{},
    price:0,
    priceBits:0

};

return {
		getCF : function(){return currencyFactory},
	    changeCur:changeCur,
	    activate: activate,
	    convertCurrency:convertCurrency
		};



function activate(){
	var info = wsFactory.ws;
    
	return currencyFactory.price = info.statusDetails.USDprice,
		   currencyFactory.priceBits = info.statusDetails.USDpriceBits,
		   currencyFactory.curr = currencyFactory.currencies[0];
}

function changeCur (newCurr){
	var info = wsFactory.getWS();
	if (newCurr.name === 'USD'){
        return currencyFactory.price = info.statusDetails.USDprice,
        	   currencyFactory.priceBits = info.statusDetails.USDpriceBits,
        	   currencyFactory.curr = newCurr,
        	   functionFactory.ff.coin = false;
    }
    else if (newCurr.name === 'EUR'){
        return  currencyFactory.price = info.statusDetails.EURprice,
        		currencyFactory.priceBits = info.statusDetails.EURpriceBits,
        		currencyFactory.curr = newCurr,
        		functionFactory.ff.coin = false;
    }
    else if (newCurr.name === 'CNY'){
        return  currencyFactory.price = info.statusDetails.CNYprice,
        	    currencyFactory.priceBits = info.statusDetails.CNYpriceBits,
        		currencyFactory.curr = newCurr,
        		functionFactory.ff.coin = false;
    }
};

function convertCurrency(amount,type){
    
    if(type==="NBT"){ //this is for NuBits
       
        return amount*currencyFactory.priceBits;
        
    }
    else{ //this is for NuShares
        
        return amount*currencyFactory.price;
        
    }
        
};
    

}]);