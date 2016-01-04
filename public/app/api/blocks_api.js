var db = require('mongojs').connect('mongodb://<username>:<password>@127.0.0.1:27017/BlockDB',['BlockCollection','TxCollection','OrphanBlockCollection','OrphanTxCollection']);
var moment = require('moment');
var numeral = require('numeral');

function showLocalDate(timestamp){
  var mmToMonth = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
  var dt = new Date(timestamp * 1000);
  var mm = mmToMonth[dt.getMonth()];
  var min = dt.getMinutes();
if(parseInt(min) < 10){

    var minuto = "0"+min;
}
else{

    var minuto = min;
}
    
  return dt.getDate()+" "+mm+" "+dt.getFullYear()+" "+dt.getHours()+":"+minuto;
};
//--------------------------------------------------------EXISTS BY ID API------------------------------------------------------------------------
exports.existsById = function(req,res){ 

var blockId = req.params.block_id;
   
if(blockId.length===64){ // its a block hash, search by _id 
   

   var query = {_id:blockId};
  
   
}
else if(blockId.length <= 10){ // if not, search by block height
   

    var query = {blockHeight:parseInt(blockId)};
 
}

db.BlockCollection.find(query,function(err, doc){ 


   if (doc.length === 0){
       
db.OrphanBlockCollection.find(query,function(err, docO){
    
    if (docO.length === 0){
        res.send({exists:false});    
    }
    else{
        res.send({exists:true,orphan:true});
    }
    
});
        

        }
        else{ 
        
       res.send({exists:true,orphan:false});
       
        }

}); 
    




};

//---------------------------------------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------BLOCK DETAILS API------------------------------------------------------------------------

