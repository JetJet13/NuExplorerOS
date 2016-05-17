var db = require('./api.tools.js').db;
var moment = require('./api.tools.js').moment;
var numeral = require('./api.tools.js').numeral;
var appear = require('./api.tools.js').appear;



exports.allCustodians = function(req,res){
    
    var Custodians = [];
    db.StatusCollection.find({'_id':'statusInfo'},function(err,docStatus){
    
        var count =  docStatus[0].BlockCount,
            totalCDD = docStatus[0].tenK_CDD;
        
        
        
        db.BlockCollection.find({'blockHeight':{"$gte":count-100} }).sort({"blockHeight":1}, function(BCerr,docBlock){
         
         if (BCerr !== null){
             console.log(BCerr);
             res.send({exists:false});
         }
         else{
             
             var hundredblocks = docBlock.length;
             var custoVotes = [];
             for (var e=0;e<hundredblocks;e++){
                 
                 var blockVotes = docBlock[e]["blockVotes"]["custodianVotes"].length;
                 for (var o=0;o<blockVotes;o++){
                     
                     var custoAddress = docBlock[e]["blockVotes"]["custodianVotes"][o]["address"];
                     var custoAmount  = docBlock[e]["blockVotes"]["custodianVotes"][o]["amount"]*10000
                     var custoId = custoAddress + custoAmount.toString();
                     custoVotes.push(custoId);                   
                     
                 }
                 
                 
             }
             
             
         }
        
        db.VoteCollection.find({}).sort({"num_votes":-1},function(err, doc){ 

            
 
           if (doc.length === 0){
                res.send({exists:false});

                }
                else{ 
                    
                    var numCustodians = doc.length;
                    
                    for(var d=0; d<numCustodians; d++){
                    
                        var firstSeen = doc[d].block
                        ,    sinceSeen = count - firstSeen
                        ,    numVotes = doc[d].num_votes
                        ,    amount = doc[d].amount//don't forget to divide by 10,000
                        ,    timeStamp =doc[d].timeStamp
                        ,    address = doc[d].address
                        ,    CDD = doc[d].CDD
                        ,    latestVote = doc[d].latestblock
                        ,    passed = doc[d].cust_details.passed
                        ,    url = doc[d].url;
                        
                        if (address.charAt(0) === 'S'){
                            var type = "NSR";
                        }
                        else{
                            var type = "NBT";
                        }
                        if (passed ==="false"){
                        
                        
                            var custo = {
                            
                                "address":address,
                                "type":type,
                                "amount":amount/10000,
                                "timeStamp":timeStamp*1000,
                                "numVotes":numVotes,
                                "firstSeen":firstSeen,
                                "sinceSeen":sinceSeen,
                                "voteCDD":CDD,
                                "totalCDD":totalCDD,
                                "latestVote":count-latestVote,
                                "url":url,
                                "type":type,
                                "lasthundred":appear(custoVotes,address+amount.toString())
                                
                        
                        
                        };
                            
                            Custodians.push(custo);
                            
                        }
                        
                        
                                     
                        
                        
                        
                    }
                res.send(Custodians); 

                }

        });//vote collection find
    
        });//block collection find
    });//status collection find
    
    

};
//-------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------ALL SUCCESS CUSTODIANS-----------------------------------------------------------------
exports.allSuccessCustodians = function(req,res){
    
    var Custodians = [];
    db.StatusCollection.find({'_id':'statusInfo'},function(err,docStatus){
    
        var count =  docStatus[0].BlockCount,
            totalCDD = docStatus[0].tenK_CDD;
        
        db.VoteCollection.find({}).sort({"cust_details.blockHeight":-1},function(err, doc){ 

            
 
           if (doc.length === 0){
                res.send({exists:false});

                }
                else{ 
                    
                    var numCustodians = doc.length;
                    
                    for(var d=0; d<numCustodians; d++){
                    
                    
                        var firstSeen = doc[d].block
                        ,    sinceSeen = count - firstSeen
                        ,    numVotes = doc[d].num_votes
                        ,    amount = doc[d].amount/10000
                        ,    timeStamp =doc[d].timeStamp
                        ,    address = doc[d].address
                        ,    CDD = doc[d].CDD
                        ,    latestVote = doc[d].latestblock
                        ,    passed = doc[d].cust_details.passed
                        ,    tx_id = doc[d].cust_details.tx_id
                        ,    blockHeight = doc[d].cust_details.blockHeight
                        ,    url = doc[d].url;
                        if (address.charAt(0) === 'S'){
                            var type = "NSR";
                        }
                        else{
                            var type = "NBT";
                        }
                        if (passed ==="true"){
                 
                       
                        
                        
                            
                             var custo = {
                            
                                "address":address,
                                "type":type,
                                "amount":amount,
                                "firstSeen":firstSeen,
                                "timeStamp":timeStamp*1000,
                                "numVotes":numVotes,
                                "tx_id":tx_id,
                                "blockHeight":blockHeight,
                                "url":url
                        
                        
                        };
                            
                            Custodians.push(custo);
                            
                        
                             
                        
                           
                            
                        }
                        
                        
                                     
                        
                        
                        
                    }
                 
                            res.send(Custodians);
                }

        });
    
    });
    
    

};

//-------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------ALL BLOCK VOTES CUSTODIANS-------------------------------------------------------------

exports.allBlockVotesCustodians = function(req,res){
    
    var cust_address = req.params.cust_id;
    var pageId = req.params.page_id;
if (( pageId % 1 )!==0){
    
    res.send({exists:false});
}
else{
    
    db.VoteCollection.find({"address":cust_address},function(err,custDoc){
        
  
        var tot_numVotes = custDoc[0].total_votes;
    
        var end = 20*(parseInt(pageId));
        var start = 20*(parseInt(pageId)-1);
        var howNum = tot_numVotes - (20*parseInt(pageId) );
        var searchy = {"$gte":howNum}
        if (howNum < 0){
            howNum  = 20 + howNum;
            searchy = "lastpage";
        }
    
    db.BlockCollection.find({"blockCustodianVotes":{"$in":[cust_address]}}).sort({"blockHeight":-1},function(err,doc){
        
        var blocks = [];
        
        var doc_len = doc.length;
        if (searchy === "lastpage"){
            start   = doc_len - howNum;
            end     = doc_len; 
        }
        for(var d=start;d<end;d++){
            
            var bHeight = doc[d].blockHeight,
                bTimeStamp = doc[d].blockTimeStamp,
                bCDD = parseInt(doc[d].blockCDD),
                bSolvedBy = doc[d].blockSolvedBy;
            
            var block_info = {
                    num_blocks:tot_numVotes,
                    bHeight:bHeight,
                    bTimeStamp:moment.unix(bTimeStamp).format(" D MMM YYYY  HH:mm:ss"),
                    bCDD:bCDD,
                    bSolvedBy:bSolvedBy
                
                                };
            
            blocks.push(block_info);
            
            
            
            
            
            
        }
        res.send(blocks);        
    });//block collection find
    
     });//vote collection find 
    
    
}//else  
    
};





