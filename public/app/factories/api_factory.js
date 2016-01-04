angular.module('NE.apiFactory', []); //instantiates
angular.module('NE.apiFactory').factory('apiFactory', ['$http','$window', function($http,$window){
    
var apiFactory = {};


    apiFactory.getBlockDetails = function (id,pageId) {
               $window.document.title = "Block | " + id;        
        return $http.get('/api/blockDetails/' + id+"/"+pageId);
    };
    apiFactory.getOrphanBlockDetails = function (id,pageId) {
               $window.document.title = "Orphan | " + id;        
        return $http.get('/api/orphanblockDetails/' + id+"/"+pageId);
    };
    apiFactory.getBlockexists = function (id) {
        return $http.get('/api/blockExist/' + id);
    };
    apiFactory.getTransactionexists = function (id) {
        return $http.get('/api/transactionExist/' + id);
    };
    apiFactory.getTxDetails = function (id) {
               $window.document.title = "Tx | " + id;      
        return $http.get('/api/txDetails/' + id);
    };
    apiFactory.getTxInfo = function (id) {
        return $http.get('/api/txInfo/' + id);
    };
    apiFactory.getAddressexists = function (id) { 
        return $http.get('/api/addressExist/'+ id);
    };
    apiFactory.getAddressDetails = function (id,pageId,sortId) {
        return $http.get('/api/addressDetails/'+ id+"/"+pageId+"/"+sortId);
    };
    apiFactory.getAddressInfo = function (id) { 
        $window.document.title = "Address | " + id;       
        return $http.get('/api/addressInfo/'+ id);
    };
    apiFactory.getBlockInfo = function (id) {
        return $http.get('/api/blockInfo/' + id);
    };
    apiFactory.getStatusDetails = function() {
        return $http.get('/api/statusDetails/');        
    };
    apiFactory.getStatusInfo = function() {
        $window.document.title = "Network Status";
        return $http.get('/api/statusInfo/');        
    };
    apiFactory.getpospowChart = function() {
        return $http.get('/api/posvpow'); 
    };
    apiFactory.getDiffChart = function () {
        $window.document.title = "Chart | Diff.";
        return $http.get('/api/diff');
    };
    apiFactory.getSizeChart = function () {
        return $http.get('/api/size');  
    };
    apiFactory.getnumTransChart = function () {
        $window.document.title = "Chart | Num Trans";
        return $http.get('/api/numtrans');  
    };
    apiFactory.getAllBlockInfo = function (id) {
        $window.document.title = "All Blocks";
        return $http.get('/api/allblockInfo/'+ id);  
    };
    apiFactory.getAllOrphanBlockInfo = function (id) {  
    $window.document.title = "All Orphan Blocks";      
        return $http.get('/api/allorphanblockInfo/'+ id);  
    };
    apiFactory.getOrphanChart = function () {
        $window.document.title = "Chart | Orphan";
        return $http.get('/api/orphan');  
    };
    apiFactory.getSolvedByChart = function () {
        $window.document.title = "Chart | Solved By";
        return $http.get('/api/solvedBy');  
    };
    apiFactory.getAllCustodians = function () {
        $window.document.title = "Custodians";
        return $http.get('/api/custodians');  
    };
    apiFactory.getAllSuccessCustodians = function () {
        $window.document.title = "Successful Custodians";
        return $http.get('/api/successCustodians');  
    };
    apiFactory.getallBlockVotesCustodians = function(id,pageId) {    
        return $http.get('/api/allBlockVotesCustodians/'+id+"/"+pageId);
    };
    apiFactory.getAllMotions = function () {
        $window.document.title = "Motions";
        return $http.get('/api/motions');  
    };
    apiFactory.getAllSuccessMotions = function () {
        $window.document.title = "Successful Motions";
        return $http.get('/api/successMotions');  
    };
    apiFactory.getallBlockVotesMotions = function(id,pageId) {
        return $http.get('/api/allBlockVotesMotions/'+id+"/"+pageId);
    };
     apiFactory.getallBlockVotes = function(id,pageId) {
        $window.document.title = "Votes | " + id;
       if(id.length === 40){
          return apiFactory.getallBlockVotesMotions(id,pageId);
       }
       else{
          return apiFactory.getallBlockVotesCustodians(id,pageId);
       }
    };   
    apiFactory.getAllPeers = function (pageId) {
        $window.document.title = "Connected Nodes";
        return $http.get('/api/allPeers/'+pageId);  
    };
    apiFactory.getAddressOrphans = function (id,pageId,sortId) {
        $window.document.title = "Address | " + id;
        return $http.get('/api/addressOrphanDetails/'+ id+"/"+pageId+"/"+sortId);
    };
    apiFactory.getTopSharesAddresses = function() {
        $window.document.title = "Wealthy NSR";
        return $http.get('/api/topSharesAddresses/');
        
    };
    apiFactory.getTopBitsAddresses = function() {
        $window.document.title = "Wealthy NBT";
        return $http.get('/api/topBitsAddresses/');
        
    };
     return apiFactory;
}]);