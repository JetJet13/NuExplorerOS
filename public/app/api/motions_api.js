var db = require('./api.tools.js').db;
var moment = require('./api.tools.js').moment;
var numeral = require('./api.tools.js').numeral;
var appear = require('./api.tools.js').appear;

exports.allMotions = function(req,res){
    
    var Motions = [];
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
             var motionVotes = [];
             for (var e=0;e<hundredblocks;e++){
                 
                 var blockVotes = docBlock[e]["blockVotes"]["motionHashVote"].length;
                 for (var o=0;o<blockVotes;o++){
                     
                     motionVotes.push(docBlock[e]["blockVotes"]["motionHashVote"][o]);                   
                     
                 }
                 
                 
             }
             
             
         }
    
        
        db.MotionCollection.find({}).sort({"num_votes":-1},function(err, doc){ 

            
 
           if (doc.length === 0){
                res.send({exists:false});

                }
                else{ 
                    
                    var numCustodians = doc.length;
                    
                    for(var d=0; d<numCustodians; d++){
                    
                    
                        var firstSeen = doc[d].block
                        ,    sinceSeen = count - firstSeen
                        ,    numVotes = doc[d].num_votes
                        ,    hash = doc[d]._id
                        ,    CDD = doc[d].CDD
                        ,    latestVote = doc[d].latest_block
                        ,    passed = doc[d].mo_details.passed
                        ,    url = doc[d].url;
                        
                        if (passed ==="false"){
                        
                        
                            var moto = {
                            
                                "hash":hash,
                                "numVotes":numVotes,
                                "firstSeen":firstSeen,
                                "sinceSeen":sinceSeen,
                                "voteCDD":CDD,
                                "totalCDD":totalCDD,
                                "latestVote":count-latestVote,
                                "url":url,
                                "lasthundred":appear(motionVotes,hash)
                        
                        
                        };
                            
                            Motions.push(moto);
                            
                        }
                        
                        
                                     
                        
                        
                        
                    }
                res.send(Motions); 

                }

        }); //motion collection find
    });//block collection find
    });//status collection find
    
    

};
//-------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------ALL SUCCESS MOTIONS-----------------------------------------------------------------
exports.allSuccessMotions = function(req,res){
    
    var Motions = [];
    db.StatusCollection.find({'_id':'statusInfo'},function(err,docStatus){
    
        var count =  docStatus[0].BlockCount,
            totalCDD = docStatus[0].tenK_CDD;
        
        db.MotionCollection.find({}).sort({"mo_details.blockHeight":-1},function(err, doc){ 

            
 
           if (doc.length === 0){
                res.send({exists:false});

                }
                else{ 
                    
                    var numCustodians = doc.length;
                    
                    for(var d=0; d<numCustodians; d++){
                    
                    
                        var firstSeen = doc[d].block
                        ,    sinceSeen = count - firstSeen
                        ,    numVotes = doc[d].num_votes                       
                        ,    url = doc[d].url
                        ,    hash = doc[d]._id
                        ,    CDD = doc[d].CDD
                        ,    latestVote = doc[d].latest_block
                        ,    passed = doc[d].mo_details.passed                       
                        ,    blockHeight = doc[d].mo_details.blockHeight
                        
                        if (passed ==="true"){
                 
                       
                        
                        
                            
                             var moto = {
                            
                                "hash":hash,
                                "firstSeen":firstSeen,
                                "numVotes":numVotes,
                                "blockHeight":blockHeight,
                                "url":url
                        
                        
                        };
                            
                            Motions.push(moto);
                            
                        
                             
                        
                           
                            
                        }
                        
                        
                                     
                        
                        
                        
                    }
                 
                            res.send(Motions);
                }

        });
    
    });
    
    

};

//-------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------ALL BLOCK VOTES MOTIONS-------------------------------------------------------------

exports.allBlockVotesMotions = function(req,res){
    
    var moto_hash = req.params.mo_id;
    
    var pageId = req.params.page_id;
if (( pageId % 1 )!==0){
    
    res.send({exists:false});
}
else{
    
    db.MotionCollection.find({"_id":moto_hash},function(err,custDoc){
        if (err !==null){
            console.log(err);
        }
        else{
            
       console.log(custDoc);
        var tot_numVotes = custDoc[0].total_votes;    
        var end = 20*(parseInt(pageId));
        var start = 20*(parseInt(pageId)-1);
        var howNum = tot_numVotes - (20*parseInt(pageId) );
        var searchy = {"$gte":howNum}
        if (howNum < 0){
        
        howNum  = 20 + howNum;
        searchy = "lastpage";
        
        
        }
    
    db.BlockCollection.find({"blockVotes.motionHashVote":{"$in":[moto_hash]}}).sort({"blockHeight":-1},function(err,doc){
        
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
     }//else for error if/else statement in votes
     });//vote collection find 
    
    
}//else  
    
};