exports.blockDetails = function(req,res){ 
var query = {blockHeight:1}
var blockId = req.params.block_id;
var pageId = req.params.page_id;
pageId = parseFloat(pageId.replace("/,/g",""));
if((pageId % 1)!==0 || pageId===0){
    
    res.send({exists:false});
    
}

if(blockId.length===64){ // its a block hash, search by _id 
   

  query = {_id:blockId};
  
   
}
else if(!isNaN(blockId)){ // if not, search by block height
   
    blockId = parseFloat(blockId.replace("/,/g",""));
    blockId = parseInt(blockId.toFixed());
    
    query = {blockHeight:blockId};
 
}
else{
    
  
res.send({exists:false});    
   
}
db.BlockCollection.find(query,function(err, docBlock){ 

   if(docBlock.length===0){
       
   res.send({exists:false});
   
   }
  else{
  var totalBlock = 0,
      totFees = 0,
      totalCDD = 0,
      bReward = 0,
      bNxtHash;

  var bHash = docBlock[0].blockHash,
      bHeight = docBlock[0].blockHeight,
      bSize = docBlock[0].blockSize,
      bPrevHash = docBlock[0].blockPrevHash,
      bDifficulty = docBlock[0].blockDifficulty,
      bVer = docBlock[0].blockVer,
      bNumTrans = docBlock[0].blockNumTrans,
      bMrkRoot = docBlock[0].blockMrkRoot,
      bBits = docBlock[0].blockBits,
      bTimeStampUnix = docBlock[0].blockTimeStamp,      
      bNonce = docBlock[0].blockNonce,
      bTotRec = docBlock[0].blockTotRec,
      bTotRecBits = docBlock[0].blockTotRecBits,
      bMoHash = docBlock[0].blockVotes.motionHashVote,
      bSolvedBy = docBlock[0].blockSolvedBy,
      bVotes = docBlock[0].blockVotes,
      bCustVotes = bVotes.custodianVotes,
      bParkVotes = bVotes.parkRateVotes,
      bChain = docBlock[0].chain;
      

      
 var pages = Math.ceil(bNumTrans/20);
                   
      if (bNonce===0){
      var bType = "Proof -of- Stake";
      }
      else{ 
      var bType = "Proof -of- Work";
      
      }
      if(pageId > pages){
          
              res.send({exists:false});
          
      }
      else{
          
              if (bNumTrans<=20 || pageId===1){

                    var  numPages=0;
              }
             else {

                    var numPages = 20*(pageId-1);
              }
          
      }
  
db.BlockCollection.find({'blockHeight':bHeight+1},function(err, docNxt){ 
    
    if(docNxt.length===0){
        
        bNxtHash="";
    }
    else{
  bNxtHash = docNxt[0]._id;
    }

db.BlockCollection.runCommand('count', function(err, count) {
    var bConf = numeral(count.n+1 - bHeight).format('0,0.[000000]');
    var bConfInt = count.n+1 - bHeight;
    
      
  var Block = { exists:true,
                bHash:bHash,
                bHeightInt: bHeight,
                bHeight: numeral(bHeight).format('0,0.[000000]'),
                bSizeInt:bSize, 
                bSize:  numeral(bSize).format('0,0.[000]'),
                bPrevHash:bPrevHash,
                bNxtHash:bNxtHash,
                bMrkRoot:bMrkRoot,
                bTimeStampUnix: bTimeStampUnix,
                bTimeStamp:moment.unix(bTimeStampUnix).format(" D MMM YYYY  HH:mm:ss"), 
                bConfInt:bConfInt,
                bConf: bConf,
                bType: bType,
                bBitsInt: bBits,
                bBits: numeral(bBits).format('0,0'), 
                bDifficultyInt: bDifficulty,
                bDifficulty: numeral(bDifficulty).format('0,0.[0000]'), 
                bVer:bVer, 
                bNonceInt:bNonce,
                bNonce: numeral(bNonce).format('0,0'),
                bNumTransInt: bNumTrans,
                bNumTrans: numeral(bNumTrans).format('0,0.[000000]'), 
                bMoHash: bMoHash,
                bSolvedBy:bSolvedBy,
                bCust:bCustVotes,
                bPRates:bParkVotes,
                bChain:bChain,
                tx:[] 
            };
    
      
db.TxCollection.find({'forBlock':bHeight}).sort( { "TXdetails.tx_num" : 1 },function(err, docTx){ 


var noTrans = docTx.length; //number of trans. in block
for (var r=0;r<noTrans;r++){ //for each tx. in block 
    
    var chain = docTx[r].chain;

if(chain === 'main'){
    
    var  fee = 0,
         totIn = 0,
         totOut = 0,            
         totCDD = 0,
         txHash = docTx[r]._id,
         curTimeStamp = docTx[r].TXdetails.tx_timeStamp,        
         inCountInt = docTx[r].TXdetails.inCount,        
         outCountInt = docTx[r].TXdetails.outCount;
         

   
      
   
    for(var i =0; i<inCountInt ; i++){
    
    var cdd = 0;
    var prevTimeStamp =  docTx[r].TXinputs[i].prevOut.prevTimeStamp,
        txIndex = docTx[r].TXinputs[i].prevOut.index;
      
        
        
        if(txIndex<0){ //coinbase Transactions
        
            inTx = "Coinbase";    
          
        }
        else{ //regular transactions (this includes PoS Transactions)
        
       
            
                var inputVal     = docTx[r].TXinputs[i].inputs.inVal ;               
                totIn        = totIn + inputVal;
                //LET'S GET CDD...
                var step0 = curTimeStamp - prevTimeStamp;
                if(step0>7776000){ //if the input has been sitting for more than 90 days...we use 90days worth of coin days...because of the limiter
                
                    cdd = 90*inputVal;
                
                }
                else{ //if the input has been sitting for less than 90 days...we use the accumulated amount of coin days
                
                    cdd = (step0/86400)*inputVal;
                
                }
                
                totCDD = totCDD + cdd; 
                
                
                 
        
        }
        
        
        
    }//for inCount
    for(var o = 0; o<outCountInt; o++){ 
        
        var getOut = docTx[r].TXoutputs[o],            
            outputVal = getOut.outVal;        
            totOut = totOut + outputVal;
            
             
        
        
        
        
        
      
    }//for outCount
    totalCDD = totalCDD + totCDD;
    fee = totIn - totOut;
    if(fee<=0){ 
    
        var reward = fee*-1;

            fee = 0;
            totFees = totFees + fee;
        totalBlock = totalBlock + reward;
           bRewardInt = parseFloat(reward.toFixed(6));        
           bReward = numeral(reward).format('0,0.[000000]');    
        

    
    }
    else{ 
        
        totalBlock = totalBlock + totOut;
        totFees = totFees + fee;
        

    
    }
    
}//if chain === 'main'     
        }//for noTrans
    
       Block.bRewardInt = bRewardInt;
       Block.bReward = bReward; 
       
       Block.totBlockInt = parseFloat(bTotRec.toFixed(6));
       Block.totBlock = numeral(bTotRec).format('0,0.[000000]');
    
       Block.totBlockBitsInt = parseFloat(bTotRecBits.toFixed(6));
       Block.totBlockBits = numeral(bTotRecBits).format('0,0.[000000]');
       
       Block.totCDDInt = parseFloat(totalCDD.toFixed(6));
       Block.totCDD = numeral(totalCDD).format('0,0.[000000]');
       
       Block.totFeeInt = parseFloat(totFees.toFixed(6));
       Block.totFee   = numeral(totFees).format('0,0.[000000]');
       
      
       
      

db.TxCollection.find({"$and":[ {'forBlock':bHeight} , {'TXdetails.tx_num':{ "$gte": numPages }} ] }).sort( { "TXdetails.tx_num" : 1 }).limit(20,function(err, docTx){ 


var noTrans = docTx.length; //number of trans. in block
for (var r=0;r<noTrans;r++){ //for each tx. in block 
    
    var chain = docTx[r].chain;

if(chain === 'main'){

    
    var  fee = 0,
         totIn = 0,
         totOut = 0,            
         totCDD = 0,
         txHash = docTx[r]._id,
         curTimeStamp = docTx[r].TXdetails.tx_timeStamp,
         txTimeStamp = moment.unix(docTx[r].TXdetails.tx_timeStamp).format(" D MMM YYYY  HH:mm:ss"),
         inCount = numeral(docTx[r].TXdetails.inCount).format('0,0.[000000]'),
         inCountInt = docTx[r].TXdetails.inCount,
         outCount = numeral(docTx[r].TXdetails.outCount).format('0,0.[000000]'),
         outCountInt = docTx[r].TXdetails.outCount,
         txNum = docTx[r].TXdetails.tx_num,
         txType = docTx[r].tx_type;
         if (txType === "53"){
         
             var transType = "NSR";
         }
         else{
         
            var transType = "NBT";
         
         }
   
     var  Trans = {
                    txHash:txHash,
                    txTimeStampUnix: curTimeStamp,
                    txTimeStamp:txTimeStamp, 
                    inCount:inCount,
                    inCountInt:inCountInt,
                    outCount:outCount,
                    outCountInt:outCountInt,
                    tx_num:txNum,
                    tx_Type:transType,
                    inputs:[], 
                    outputs:[] 
                    
                };       
   
    for(var i =0; i<inCountInt ; i++){
    
    var cdd = 0;
    var inTx = docTx[r].TXinputs[i].prevOut.inTx,
        txIndex = docTx[r].TXinputs[i].prevOut.index,
        prevTimeStamp =  docTx[r].TXinputs[i].prevOut.prevTimeStamp,
        inputNum = docTx[r].TXinputs[i].inputs.in_num;
        
        
        if(txIndex<0){ //coinbase Transactions
        
            inTx = "Coinbase"
   
            var Inputs = { 
                            inAddress:inTx, 
                            inValInt:0, 
                            inVal:"0", 
                            in_num:inputNum
                         };
            
            Trans.inputs.push(Inputs);
        }
        else{ //regular transactions (this includes PoS Transactions)
        
       
            var inputAddress = docTx[r].TXinputs[i].inputs.Address ,
                inScript     = docTx[r].TXinputs[i].inputs.inScript, 
                inputVal     = docTx[r].TXinputs[i].inputs.inVal ;               
                totIn        = totIn + inputVal;
                //LET'S GET CDD...
                var step0 = curTimeStamp - prevTimeStamp;
                if(step0>7776000){ //if the input has been sitting for more than 90 days...we use 90days worth of coin days...because of the cap
                
                    cdd = 90*inputVal;
                
                }
                else{ //if the input has been sitting for less than 90 days...we use the accumulated amount of coin days
                
                    cdd = (step0/86400)*inputVal;
                
                }
                
                totCDD = totCDD + cdd   
            console.log("Johny "+numeral(0).format('0,0.[000000]'));
            console.log("Georges "+typeof(inputVal)); 
            var Inputs       = { 
                                prevTx: inTx,
                                inScript:inScript,
                                inAddress:inputAddress,
                                inValInt:inputVal,
                                inVal : numeral(inputVal).format('0,0.[000000]'),
                                in_num:inputNum
                               };
                
                
                 
         Trans.inputs.push(Inputs);
        }
        
        
        
    }//for inCount
    for(var o = 0; o<outCountInt; o++){ 
        
        var getOut = docTx[r].TXoutputs[o],
            outputAddress = getOut.Address,
            outputVal = getOut.outVal,
            outputNum = getOut.out_num,
            outputStatus = getOut.status,
            outputTxSpent = getOut.txSpent;
            totOut = totOut + outputVal;
            
        
           
        var Outputs = {outAddress: outputAddress,
                       outValInt: outputVal,
                       outVal: numeral(outputVal).format('0,0.[000000]'), 
                       out_num:outputNum,
                       status:outputStatus,
                       txSpent: outputTxSpent
                      };
        
        Trans.outputs.push(Outputs);
    }//for outCount

    fee = totIn - totOut;
    if(fee<0){ 
    
        var reward = fee*-1;
            totIn = reward;
            totOut = reward;
            fee = 0;
         
        
        bRewardInt = parseFloat(reward.toFixed(6));        
        bReward = numeral(reward).format('0,0.[000000]');    
        
        Trans.totInInt = parseFloat(totIn.toFixed(6))
        Trans.totIn  = numeral(totIn).format('0,0.[000000]');
        
        Trans.totOutInt =parseFloat(totOut.toFixed(6))
        Trans.totOut = numeral(totOut).format('0,0.[000000]');
        
        Trans.totCDDInt = parseFloat(totCDD.toFixed(6))
        Trans.totCDD = numeral(totCDD).format('0,0.[000000]');
        
        Trans.feeInt = parseFloat(fee.toFixed(6))
        Trans.fee    = numeral(fee).format('0,0.[000000]');
    
    }
    else{ 
        
     
        
       
        Trans.totInInt = parseFloat(totIn.toFixed(6))
        Trans.totIn  = numeral(totIn).format('0,0.[000000]');
        
        Trans.totOutInt =parseFloat(totOut.toFixed(6))
        Trans.totOut = numeral(totOut).format('0,0.[000000]');
        
        Trans.totCDDInt = parseFloat(totCDD.toFixed(6))
        Trans.totCDD = numeral(totCDD).format('0,0.[000000]');
        
        Trans.feeInt = parseFloat(fee.toFixed(6))
        Trans.fee    = numeral(fee).format('0,0.[000000]');
        
    
    }
    
    
    
    Block.tx.push(Trans);
    
}// is chain === 'main'   
        }//for noTrans
    
       
       res.send(Block); 
       
       }); 
     });
 
    }); 
    
     });
    
  
  }
   
  });  


}

