angular.module('NE.chartFactory', ['NE.apiFactory']) //instantiates
.factory('chartFactory', ['apiFactory','$location', function(apiFactory,$location){

	var chartFactory = {
		posDiff: getDiffChart,
		numTrans: getNumTransChart,
		orphan: getOrphanChart,
		bSolved: getSolvedByChart,
		toggleChart: toggleChart,

	};
	return chartFactory
	
function toggleChart(chart){
	return $location.path('/charts/'+ chart)
}

function getDiffChart(){

return apiFactory.getDiffChart().then(sendData);

function sendData(response){
return  {
   options:{
    chart: {
            type: 'line',
            zoomType: 'x'            
        }
    },
        title: {
            text: 'Proof -of- Stake Difficulty'
        },
        xAxis: {
          type: 'datetime'
            
        },
        yAxis: {
            min:0,
            title: {
                text: 'Difficulty'
            }
        },
        subtitle:{
              
                text: 'every 1440 blocks (source: blockexplorer.nu)'
            } ,
        series: [{
            name: 'PoS Diff.',
            data: response.data
            
        }]
  }
 };
};


function getNumTransChart(){

return apiFactory.getnumTransChart().then(sendData);

function sendData(response){
return {
   options:{
    chart: {
            type: 'line',
            zoomType: 'x'            
        }
    },
        title: {
            text: 'No. Trans. (24hr avg)'
        },
        xAxis: {
            type:'datetime'
          
            
        },
        yAxis: {
            min:0,
            title: {
                text: '# of Trans.'
            }
        },
        subtitle:{
              
                text: 'every 1440 blocks (source: blockexplorer.nu)'
            } ,
        series: [{
            name: 'No. Trans. NuShares',
            data: response.data.Shares
        },
        {
            name: 'No. Trans. NuBits',
            data: response.data.Bits
        }
        ]
  };
};

};


function getOrphanChart(){
return apiFactory.getOrphanChart().then(sendData);

function sendData(response){

return {
   options:{
    chart: {
            type: 'line',
            zoomType: 'x'            
        }
    },
        title: {
            text: 'Orphan Blocks'
        },
        xAxis: {
            type:'datetime'
          
            
        },
        yAxis: {
            min:0,
            title: {
                text: '# of Orphan Blocks'
            }
        },
        subtitle:{
              
                text: 'every 1440 blocks (source: blockexplorer.nu)'
            } ,
        series: [{
            name: 'Orphan Blocks',
            data: response.data.orph
        }]
  };
};
};

function getSolvedByChart(){

return apiFactory.getSolvedByChart().then(sendData);

function sendData(response){

return {
   options:{
    chart: {
            type: 'pie'
                       
        },
    tooltip: {
            
            valueSuffix: '%'
        }
    },
        title: {
            text: 'Blocks Solved'
        },
        
        subtitle:{
              
                text: 'blocks solved in the past 24hrs. (source: blockexplorer.nu)'
            } ,
        
        series: [{
            
            name: 'Blocks Minted',
            data: response.data
        }]
  };
};
};

}]);