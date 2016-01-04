var db = require('mongojs').connect('mongodb://<username>:<password>@127.0.0.1:27017/BlockDB',['StatusCollection','BlockCollection','ChartCollection']);
var moment = require('moment');
var numeral = require('numeral');

exports.pospow = function(req,res) {
    
    
    db.ChartCollection.find({_id:"pospow"},function(err,doc){
        
        
        res.send(doc[0]);
        
        
        
        
    });   
};
exports.diff = function(req,res) {
    
    
    db.ChartCollection.find({_id:"diff"},function(err,doc){
        
        
        res.send(doc[0].pos);
        
        
        
        
    });   
};
exports.size = function(req,res) {
    
    
    db.ChartCollection.find({_id:"size"},function(err,doc){
        
        
        res.send(doc[0]);
        
        
        
        
    });   
};
exports.numTrans = function(req,res) {
    
    
    db.ChartCollection.find({_id:"numtrans"},function(err,doc){
        
        
        res.send(doc[0]);
        
        
        
        
    });   
};
exports.orphan = function(req,res) {
    
    
    db.ChartCollection.find({_id:"orphan"},function(err,doc){
        
        
        res.send(doc[0]);
        
        
        
        
    });   
};
exports.solvedBy = function(req,res) {
    
function compressArray(original) {
    var compressed = [];
    // make a copy of the input array
    var copy = original.slice(0);
    // first loop goes over every element
    for (var i = 0; i < original.length; i++) {
    var myCount = 0;	
    // loop over every element in the copy and see if it's the same
    for (var w = 0; w < copy.length; w++) {
    if (original[i] == copy[w]) {
    // increase amount of times duplicate is found
    myCount++;
    // sets item to undefined
    delete copy[w];
    }
    }
    if (myCount > 0) {
    var a = [];
    a.push(original[i]);
    a.push((myCount/original.length)*100);
    compressed.push(a);
    }
    }
    return compressed;
};
    
    
    
    
   var date = parseInt(((new Date).getTime())/1000); 
        var oneDay = date - 86400;
        
        //var oneDay = 1410445410 - 86400;//this is for testing
    db.BlockCollection.find({'blockTimeStamp':{"$gte":oneDay}},function(err,docOD){
        
        
        var dayBlocks = docOD.length, //~144 blocks
            addresses = [];
        for(var f=0; f<dayBlocks; f++){
            
            var solver = docOD[f].blockSolvedBy;
            addresses.push(solver);
      
        }//for loop one day
        
        var fi = compressArray(addresses);
        res.send(fi);
        
        
        
    });
          
};