//---------------------------------------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------ORPHAN BLOCK DETAILS API--------------------------------------------------------------------

exports.orphanblockDetails = function(req,res){ 
var query = {blockHeight:1}
var blockId = req.params.block_id;
var pageId = req.params.page_id;
pageId = parseFloat(pageId.replace("/,/g",""));
if((pageId % 1)!==0 || pageId===0){
    
    res.send({exists:false});
    
}

if(blockId.length===64){ // its a block hash, search by _id 
   

  query = {_id:blockId};
  
   
}
else if(!isNaN(blockId)){ // if not, search by block height
   
    blockId = parseFloat(blockId.replace("/,/g",""));
    blockId = parseInt(blockId.toFixed());
    
    query = {blockHeight:blockId};
 
}
else{
    
  
res.send({exists:false});    
   
}
db.OrphanBlockCollection.find(query,function(err, docBlock){ 

   if(docBlock.length===0){
       
   res.send({exists:false});
   
   }
  else{
  var totalBlock = 0,
      totFees = 0,
      totalCDD = 0,
      bReward = 0,
      bRewardInt = 0,
      bNxtHash;

  var bHash = docBlock[0].blockHash,
      bHeight = docBlock[0].blockHeight,
      bSize = docBlock[0].blockSize,
      bPrevHash = docBlock[0].blockPrevHash,
      bDifficulty = docBlock[0].blockDifficulty,
      bVer = docBlock[0].blockVer,
      bNumTrans = docBlock[0].blockNumTrans,
      bMrkRoot = docBlock[0].blockMrkRoot,
      bBits = docBlock[0].blockBits,
      bTimeStampUnix = docBlock[0].blockTimeStamp,      
      bNonce = docBlock[0].blockNonce,
      bTotRec = docBlock[0].blockTotRec,
      bTotRecBits = docBlock[0].blockTotRecBits,
      bMoHash = docBlock[0].blockVotes.motionHashVote,
      bSolvedBy = docBlock[0].blockSolvedBy,
      bVotes = docBlock[0].blockVotes,
      bCustVotes = bVotes.custodianVotes,
      bParkVotes = bVotes.parkRateVotes,
      bChain = docBlock[0].chain;
      

      
 var pages = Math.ceil(bNumTrans/20);
                   
      if (bNonce===0){
      var bType = "Proof -of- Stake";
      }
      else{ 
      var bType = "Proof -of- Work";
      
      }
      if(pageId > pages){
          
              res.send({exists:false});
          
      }
      else{
          
              if (bNumTrans<=20 || pageId===1){

                    var  numPages=0;
              }
             else {

                    var numPages = 20*(pageId-1);
              }
          
      }

db.OrphanBlockCollection.find({'_id':bPrevHash},function(err, docNxt){ 
    
    if(docNxt.length===0){        
        var wPrevHash="main";
        
    }
    else{
        var wPrevHash="orphan";
        
    }      
      
db.OrphanBlockCollection.find({'blockHeight':bHeight+1},function(err, docNxt){ 
    
    if(docNxt.length===0){        
        bNxtHash="";
        
    }
    else{
  bNxtHash = docNxt[0]._id;
        
    }

db.OrphanBlockCollection.runCommand('count', function(err, count) {
    //var bConf = numeral(count.n - bHeight).format('0,0.[000000]');
    //var bConfInt = count.n - bHeight;
    var bConf = '0';
    var bConfInt = 0;
      
  var Block = { exists:true,
                bHash:bHash,
                bHeightInt: bHeight,
                bHeight: numeral(bHeight).format('0,0.[000000]'),
                bSizeInt:bSize, 
                bSize:  numeral(bSize).format('0,0.[000]'),
                bPrevHash:bPrevHash,
                wPrevHash:wPrevHash,
                bNxtHash:bNxtHash,
                bMrkRoot:bMrkRoot,
                bTimeStampUnix: bTimeStampUnix,
                bTimeStamp:moment.unix(bTimeStampUnix).format(" D MMM YYYY  HH:mm:ss"), 
                bConfInt:bConfInt,
                bConf: bConf,
                bType: bType,
                bBitsInt: bBits,
                bBits: numeral(bBits).format('0,0'), 
                bDifficultyInt: bDifficulty,
                bDifficulty: numeral(bDifficulty).format('0,0.[0000]'), 
                bVer:bVer, 
                bNonceInt:bNonce,
                bNonce: numeral(bNonce).format('0,0'),
                bNumTransInt: bNumTrans,
                bNumTrans: numeral(bNumTrans).format('0,0.[000000]'), 
                bMoHash: bMoHash,
                bSolvedBy:bSolvedBy,
                bCust:bCustVotes,
                bPRates:bParkVotes,
                bChain:bChain,
                tx:[] 
            };
    
      
db.OrphanTxCollection.find({'blockHash':bHash}).sort( { "TXdetails.tx_num" : 1 },function(err, docTx){ 


var noTrans = docTx.length; //number of trans. in block
for (var r=0;r<noTrans;r++){ //for each tx. in block 
    
    var chain = docTx[r].chain;
//if(chain === "orphan"){
    

    var  fee = 0,
         totIn = 0,
         totOut = 0,            
         totCDD = 0,
         txHash = docTx[r]._id,
         curTimeStamp = docTx[r].TXdetails.tx_timeStamp,        
         inCountInt = docTx[r].TXdetails.inCount,        
         outCountInt = docTx[r].TXdetails.outCount;
         

   
      
   
    for(var i =0; i<inCountInt ; i++){
    
    var cdd = 0;
    var prevTimeStamp =  docTx[r].TXinputs[i].prevOut.prevTimeStamp,
        txIndex = docTx[r].TXinputs[i].prevOut.index;
      
        
        
        if(txIndex<0){ //coinbase Transactions
        
            inTx = "Coinbase";    
          
        }
        else{ //regular transactions (this includes PoS Transactions)
        
       
            
                var inputVal     = docTx[r].TXinputs[i].inputs.inVal ;               
                totIn        = totIn + inputVal;
                //LET'S GET CDD...
                var step0 = curTimeStamp - prevTimeStamp;
                if(step0>7776000){ //if the input has been sitting for more than 90 days...we use 90days worth of coin days...because of the limiter
                
                    cdd = 90*inputVal;
                
                }
                else{ //if the input has been sitting for less than 90 days...we use the accumulated amount of coin days
                
                    cdd = (step0/86400)*inputVal;
                
                }
                
                totCDD = totCDD + cdd; 
                
                
                 
        
        }
        
        
        
    }//for inCount
    for(var o = 0; o<outCountInt; o++){ 
        
        var getOut = docTx[r].TXoutputs[o],            
            outputVal = getOut.outVal;        
            totOut = totOut + outputVal;
            
             
        
        
        
        
        
      
    }//for outCount
    totalCDD = totalCDD + totCDD;
    fee = totIn - totOut;
    if(fee<=0){ 
    
        var reward = fee*-1;

            fee = 0;
            totFees = totFees + fee;
        totalBlock = totalBlock + reward;
           bRewardInt = parseFloat(reward.toFixed(6));        
           bReward = numeral(reward).format('0,0.[000000]');    
        

    
    }
    else{ 
        
        totalBlock = totalBlock + totOut;
        totFees = totFees + fee;
        

    
    }
    
//}//if chain === 'orphan'
          
        }//for noTrans
    
       Block.bRewardInt = bRewardInt;
       Block.bReward = bReward; 
       
       Block.totBlockInt = parseFloat(bTotRec.toFixed(6));
       Block.totBlock = numeral(bTotRec).format('0,0.[000000]');
    
       Block.totBlockBitsInt = parseFloat(bTotRecBits.toFixed(6));
       Block.totBlockBits = numeral(bTotRecBits).format('0,0.[000000]');
       
       Block.totCDDInt = parseFloat(totalCDD.toFixed(6));
       Block.totCDD = numeral(totalCDD).format('0,0.[000000]');
       
       Block.totFeeInt = parseFloat(totFees.toFixed(6));
       Block.totFee   = numeral(totFees).format('0,0.[000000]');
       
      
       
      

db.OrphanTxCollection.find({"$and":[ {'blockHash':bHash} , {'TXdetails.tx_num':{ "$gte": numPages }} ] }).sort( { "TXdetails.tx_num" : 1 }).limit(20,function(err, docTx){ 


var noTrans = docTx.length; //number of trans. in block
for (var r=0;r<noTrans;r++){ //for each tx. in block 
     
     var chain = docTx[r].chain;
    
if(chain === 'orphan'){            
    var  fee = 0,
         totIn = 0,
         totOut = 0,            
         totCDD = 0,
         txHash = docTx[r]._id,
         curTimeStamp = docTx[r].TXdetails.tx_timeStamp,
         txTimeStamp = moment.unix(docTx[r].TXdetails.tx_timeStamp).format(" D MMM YYYY  HH:mm:ss"),
         inCount = numeral(docTx[r].TXdetails.inCount).format('0,0.[000000]'),
         inCountInt = docTx[r].TXdetails.inCount,
         outCount = numeral(docTx[r].TXdetails.outCount).format('0,0.[000000]'),
         outCountInt = docTx[r].TXdetails.outCount,
         txNum = docTx[r].TXdetails.tx_num,
         txType = docTx[r].tx_type;
         if (txType === "53"){
         
             var transType = "NSR";
         }
         else{
         
            var transType = "NBT";
         
         }
   
     var  Trans = {
                    txHash:txHash,
                    txTimeStampUnix: curTimeStamp,
                    txTimeStamp:txTimeStamp, 
                    inCount:inCount,
                    inCountInt:inCountInt,
                    outCount:outCount,
                    outCountInt:outCountInt,
                    tx_num:txNum,
                    tx_Type:transType,
                    inputs:[], 
                    outputs:[] 
                    
                };       
   
    for(var i =0; i<inCountInt ; i++){
    
    var cdd = 0;
    var inTx = docTx[r].TXinputs[i].prevOut.inTx,
        txIndex = docTx[r].TXinputs[i].prevOut.index,
        prevTimeStamp =  docTx[r].TXinputs[i].prevOut.prevTimeStamp,
        inputNum = docTx[r].TXinputs[i].inputs.in_num;
        
        
        if(txIndex<0){ //coinbase Transactions
        
            inTx = "Coinbase"
   
            var Inputs = { 
                            inAddress:inTx, 
                            inValInt:0, 
                            inVal:"0", 
                            in_num:inputNum
                         };
            
            Trans.inputs.push(Inputs);
        }
        else{ //regular transactions (this includes PoS Transactions)
        
       
            var inputAddress = docTx[r].TXinputs[i].inputs.Address ,
                inScript     = docTx[r].TXinputs[i].inputs.inScript, 
                inputVal     = docTx[r].TXinputs[i].inputs.inVal ;               
                totIn        = totIn + inputVal;
                //LET'S GET CDD...
                var step0 = curTimeStamp - prevTimeStamp;
                if(step0>7776000){ //if the input has been sitting for more than 90 days...we use 90days worth of coin days...because of the cap
                
                    cdd = 90*inputVal;
                
                }
                else{ //if the input has been sitting for less than 90 days...we use the accumulated amount of coin days
                
                    cdd = (step0/86400)*inputVal;
                
                }
                
                totCDD = totCDD + cdd   
            
            var Inputs       = { 
                                prevTx: inTx,
                                inScript:inScript,
                                inAddress:inputAddress,
                                inValInt:inputVal,
                                inVal : numeral(inputVal).format('0,0.[000000]'),
                                in_num:inputNum
                               };
                
                
                 
         Trans.inputs.push(Inputs);
        }
        
        
        
    }//for inCount
    for(var o = 0; o<outCountInt; o++){ 
        
        var getOut = docTx[r].TXoutputs[o],
            outputAddress = getOut.Address,
            outputVal = getOut.outVal,
            outputNum = getOut.out_num,
            outputStatus = getOut.status,
            outputTxSpent = getOut.txSpent;
            totOut = totOut + outputVal;
            
        
           
        var Outputs = {outAddress: outputAddress,
                       outValInt: outputVal,
                       outVal: numeral(outputVal).format('0,0.[000000]'), 
                       out_num:outputNum,
                       status:outputStatus,
                       txSpent: outputTxSpent
                      };
        
        Trans.outputs.push(Outputs);
    }//for outCount

    fee = totIn - totOut;
    if(fee<0){ 
    
        var reward = fee*-1;
            totIn = reward;
            totOut = reward;
            fee = 0;
         
        
        bRewardInt = parseFloat(reward.toFixed(6));        
        bReward = numeral(reward).format('0,0.[000000]');    
        
        Trans.totInInt = parseFloat(totIn.toFixed(6))
        Trans.totIn  = numeral(totIn).format('0,0.[000000]');
        
        Trans.totOutInt =parseFloat(totOut.toFixed(6))
        Trans.totOut = numeral(totOut).format('0,0.[000000]');
        
        Trans.totCDDInt = parseFloat(totCDD.toFixed(6))
        Trans.totCDD = numeral(totCDD).format('0,0.[000000]');
        
        Trans.feeInt = parseFloat(fee.toFixed(6))
        Trans.fee    = numeral(fee).format('0,0.[000000]');
    
    }
    else{ 
        
     
        
       
        Trans.totInInt = parseFloat(totIn.toFixed(6))
        Trans.totIn  = numeral(totIn).format('0,0.[000000]');
        
        Trans.totOutInt =parseFloat(totOut.toFixed(6))
        Trans.totOut = numeral(totOut).format('0,0.[000000]');
        
        Trans.totCDDInt = parseFloat(totCDD.toFixed(6))
        Trans.totCDD = numeral(totCDD).format('0,0.[000000]');
        
        Trans.feeInt = parseFloat(fee.toFixed(6))
        Trans.fee    = numeral(fee).format('0,0.[000000]');
        
    
    }
    
    
    
    Block.tx.push(Trans);

} //is chain === 'orphan'  
    
        }//for noTrans
    
       
       res.send(Block); 
});  
       }); 
     });
 
    }); 
    
     });
    
  
  }
   
  });  


}





