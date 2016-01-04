angular.module('NE.ChartController', ['NE.chartFactory','ngRoute','NE.blockFactory','NE.pageFactory']) //instantiates
.controller('ChartController',['$scope','$rootScope','chartFactory','$location','$routeParams',

function($scope,$rootScope,chartFactory,$location,$routeParams){ 

var whichChart= $routeParams.chart_id;

$scope.toggleChart = chartFactory.toggleChart;

if (whichChart === 'posdiff'){
	chartFactory.posDiff().then(function(result){
		$scope.showChart = result;
	});
}
else if (whichChart === 'numtrans'){
	chartFactory.numTrans().then(function(result){
		$scope.showChart = result;
	});
}
else if (whichChart === 'orphan'){
	chartFactory.orphan().then(function(result){
		$scope.showChart = result;
	});
}
else if (whichChart === 'solvedby'){
	chartFactory.bSolved().then(function(result){
		$scope.showChart = result;
	});
}





}]);
