angular.module('NE.navFactory',['ngRoute','NE.formFactory'])
.factory('navFactory',['$location','$window','formFactory', 
	function($location,$window,formFactory){
	var navFactory = {
		home:false,
		status:false,
		charts:false,
		api:false,
		motions:false,
		votes:false,
		orphans:false
	};
	return { 
		nf:navFactory,
		go:go,
		navRoute:navRoute
	};
	function navRoute(path){
		var content = path.split('/');
		var location = content[1];
		if (location !== "" && 
			location !== "status" && 
			location !== "charts" && 
			location !== "motions" && 
			location !== "votes" && 
			location !== "orphans" 
			)
		{//the route is block page or address or tx page etc.
			return navFactory.home = false,
				   navFactory.status = false,
			       navFactory.charts = false,
			       navFactory.api = false,
			       navFactory.motions = false,
			       navFactory.votes = false,
			       navFactory.orphans = false;
		}
		else{
			if (location === ""){
				location = "home";
			}
			return navFactory[location] = true;
		}
		
	}

	function go(location,newRoute){

        navFactory.home = false;
		navFactory.status = false;
	    navFactory.charts = false;
	    navFactory.api = false;
	    navFactory.motions = false;
	    navFactory.votes = false;
	    navFactory.orphans = false;
		return $location.path('/'+ location),
			   navFactory[newRoute] = true,
			   formFactory.fof.input = null;
	};
}]);