//---------------------------------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------GET BLOCK INFO API-----------------------------------------------------------------------------

exports.getBlockInfo = function(req,res){ 


var num = req.params.num;
if (( num % 1 )!==0){
    
    res.send({exists:false});
}
else{
    
    db.BlockCollection.runCommand('count', function(err, count) { 
    
        if( parseInt(num) > count.n){
            res.send({exists:false});
        }
        else{
            
        var blockCount = count.n;
        var howNum = blockCount - parseInt(num);
       
        var Blocks = [];
            
    db.BlockCollection.find({"blockHeight":{"$gte":howNum}},function(err,docBlock){ 
                
        for(var b=0;b<num;b++){
            
          var bHash = docBlock[b].blockHash,
              bHeight = docBlock[b].blockHeight,
              bSize = docBlock[b].blockSize,
              bPrevHash = docBlock[b].blockPrevHash,
              bDifficulty = docBlock[b].blockDifficulty,
              bVer = docBlock[b].blockVer,
              bNumTrans = docBlock[b].blockNumTrans,
              bMrkRoot = docBlock[b].blockMrkRoot,
              bBits = docBlock[b].blockBits,
              bTimeStampUnix = docBlock[b].blockTimeStamp,      
              bNonce = docBlock[b].blockNonce,
              bType = docBlock[b].blockType,
              bTotRec = docBlock[b].blockTotRec,
              bTotRecBits = docBlock[b].blockTotRecBits,
              bCDD = docBlock[b].blockCDD,
              bSolvedBy = docBlock[b].blockSolvedBy;
            
            
            var Block = {   
                            hash:bHash,
                            height: bHeight,
                            size:bSize, 
                            prevHash:bPrevHash,
                            mrkRoot:bMrkRoot,
                            timestamp: bTimeStampUnix*1000,
                            type: bType,
                            cdd:bCDD,
                            bits: bBits,
                            difficulty: bDifficulty,
                            ver:bVer, 
                            nonce:bNonce,
                            numTrans: bNumTrans,
                            totRec:bTotRec,
                            totRecBits:bTotRecBits,
                            solvedBy:bSolvedBy
                            
            };
            
            
            
            Blocks.push(Block);
            
            
            
            
            
            
                }
        res.send(Blocks);
  
            }); 
           }
        });   
    }
};
//---------------------------------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------GET ALL BLOCK INFO-----------------------------------------------------------------------------

