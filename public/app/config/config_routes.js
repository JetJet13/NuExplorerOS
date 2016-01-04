angular.module('NE.RouteConfig', ['ngRoute']) //instantiates
.config(['$routeProvider','$locationProvider',
 function($routeProvider,$locationProvider) {
		
			// route for the home page
			$routeProvider.when('/', {
				templateUrl : '/app/static/home.html',
						
			});
            // route for the status page
			$routeProvider.when('/status', {
				templateUrl : '/app/static/status.html',

			});
            // route for the api page
			$routeProvider.when('/apidocs', {
				templateUrl : '/app/static/api.html'
			
			});
            // route for the about page
			$routeProvider.when('/about', {
				templateUrl : '/app/static/about.html'
		
			});
            // route for the chart page
			$routeProvider.when('/charts/:chart_id', {
				templateUrl : '/app/static/charts.html'
               // reloadOnSearch:false
			
			});
            // route for the status page
			$routeProvider.when('/allBlocks/:page_id', {
				templateUrl : '/app/static/allBlocks.html',
            });
            // route for the status page
			$routeProvider.when('/orphans/:page_id', {
				templateUrl : '/app/static/allOrphanBlocks.html',                
			    
            			
			});
			// route for the address page
			$routeProvider.when('/address/:address_id/:page_id/:sort_id', {
				templateUrl : '/app/static/address.html'
				
               
				
			});

			// route for the contact page
			$routeProvider.when('/blocks/:block_id/:page_id', {
				templateUrl : '/app/static/blocks.html'
				
            
                
				
			});
            // route for the contact page
			$routeProvider.when('/orphan/:block_id/:page_id', {
				templateUrl : '/app/static/orphanblocks.html'
				
            
                
				
			});
            // route for the trans. page
			$routeProvider.when('/transactions/:tx_id', {
				templateUrl : '/app/static/transactions.html'
				
				
			});
            // route for the votes page
			$routeProvider.when('/votes', {
				templateUrl : '/app/static/votes.html'
			    
            			
			});
            // route for the success votes page
			$routeProvider.when('/votes/success', {
				templateUrl : '/app/static/successVotes.html'
			    
            			
			});
            $routeProvider.when('/votedfor/:cust_id/:page_id',{
                templateUrl : '/app/static/votedFor.html'
            });
            // route for the votes page
			$routeProvider.when('/motions', {
				templateUrl : '/app/static/motions.html'
			    
            			
			});
            // route for the success votes page
			$routeProvider.when('/motions/success', {
				templateUrl : '/app/static/successMotions.html'
			    
            			
			});
            // route for the success votes page
			$routeProvider.when('/peers/:page_id', {
				templateUrl : '/app/static/peers.html'
			    
            			
			});
            $routeProvider.when('/topNSRaddresses/:page_id', {
                templateUrl : '/app/static/topAddresses.html'                
                
            });
            $routeProvider.when('/topNBTaddresses/:page_id', {
                templateUrl : '/app/static/topAddressesBits.html'                
                
            });
          
            $routeProvider.otherwise({ redirectTo: '/' });
        
        $locationProvider.html5Mode({
									  enabled: true,
									  requireBase: false
		});
	}]);