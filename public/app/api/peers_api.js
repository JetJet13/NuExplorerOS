var db = require('mongojs').connect('mongodb://<username>:<password>@127.0.0.1:27017/BlockDB',['BlockCollection','PeerCollection','StatusCollection','TxCollection']);
var moment = require('moment');
var numeral = require('numeral');



//-------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------ALL PEERS------------------------------------------------------------------------------

exports.allPeers = function(req,res){
        
    var pageId = req.params.page_id;
if (( pageId % 1 )!==0){
    
    res.send({exists:false});
}
else{
    
    db.PeerCollection.runCommand('count',function(err,county){
        if (err !==null){
            console.log(err);
        }
        else{
            
       
        var tot_numPeers = county.n;
    
        var end = 20*(parseInt(pageId));
        var start = 20*(parseInt(pageId)-1);
        var howNum = tot_numPeers - (20*parseInt(pageId) );
        
        if (howNum < 0){
            howNum = 20 + howNum; 
            
            start=tot_numPeers - howNum;
            end = tot_numPeers;
        }
    db.PeerCollection.find({}).sort({'lastsend':-1},function(error,peerDoc){
        // PAGING script is not working as planned, crashes when you get to the end of the peers.
         if (error !==null){
            console.log(err);
        }
        else{
            var pInfo = [];
            for(var b=start;b<end;b++){
                console.log(b,peerDoc[b].height);
                pInfo.push(peerDoc[b]);
            }
        res.send({"numPeers":tot_numPeers,"info":pInfo})
        }
        
        
        });            
            
     }//else for error if/else statement in votes
     });//peer collection count 
    
    
}//else  
    
};