exports.getAllBlockInfo = function(req,res){ 


var pageId = req.params.page_id
if (( pageId % 1 )!==0){
    
    res.send({exists:false});
}
else{
    
    db.BlockCollection.runCommand('count', function(err, count) { 
    
        if( (20*parseInt(pageId) - count.n) > 20 ){
            
            res.send({exists:false});
        }
        else{
        
        var end = 20*(parseInt(pageId));
        var start = 20*(parseInt(pageId)-1);
        var blockCount = count.n; 
        var howNum = blockCount - (20*parseInt(pageId) );
        var searchy = {"$gte":howNum}
        if (howNum < 0){
            console.log("howNum first",howNum);
            howNum +=20; 
            console.log("howNum second",howNum);
            searchy = {"$gte":0};
            start=0;
            end = howNum;
        }
         
        var Blocks = [];
            
    db.BlockCollection.find({"blockHeight":searchy},function(err,docBlock){ 
                
        for(var b=start;b<end;b++){
            
          var bHash = docBlock[b].blockHash,
              bHeight = docBlock[b].blockHeight,
              bSize = docBlock[b].blockSize,
              bPrevHash = docBlock[b].blockPrevHash,
              bDifficulty = docBlock[b].blockDifficulty,
              bVer = docBlock[b].blockVer,
              bNumTrans = docBlock[b].blockNumTrans,
              bMrkRoot = docBlock[b].blockMrkRoot,
              bBits = docBlock[b].blockBits,
              bTimeStampUnix = docBlock[b].blockTimeStamp,      
              bNonce = docBlock[b].blockNonce,
              bType = docBlock[b].blockType,
              bCDD = docBlock[b].blockCDD,
              bTotRec = docBlock[b].blockTotRec,
              bTotRecBits = docBlock[b].blockTotRecBits,
              bSolvedBy = docBlock[b].blockSolvedBy;
            
            
            var Block = {   exists:true,
                            bCount:blockCount,
                            bHash:bHash,
                            bHeightInt: bHeight,
                            bHeight: numeral(bHeight).format('0,0.[000000]'),
                            bSizeInt:bSize, 
                            bSize:  numeral(bSize).format('0,0.[000]'),
                            bPrevHash:bPrevHash,
                            bMrkRoot:bMrkRoot,
                            bTimeStampUnix: bTimeStampUnix,
                            bTimeStamp:showLocalDate(bTimeStampUnix), 
                            bType: bType,
                            bCDD:bCDD,
                            bBitsInt: bBits,
                            bBits: numeral(bBits).format('0,0'), 
                            bDifficultyInt: bDifficulty,
                            bDifficulty: numeral(bDifficulty).format('0,0.[0000]'), 
                            bVer:bVer, 
                            bNonceInt:bNonce,
                            bNonce: numeral(bNonce).format('0,0'),
                            bNumTransInt: bNumTrans,
                            bNumTrans: numeral(bNumTrans).format('0,0.[000000]'), 
                            bTotRecInt:parseFloat(bTotRec.toFixed(6)),
                            bTotRec:numeral(bTotRec).format('0,0.[000000]'),
                            bTotRecBitsInt:parseFloat(bTotRecBits.toFixed(6)),
                            bTotRecBits:numeral(bTotRecBits).format('0,0.[000000]'),
                            bSolvedBy:bSolvedBy
            };
            
            
            
            Blocks.push(Block);
            
            
            
            
            
            
                }
        res.send(Blocks);
  
            }); 
           }
        });   
    }
};

