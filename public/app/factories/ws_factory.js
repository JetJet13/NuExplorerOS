angular.module('NE.wsFactory', ['ngWebSocket','NE.apiFactory']); //instantiates
angular.module('NE.wsFactory').factory('wsFactory', ['$websocket', 'apiFactory', function($websocket, apiFactory){

var wsFactory = {

	statusDetails:{},
	blockList:[],
	txList:[]
};
var dataStream = $websocket('ws://localhost:800',{
	protocolVersion:8,
	origin:'http://localhost:800/'
}); // websocket connect url
dataStream.onMessage(function(message){

var data = JSON.parse(message.data);
console.log(data);

	if (data.type === 'status'){
		
		wsFactory.statusDetails = data.info;
	}
	else if (data.type === 'block'){
		
		wsFactory.blockList.pop();
		wsFactory.blockList.unshift({
							height:data.info.height,
							timestamp:data.info.timestamp,
					        size:data.info.size,
					        numTrans:data.info.numTrans,
					        solvedBy:data.info.solvedBy,
					        totRec:data.info.totRec,
					        totRecBits:data.info.totRecBits,
					        cdd:data.info.cdd
		});
		

	}
	else if (data.type === 'tx'){

		if (wsFactory.txList.length >= 5){
			
			wsFactory.txList.pop();
		}
		
		wsFactory.txList.unshift({
			hash:data.info.hash,
			totRec:data.info.totRec,
			timestamp:data.info.timestamp
		});
		
	}

    
});
return {
		ws:wsFactory,
		getSD: function() {return apiFactory.getStatusDetails().success(function(data){wsFactory.statusDetails = data;})},
		getBL: function() {return apiFactory.getBlockInfo(7).success(function(data){wsFactory.blockList = data;})}
		

	 }      

}]);
 