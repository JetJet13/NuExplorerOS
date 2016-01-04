angular.module('NE.AddressController',['ngRoute','NE.addressFactory','NE.functionFactory','NE.currencyFactory'])
.controller('AddressController', ['$scope','$routeParams','addressFactory','functionFactory','currencyFactory','$q',
    function($scope,$routeParams,addressFactory,functionFactory,currencyFactory,$q){
        var deferred = $q.defer();
        var promise = deferred.promise;
        promise = promise.then(getAI).then(activate);
        deferred.resolve();

        function getAI(){

            var addressInfo = addressFactory.getAddress($routeParams.address_id,$routeParams.page_id,$routeParams.sort_id);
           return addressInfo.info.then(function(result){
                    $scope.AddressData = result.data;
                }),
                  addressInfo.tx.then(function(result){
                    $scope.txData = result.data.tx;
                });

        }
        function activate(){
            return  $scope.sortId = $routeParams.sort_id,
                    $scope.ff = functionFactory.ff,
                    $scope.toggleDet = functionFactory.toggleDet,
                    $scope.toggleCoin = functionFactory.toggleCoin,
                    $scope.convertCurrency = currencyFactory.convertCurrency,
                    $scope.cf = currencyFactory.getCF(),
                    $scope.pageIndex = 2,
                    $scope.infScroll = false,
                    $scope.isLoading = false,
                    $scope.go = function(id,pageId,sortId,numTrans){
                        console.log(id,pageId,sortId,numTrans);
                        if (pageId <= Math.ceil(numTrans/20)){
                            $scope.isLoading = true
                            $scope.infScroll = true;
                            if (sortId === 'orphan'){
                                var whichSort = 'addressOrphans';
                            }
                            else{
                                var whichSort = 'addressTxs';
                            }
                            return addressFactory[whichSort](id,pageId,sortId)
                               .then(function(result){
                                $scope.isLoading = false;
                                $scope.infScroll = false;
                                $scope.txData = $scope.txData.concat(result.data.tx);
                                $scope.pageIndex ++;
                                });
                        
                        }
                        else{
                            $scope.infScroll = true;
                            $scope.isLoading = false;
                            return null
                            console.log("NO SECOND PAGE")
                            

                        }
                    };
        };
        


}])
.controller("qrController",['$scope', '$routeParams', function($scope, $routeParams){
    
    $scope.data = $routeParams.address_id;


}]);