//---------------------------------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------GET ALL ORPHAN BLOCK INFO-----------------------------------------------------------------------------

exports.getAllOrphanBlockInfo = function(req,res){ 


var pageId = req.params.page_id
if (( pageId % 1 )!==0){
    
    res.send({exists:false});
}
else{
    
    db.OrphanBlockCollection.runCommand('count', function(err, count) { 
    
        if( (20*parseInt(pageId) - count.n) > 20 ){
            
            res.send({exists:false});
        }
        else{
        var blockCount = count.n; 
    
        var end = 20*(parseInt(pageId));
        var start = 20*(parseInt(pageId)-1);
        var howNum = blockCount - (20*parseInt(pageId) );
        var searchy = {"$gte":howNum}
        if (howNum < 0){
        
        howNum = 20 + howNum;
        searchy = {"$lt":howNum};
        start = blockCount - howNum;
        end = blockCount;
        }
        /*
        var end = 20*(parseInt(pageId));
        var start = 20*(parseInt(pageId)-1);
        
        var howNum = blockCount - (20*parseInt(pageId) );
        var searchy = {"$gte":howNum}
        if (howNum < 0){
            howNum = 20 + howNum; 
            searchy = {"$lt":howNum};
            start=0;
            end = howNum;
        }
         */
        var Blocks = [];
            
    db.OrphanBlockCollection.find({}).sort({'blockHeight':-1},function(err,docBlock){ 
                
        for(var b=start;b<end;b++){
            
          var bHash = docBlock[b].blockHash,
              bHeight = docBlock[b].blockHeight,
              bSize = docBlock[b].blockSize,
              bPrevHash = docBlock[b].blockPrevHash,
              bDifficulty = docBlock[b].blockDifficulty,
              bVer = docBlock[b].blockVer,
              bNumTrans = docBlock[b].blockNumTrans,
              bMrkRoot = docBlock[b].blockMrkRoot,
              bBits = docBlock[b].blockBits,
              bTimeStampUnix = docBlock[b].blockTimeStamp,      
              bNonce = docBlock[b].blockNonce,
              bType = docBlock[b].blockType,
              bCDD = docBlock[b].blockCDD,
              bTotRec = docBlock[b].blockTotRec,
              bTotRecBits = docBlock[b].blockTotRecBits,
              bSolvedBy = docBlock[b].blockSolvedBy;
            
            
            var Block = {   exists:true,
                            bCount:blockCount,
                            bHash:bHash,
                            bHeightInt: bHeight,
                            bHeight: numeral(bHeight).format('0,0.[000000]'),
                            bSizeInt:bSize, 
                            bSize:  numeral(bSize).format('0,0.[000]'),
                            bPrevHash:bPrevHash,
                            bMrkRoot:bMrkRoot,
                            bTimeStampUnix: bTimeStampUnix,
                            bTimeStamp:moment.unix(bTimeStampUnix).format(" D MMM YYYY  HH:mm:ss"), 
                            bType: bType,
                            bCDD: bCDD,
                            bBitsInt: bBits,
                            bBits: numeral(bBits).format('0,0'), 
                            bDifficultyInt: bDifficulty,
                            bDifficulty: numeral(bDifficulty).format('0,0.[0000]'), 
                            bVer:bVer, 
                            bNonceInt:bNonce,
                            bNonce: numeral(bNonce).format('0,0'),
                            bNumTransInt: bNumTrans,
                            bNumTrans: numeral(bNumTrans).format('0,0.[000000]'), 
                            bTotRecInt:parseFloat(bTotRec.toFixed(6)),
                            bTotRec:numeral(bTotRec).format('0,0.[000000]'),
                            bTotRecBitsInt:parseFloat(bTotRecBits.toFixed(6)),
                            bTotRecBits:numeral(bTotRecBits).format('0,0.[000000]'),
                            bSolvedBy:bSolvedBy
            };
            
            
            
            Blocks.push(Block);
            
            
            
            
            
            
                }
        res.send(Blocks);
  
            }); 
           }
        });   
    }
};


