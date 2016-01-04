angular.module('NE.formFactory', ['NE.apiFactory','ngRoute','NE.functionFactory'])
.factory('formFactory',['apiFactory','$location','functionFactory', 
	function(apiFactory,$location,functionFactory){

	var formFactory = {
		noResult:false,
		searchBox:false,
		input:null
	};
	return {
		fof: formFactory,
		checkInput:checkInput
	};

	function sendData(response){
			return response
	}

	function checkBlock(id){ 
		return apiFactory.getBlockexists(id).then(sendData);		
	};

	function checkTx(id){
		return apiFactory.getTransactionexists(id).then(sendData);
	};

	function checkAddress(id){
		return apiFactory.getAddressexists(id).then(sendData);
	};
	function inputResult(exists,url){
		if(exists){
           return formFactory.noResult = false,
		          formFactory.searchBox = false,
		          formFactory.input = null,
		          $location.path(url);
        }
        else{
           return formFactory.noResult = true,
                  formFactory.searchBox = false,
                  formFactory.input = null;
                  
        }
	};
	function checkInput(id){

		var inputLen = id.length;

		if (inputLen === 64){

            checkBlock(id).then(function(result){

                if(result.data.exists){ //id is a block hash
                	return inputResult(true,"/blocks/"+id+"/1");
                }
                else{ // id not a block hash, let's check if its a tx hash

                    checkTx(id).then(function(result){

                        if(result.data.exists){ //id is a tx hash
                        	return inputResult(true,"/transactions/"+ id);
                        }
                        else{ //id is neither block hash or tx hash
                        	return inputResult(false,"/");                            
                        }
                    });
                }

            });
        }
        else if (inputLen === 33 || inputLen === 34){
            checkAddress(id).then(function(result){

            	if(result.data.exists){ //id is an address
            		return inputResult(true,"/address/"+id+"/1/newest");
                }
                else{ //id is not an address
                	return inputResult(false,"/");
                }
                
            });

        }
        else if (inputLen < 33 && functionFactory.isNumeric(id)){

            checkBlock(id).then(function(result){

            	if(result.data.exists){ //id is a block height
            		return inputResult(true,"/blocks/"+id+"/1");
                }
                else{ //id is not a block height
                    return inputResult(false,"/");
                }
                
            });
        }
        else{
			return inputResult(false,"/");
        }
	};
}]);