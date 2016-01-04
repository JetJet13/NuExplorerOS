
angular.module('NE',[
     'ngWebSocket'
    ,'ngRoute'
    ,'monospaced.qrcode'
    ,'yaru22.angular-timeago'
    ,'highcharts-ng'
    ,'infinite-scroll'
    ,'angular-loading-bar'
    ,'NE.RouteConfig'
    ,'NE.StatusController'
    ,'NE.BlocksController'
    ,'NE.ChartController'
    ,'NE.MVController'
    ,'NE.OLController'
    ,'NE.TXController'
    ,'NE.AddressController'
    ,'NE.NavigateController'
    ,'NE.FormController'
    ,'NE.CurrencyController'
    ,'NE.apiFactory'
    ,'NE.wsFactory'
    ,'NE.functionFactory'
    ,'NE.currencyFactory'

])
.run(['$q','$rootScope','wsFactory','currencyFactory', function($q,$rootScope,wsFactory,currencyFactory){
//instantiate the status details,blocklist and currency values 
var deferred = $q.defer();
var promise = deferred.promise; 
promise = promise.then(wsFactory.getSD).then(wsFactory.getBL).then(currencyFactory.activate);
deferred.resolve();

}])

//-------------------------------------------------------------------------------------------------------------------
//------------------------------------SCROLL TO CHART DIRECTIVE------------------------------------------------------
.directive('scrollToItem', function() {                                                      
    return {                                                                                 
        restrict: 'A',                                                                       
        scope: {                                                                             
            scrollTo: "@"                                                                    
        },                                                                                   
        link: function(scope, $elm,attr) {                                                   

            $elm.on('click', function() {                                                    
                $('html,body').animate({scrollTop: $(scope.scrollTo).offset().top }, "slow");
            });                                                                              
        }                                                                                    
    };
})  ;


/* THIS IS NOT YET IMPLEMENTED
//------------------------------------API PAGE CONTROLLER---------------------------------------------------------------
.controller('apiPageController',[function(){}]);
//-------------------------------------------------------------------------------------------------------------------
//------------------------------------ABOUT PAGE CONTROLLER---------------------------------------------------------------
.controller('AboutController',[function(){}]);
*/