//---------------------------------------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------LATEST BLOCK INFO API--------------------------------------------------------------------------

exports.getBlockLatest = function(req,res){ 

    
    db.BlockCollection.runCommand('count', function(err, count) { 
    
            
    db.BlockCollection.find({"blockHeight":(count.n-1)},function(err,docBlock){ 
          var totalBlock = 0,
              totFees = 0,
              totalCDD = 0,
              bReward = 0;     
    
            
          var bHash = docBlock[0].blockHash,
              bHeight = docBlock[0].blockHeight,
              bSize = docBlock[0].blockSize,
              bPrevHash = docBlock[0].blockPrevHash,
              bDifficulty = docBlock[0].blockDifficulty,
              bVer = docBlock[0].blockVer,
              bNumTrans = docBlock[0].blockNumTrans,
              bMrkRoot = docBlock[0].blockMrkRoot,
              bBits = docBlock[0].blockBits,
              bTimeStampUnix = docBlock[0].blockTimeStamp,      
              bNonce = docBlock[0].blockNonce,
              bType = docBlock[0].blockType,
              bTotRec = docBlock[0].blockTotRec,
              bConf = numeral(count.n - bHeight).format('0,0.[000000]'),
              bConfInt = count.n - bHeight;


      
  var Block = { exists:true,
                hash:bHash,
                heightInt: bHeight,
                height: numeral(bHeight).format('0,0.[000000]'),
                sizeInt:bSize, 
                size:  numeral(bSize).format('0,0.[000]'),
                prevHash:bPrevHash,
                nxtHash:"",
                mrkRoot:bMrkRoot,
                timeStampUnix: bTimeStampUnix,
                timeStamp:moment.unix(bTimeStampUnix).format(" D MMM YYYY  HH:mm:ss"), 
                confInt:bConfInt,
                conf: bConf,
                type: bType,
                bitsInt: bBits,
                bits: numeral(bBits).format('0,0'), 
                difficultyInt: bDifficulty,
                difficulty: numeral(bDifficulty).format('0,0.[0000]'), 
                ver:bVer, 
                nonceInt:bNonce,
                nonce: numeral(bNonce).format('0,0'),
                numTransInt: bNumTrans,
                numTrans: numeral(bNumTrans).format('0,0.[000000]'), 
               
            };
    
      
db.TxCollection.find({'forBlock':bHeight},function(err, docTx){ 


var noTrans = docTx.length; //number of trans. in block
for (var r=0;r<noTrans;r++){ //for each tx. in block 
    
            
    var  fee = 0,
         totIn = 0,
         totOut = 0,            
         totCDD = 0,
         txHash = docTx[r]._id,
         curTimeStamp = docTx[r].TXdetails.tx_timeStamp,        
         inCountInt = docTx[r].TXdetails.inCount,        
         outCountInt = docTx[r].TXdetails.outCount;

   
      
   
    for(var i =0; i<inCountInt ; i++){
    
    var cdd = 0;
    var prevTimeStamp =  docTx[r].TXinputs[i].prevOut.prevTimeStamp,
        txIndex = docTx[r].TXinputs[i].prevOut.index;
      
        
        
        if(txIndex<0){ //coinbase Transactions
        
            inTx = "Coinbase";    
          
        }
        else{ //regular transactions (this includes PoS Transactions)
        
       
            
                var inputVal     = docTx[r].TXinputs[i].inputs.inVal ;               
                totIn        = totIn + inputVal;
                //LET'S GET CDD...
                var step0 = curTimeStamp - prevTimeStamp;
                if(step0>7776000){ //if the input has been sitting for more than 90 days...we use 90days worth of coin days...because of the limiter
                
                    cdd = 90*inputVal;
                
                }
                else{ //if the input has been sitting for less than 90 days...we use the accumulated amount of coin days
                
                    cdd = (step0/86400)*inputVal;
                
                }
                
                totCDD = totCDD + cdd; 
                
                
                 
        
        }
        
        
        
    }//for inCount
    for(var o = 0; o<outCountInt; o++){ 
        
        var getOut = docTx[r].TXoutputs[o],            
            outputVal = getOut.outVal;        
            totOut = totOut + outputVal;
            
             
        
        
        
        
        
      
    }//for outCount
    totalCDD = totalCDD + totCDD;
    fee = totIn - totOut;
    if(fee<=0){ 
    
        var reward = fee*-1;

            fee = 0;
            totFees = totFees + fee;
        totalBlock = totalBlock + reward;
           bRewardInt = parseFloat(reward.toFixed(6));        
           bReward = numeral(reward).format('0,0.[000000]');    
        

    
    }
    else{ 
        
        totalBlock = totalBlock + totOut;
        totFees = totFees + fee;
        

    
    }
    
          
        }//for noTrans
    
       Block.rewardInt = bRewardInt;
       Block.reward = bReward; 
       
       Block.totRecInt = parseFloat(bTotRec.toFixed(6));
       Block.totRec = numeral(bTotRec).format('0,0.[000000]');
       
       Block.totCDDInt = parseFloat(totalCDD.toFixed(6));
       Block.totCDD = numeral(totalCDD).format('0,0.[000000]');
       
       Block.totFeeInt = parseFloat(totFees.toFixed(6));
       Block.totFee   = numeral(totFees).format('0,0.[000000]');
       
      
       
      


       
       res.send(Block); 
       
 
});

    
           
     
  
            }); 
           
        });   
    
};

