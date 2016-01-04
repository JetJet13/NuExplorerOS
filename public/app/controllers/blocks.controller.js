angular.module('NE.BlocksController', ['NE.wsFactory','NE.currencyFactory','NE.functionFactory','ngRoute','NE.blockFactory']) //instantiates
.controller('LiveBlockController', [ '$scope','$rootScope','wsFactory','$location','currencyFactory','functionFactory','$window', 
    function($scope,$rootScope,wsFactory,$location,currencyFactory,functionFactory,$window) {
        // 
        $window.document.title = "Home";
        $rootScope.searchBox = true;       
        $scope.blocks = wsFactory.ws;
        $scope.ff = functionFactory.ff;
        $scope.toggleCoin = functionFactory.toggleCoin;
        $scope.convertCurrency = currencyFactory.convertCurrency;
        $scope.cf = currencyFactory.getCF();
           
  
  $scope.goAllBlocks = function () {
      return $location.path('/allBlocks/1'); 
  }
    
}])
.controller('BlockController', [ 'apiFactory','$rootScope','$routeParams','$scope','$location','blockFactory','currencyFactory','functionFactory','$q', 
    function(apiFactory, $rootScope, $routeParams, $scope, $location,blockFactory,currencyFactory,functionFactory,$q){ 

var deferred = $q.defer();
var promise = deferred.promise;
promise = promise.then(getBD).then(activate);
deferred.resolve();

 function getBD(){
   return blockFactory.getBlockDetails($routeParams.block_id,$routeParams.page_id)
    .then(function(result){
    $scope.blockData = result.data;
    $scope.txData = result.data.tx;
});
 };
function activate(){

    return  $scope.ff = functionFactory.ff,
            $scope.toggleDet = functionFactory.toggleDet,
            $scope.toggleCoin = functionFactory.toggleCoin,
            $scope.convertCurrency = currencyFactory.convertCurrency,
            $scope.cf = currencyFactory.getCF(),
            $scope.isLoading = false,
            $scope.infScroll = false,
            $scope.pageIndex = 2,

            $scope.go = function (blockId,pageId,numTrans){
                
                if (pageId <= Math.ceil(numTrans/20)){
                    $scope.isLoading = true
                    $scope.infScroll = true;
                return blockFactory.getBlockDetails(blockId,pageId)
                       .then(function(result){
                        $scope.isLoading = false;
                        $scope.infScroll = false;
                        $scope.blockData = result.data;
                        $scope.txData = $scope.txData.concat(result.data.tx);
                        $scope.pageIndex ++;
                        });
                }
                else{
                    $scope.infScroll = true;
                    $scope.isLoading = false;
                    return null
                    

                }

                };
};




}])
.controller('AllBlocksController', ['$scope','blockFactory','$q','functionFactory','currencyFactory', 
    function($scope,blockFactory,$q,functionFactory,currencyFactory){
    var deferred = $q.defer();
    var promise = deferred.promise;
    promise = promise.then(getAllBlocks).then(activate);
    deferred.resolve();

    function getAllBlocks(){

        return blockFactory.getAllBlocks(1).then(function(result){
            $scope.blocks = result.data;
        });
    };
    function activate(){
        $scope.ff = functionFactory.ff;
        $scope.toggleCoin = functionFactory.toggleCoin;
        $scope.convertCurrency = currencyFactory.convertCurrency;
        $scope.cf = currencyFactory.getCF();
        $scope.isLoading = false;
        $scope.infScroll = false;
        $scope.pageIndex = 2;

        $scope.go = function (pageId,numBlocks){
            
            if (pageId <= Math.ceil(numBlocks/20)){
                $scope.isLoading = true
                $scope.infScroll = true;
            return blockFactory.getAllBlocks(pageId)
                   .then(function(result){
                    $scope.isLoading = false;
                    $scope.infScroll = false;
                    $scope.blockData = result.data;
                    $scope.blocks = $scope.blocks.concat(result.data);
                    $scope.pageIndex ++;
                    });
            }
            else{
                $scope.infScroll = true;
                $scope.isLoading = false;
                return null
            }

};
    };


}])
.controller('OrphanBlockController', [ 'apiFactory','$rootScope','$routeParams','$scope','$location','blockFactory','currencyFactory','functionFactory','$q', 
    function(apiFactory, $rootScope, $routeParams, $scope, $location,blockFactory,currencyFactory,functionFactory,$q){ 

var deferred = $q.defer();
var promise = deferred.promise;
promise = promise.then(getOBD).then(activate);
deferred.resolve();

 function getOBD(){
   return blockFactory.getOrphanBlockDetails($routeParams.block_id,$routeParams.page_id)
    .then(function(result){
    $scope.blockData = result.data;
    $scope.txData = result.data.tx;
});
 };
function activate(){

    return  $scope.ff = functionFactory.ff,
            $scope.toggleDet = functionFactory.toggleDet,
            $scope.toggleCoin = functionFactory.toggleCoin,
            $scope.convertCurrency = currencyFactory.convertCurrency,
            $scope.cf = currencyFactory.getCF(),
            $scope.isLoading = false,
            $scope.infScroll = false,
            $scope.pageIndex = 2,

            $scope.go = function (blockId,pageId,numTrans){
                
                if (pageId <= Math.ceil(numTrans/20)){
                    $scope.isLoading = true
                    $scope.infScroll = true;
                return blockFactory.getOrphanBlockDetails(blockId,pageId)
                       .then(function(result){
                        $scope.isLoading = false;
                        $scope.infScroll = false;
                        $scope.blockData = result.data;
                        $scope.txData = $scope.txData.concat(result.data.tx);
                        $scope.pageIndex ++;
                        });
                }
                else{
                    $scope.infScroll = true;
                    $scope.isLoading = false;
                    return null
                    

                }

                };
};




}])
.controller('AllOrphanBlocksController', ['$scope','blockFactory','$q','functionFactory','currencyFactory', 
    function($scope,blockFactory,$q,functionFactory,currencyFactory){
    var deferred = $q.defer();
    var promise = deferred.promise;
    promise = promise.then(getAllOrphanBlocks).then(activate);
    deferred.resolve();

    function getAllOrphanBlocks(){

        return blockFactory.getAllOrphanBlocks(1).then(function(result){
            $scope.blocks = result.data;
        });
    };
    function activate(){
        $scope.ff = functionFactory.ff;
        $scope.toggleCoin = functionFactory.toggleCoin;
        $scope.convertCurrency = currencyFactory.convertCurrency;
        $scope.cf = currencyFactory.getCF();
        $scope.isLoading = false;
        $scope.infScroll = false;
        $scope.pageIndex = 2;

        $scope.go = function (pageId,numBlocks){
            
            if (pageId <= Math.ceil(numBlocks/20)){
                $scope.isLoading = true
                $scope.infScroll = true;
            return blockFactory.getAllOrphanBlocks(pageId)
                   .then(function(result){
                    $scope.isLoading = false;
                    $scope.infScroll = false;
                    $scope.blockData = result.data;
                    $scope.blocks = $scope.blocks.concat(result.data);
                    $scope.pageIndex ++;
                    });
            }
            else{
                $scope.infScroll = true;
                $scope.isLoading = false;
                return null
            }

};
    };


}]) 