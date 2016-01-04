angular.module('NE.NavigateController',['ngRoute','NE.navFactory'])
.controller('NavigateController',['$scope','$location','$route','$window','navFactory',
	function($scope,$location,$route,$window,navFactory){

		$scope.go = navFactory.go;
		$scope.nf = navFactory.nf;
		navFactory.navRoute($location.path());

	}]);