//--------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------BLOCK SINGLE API------------------------------------------------------------------

exports.getBlockSingle = function(req,res){ 

    
    var blockId = req.params.block_id;
   
if(blockId.length===64){ // its a block hash, search by _id 
   

  query = {_id:blockId};
  
   
}
else if(!isNaN(blockId)){ // if not, search by block height
   
    blockId = parseFloat(blockId.replace("/,/g",""));
    blockId = parseInt(blockId.toFixed());
    
    query = {blockHeight:blockId};
 
}
else{
    
  
res.send({exists:false});    
   
}
db.BlockCollection.find(query,function(err, docBlock){ 

   if(docBlock.length===0){
       
   res.send({exists:false});
   
   }
  else{
  var totalBlock = 0,
      totFees = 0,
      totalCDD = 0,
      bReward = 0,
      bNxtHash;

  var bHash = docBlock[0].blockHash,
      bHeight = docBlock[0].blockHeight,
      bSize = docBlock[0].blockSize,
      bPrevHash = docBlock[0].blockPrevHash,
      bDifficulty = docBlock[0].blockDifficulty,
      bVer = docBlock[0].blockVer,
      bNumTrans = docBlock[0].blockNumTrans,
      bMrkRoot = docBlock[0].blockMrkRoot,
      bBits = docBlock[0].blockBits,
      bTimeStampUnix = docBlock[0].blockTimeStamp,      
      bNonce = docBlock[0].blockNonce,
      bType = docBlock[0].blockType,
      bTotRec = docBlock[0].blockTotRec;
      
 
  
db.BlockCollection.find({'blockHeight':bHeight+1},function(err, docNxt){ 
    
    if(docNxt.length===0){
        
        bNxtHash="";
    }
    else{
  bNxtHash = docNxt[0]._id;
    }

db.BlockCollection.runCommand('count', function(err, count) {
    var bConf = numeral(count.n - bHeight).format('0,0.[000000]');
    var bConfInt = count.n - bHeight;


      
  var Block = { exists:true,
                hash:bHash,
                heightInt: bHeight,
                height: numeral(bHeight).format('0,0.[000000]'),
                sizeInt:bSize, 
                size:  numeral(bSize).format('0,0.[000]'),
                prevHash:bPrevHash,
                nxtHash:bNxtHash,
                mrkRoot:bMrkRoot,
                timeStampUnix: bTimeStampUnix,
                timeStamp:moment.unix(bTimeStampUnix).format(" D MMM YYYY  HH:mm:ss"), 
                confInt:bConfInt,
                conf: bConf,
                type: bType,
                bitsInt: bBits,
                bits: numeral(bBits).format('0,0'), 
                difficultyInt: bDifficulty,
                difficulty: numeral(bDifficulty).format('0,0.[0000]'), 
                ver:bVer, 
                nonceInt:bNonce,
                nonce: numeral(bNonce).format('0,0'),
                numTransInt: bNumTrans,
                numTrans: numeral(bNumTrans).format('0,0.[000000]'), 
               
            };
    
      
db.TxCollection.find({'forBlock':bHeight}).sort( { "TXdetails.tx_num" : 1 },function(err, docTx){ 


var noTrans = docTx.length; //number of trans. in block
for (var r=0;r<noTrans;r++){ //for each tx. in block 
    
            
    var  fee = 0,
         totIn = 0,
         totOut = 0,            
         totCDD = 0,
         txHash = docTx[r]._id,
         curTimeStamp = docTx[r].TXdetails.tx_timeStamp,        
         inCountInt = docTx[r].TXdetails.inCount,        
         outCountInt = docTx[r].TXdetails.outCount;

   
      
   
    for(var i =0; i<inCountInt ; i++){
    
    var cdd = 0;
    var prevTimeStamp =  docTx[r].TXinputs[i].prevOut.prevTimeStamp,
        txIndex = docTx[r].TXinputs[i].prevOut.index;
      
        
        
        if(txIndex<0){ //coinbase Transactions
        
            inTx = "Coinbase";    
          
        }
        else{ //regular transactions (this includes PoS Transactions)
        
       
            
                var inputVal     = docTx[r].TXinputs[i].inputs.inVal ;               
                totIn        = totIn + inputVal;
                //LET'S GET CDD...
                var step0 = curTimeStamp - prevTimeStamp;
                if(step0>7776000){ //if the input has been sitting for more than 90 days...we use 90days worth of coin days...because of the limiter
                
                    cdd = 90*inputVal;
                
                }
                else{ //if the input has been sitting for less than 90 days...we use the accumulated amount of coin days
                
                    cdd = (step0/86400)*inputVal;
                
                }
                
                totCDD = totCDD + cdd; 
                
                
                 
        
        }
        
        
        
    }//for inCount
    for(var o = 0; o<outCountInt; o++){ 
        
        var getOut = docTx[r].TXoutputs[o],            
            outputVal = getOut.outVal;        
            totOut = totOut + outputVal;
            
             
        
        
        
        
        
      
    }//for outCount
    totalCDD = totalCDD + totCDD;
    fee = totIn - totOut;
    if(fee<=0){ 
    
        var reward = fee*-1;

            fee = 0;
            totFees = totFees + fee;
        totalBlock = totalBlock + reward;
           bRewardInt = parseFloat(reward.toFixed(6));        
           bReward = numeral(reward).format('0,0.[000000]');    
        

    
    }
    else{ 
        
        totalBlock = totalBlock + totOut;
        totFees = totFees + fee;
        

    
    }
    
          
        }//for noTrans
    
       Block.rewardInt = bRewardInt;
       Block.reward = bReward; 
       
       Block.totRecInt = parseFloat(bTotRec.toFixed(6));
       Block.totRec = numeral(bTotRec).format('0,0.[000000]');
       
       Block.totCDDInt = parseFloat(totalCDD.toFixed(6));
       Block.totCDD = numeral(totalCDD).format('0,0.[000000]');
       
       Block.totFeeInt = parseFloat(totFees.toFixed(6));
       Block.totFee   = numeral(totFees).format('0,0.[000000]');
       
      
       
      


       
       res.send(Block); 
       
 
});
    }); 
    
     });
    
  
  }
   
  });  


    

         
    
};




