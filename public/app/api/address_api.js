var db = require('mongojs').connect('mongodb://<username>:<password>@127.0.0.1:27017/BlockDB',['BlockCollection','TxCollection','OrphanTxCollection']);
var moment = require('moment');


var numeral = require('numeral');

exports.existsById = function(req,res){ 

var addressId = req.params.address_id;

db.TxCollection.find({"Addresses":{"$in":[addressId]}},function(err, doc){ 

 
   if (doc.length === 0){
        res.send({exists:false});
        
        }
        else{ 
        
        res.send({exists:true}); 
       
        }

}); 
    



};
//---------------------------------------------------------------------------------------------------------------------------------------------------


//---------------------------------------------------------ADDRESS TX DET API------------------------------------------------------------------------

exports.addressUnspent = function(req,res){

    
    var addressId = req.params.address_id;
    
    if(addressId.length===34 || addressId.length===33){  
        
        var query = {"Addresses":{"$in":[addressId]}};
  
  
  var Trans = [];
    
  
   
}
else{
    
  
res.send({exists:false});    
   
}
    
db.TxCollection.find(query, function(err, docTx){ 
if(err!==null){
	console.log(err);
}
else{
if(docTx.length===0){
    
    res.send({exists:false});
    
}    
else{ 

    var noTrans = docTx.length;

    for (var r=0;r<noTrans;r++){ //for each tx.
    
    var  fee    = 0,
         totInFee = 0,
         totOutFee = 0,
         totIn  = 0,
         totOut = 0,            
         totCDD = 0,
         totCDA = 0,
         txHash = docTx[r]._id,
         curTimeStamp = docTx[r].TXdetails.tx_timeStamp,
         inCountInt = docTx[r].TXdetails.inCount,     
         outCountInt = docTx[r].TXdetails.outCount;
      
 
        //the outputs of the tx only matter
    for(var o = 0; o<outCountInt; o++){ 
        var totCDA = 0; 
        var getOut = docTx[r].TXoutputs[o],
            outputAddress = getOut.Address,
            hash160 = getOut.Hash160,
            outputVal = getOut.outVal,
            outputNum = getOut.out_num,
            status = getOut.status,
            outScript = getOut.outScript;
        totOutFee = totOutFee + outputVal;
        
        if(outputAddress===addressId){
            
            totOut = totOut + outputVal;
            
            
            if(status==="unspent"){
        var uTx = {
      
        txHash:txHash,
        txTimeStampUnix: curTimeStamp,
        txTimeStamp: moment.unix(curTimeStamp).format(" D MMM YYYY  HH:mm:ss"),
        outNum:outputNum,
        address:outputAddress,
        val:outputVal,
        status:status,
        outScript:outScript
        
        
    };  
               
                
Trans.push(uTx);
                
            }
            
            
            
            
        
        }

    }//for outCount
    
        
            }//no trans
    
    res.send(Trans);
}
}
});
        
 
   
    
    
    
    
    
};//exports.addressTxDet
//----------------------------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------ADDRESS DETAILS API ------------------------------------------------------------------


exports.addressDetails = function(req,res){ 

var addressId = req.params.address_id;
addressId = addressId.replace(" ","");
var sortId = req.params.sort_id;  
var pageId = req.params.page_id;

pageId = parseFloat(pageId.replace("/,/g",""));
if((pageId % 1)!==0 || pageId===0){
    
    res.send({exists:false});
    
}
else if(sortId !== "newest" && sortId !== "oldest"){

    res.send({exists:false});

}
    
    
if(addressId.length===34 || addressId.length===33){
   

  var query = {"Addresses":{"$in":[addressId]}};
    
  
  var totalBalance = 0,
      totalIn = 0,
      totalOut = 0,
      totalCDD = 0,
      totalCDA = 0;
  
  var Address = { 
                exists:true,
                address: addressId,
                tx:[],
                
                
                    
                  };

    
  
   
}
else{
    
console.log("JOHNY G");
res.send({exists:false});    
   
}
    
db.TxCollection.find(query, function(err, docTx){ 
if(err!==null){
	console.log(err);
}
else{
if(docTx.length===0){
    console.log("JG");
    res.send({exists:false});
    
}    
else{ 
    
if (sortId === "newest"){

    var sTx = docTx.sort(function(a,b){
   return b.TXdetails.tx_timeStamp - a.TXdetails.tx_timeStamp; 
});

}
else {

    var sTx = docTx.sort(function(a,b){
   return a.TXdetails.tx_timeStamp - b.TXdetails.tx_timeStamp; 
});

}
 
        
    var noTrans = docTx.length;  
    
db.BlockCollection.runCommand('count', function(err, count) {        
    
    
   
    if(pageId > Math.ceil(noTrans/20)){
        console.log("JOG");
        res.send({exists:false});
    }
    
     var start = (pageId-1)*20;
     var end   = (pageId)*20;
    if (end > noTrans){
        end = noTrans;
    }
    
    
for (var r=start;r<end;r++){ //for each tx. in block 
    
            
     var fee    = 0,
         totIn  = 0,
         totOut = 0,            
         totCDD = 0,
         totInCheck  = 0,
         totOutCheck = 0,
         totCDDCheck = 0,
         txHash = sTx[r]._id,
         curTimeStamp = sTx[r].TXdetails.tx_timeStamp,
         txTimeStamp = moment.unix(sTx[r].TXdetails.tx_timeStamp).format(" D MMM YYYY  HH:mm:ss"),
         inCount = numeral(sTx[r].TXdetails.inCount).format('0,0.[000000]'),
         inCountInt = sTx[r].TXdetails.inCount,
         outCount = numeral(sTx[r].TXdetails.outCount).format('0,0.[000000]'),
         outCountInt = sTx[r].TXdetails.outCount,
         txIndex = sTx[r].TXdetails.tx_index,
         forBlock = sTx[r].forBlock,
         chain = sTx[r].chain,
         txType = sTx[r].tx_type;
         if (txType === "53"){
         
             var transType = "NSR";
         }
         else{
         
            var transType = "NBT";
         
         }  

 
     var  Trans = { 
                    chain:chain,
                    txHash:txHash, 
                    txTimeStampUnix:curTimeStamp,
                    txTimeStamp:txTimeStamp, 
                    inCount:inCount,
                    inCountInt:inCountInt,
                    outCount:outCount,
                    outCountInt:outCountInt,
                    txIndex:docTx[r].TXdetails.tx_index,
                    forBlockInt:forBlock,
                    forBlock: numeral(forBlock).format('0,0'),
                    tx_Type:transType,
                    inputs:[], 
                    outputs:[] 
                    
                };       
   if(forBlock<0){
     Trans.confInt = 0,
     Trans.conf = "0";
    }
    else{
        
        if(chain === 'main'){
        
            Trans.confInt = count.n - forBlock;
            Trans.conf = numeral(count.n-forBlock).format('0,0');
            
        }
        else{
            Trans.confInt = 0;
            Trans.conf = '0';
        }
        
        
        
    }
    
    
    
    for(var i = 0; i<inCountInt ; i++){
    
    var cdd  = 0;
    var inTx = sTx[r].TXinputs[i].prevOut.inTx,
        txIndex = sTx[r].TXinputs[i].prevOut.index,
        inScript = sTx[r].TXinputs[i].inputs.inScript,
        prevTimeStamp =  sTx[r].TXinputs[i].prevOut.prevTimeStamp,
        inputNum = sTx[r].TXinputs[i].inputs.in_num;
        
        
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
        
       
            var inputAddress = sTx[r].TXinputs[i].inputs.Address ,
                inputVal     = sTx[r].TXinputs[i].inputs.inVal;
                
                totIn    = totIn + inputVal;
                
                //LET'S GET CDD...
            
            if(inputAddress===addressId){
                totInCheck = totInCheck+inputVal;
                
                
                var step0 = curTimeStamp - prevTimeStamp;
                if(step0>7776000){ //if the input has been sitting for more than 90 days...we use 90days worth of coin days...because of the limiter
                
                    cdd = 90*inputVal;
                
                }
                else{ //if the input has been sitting for less than 90 days...we use the accumulated amount of coin days
                
                    cdd = (step0/86400)*inputVal;
                
                }
                
                totCDD = totCDD + cdd;
                totCDDCheck = totCDDCheck + cdd;
          
            }
            
            var Inputs       = { 
                                prevTx: inTx,
                                inScript:inScript,
                                inAddress:inputAddress,
                                inValInt:inputVal,
                                inVal : numeral(inputVal).format('0,0.[000000]'), //server crashed because of this. probably no input tx.
                                in_num:inputNum
                               };
                
                
                 
         Trans.inputs.push(Inputs);
        }
        
        
        
    }//for inCount
    for(var o = 0; o<outCountInt; o++){ 
        
        var getOut = sTx[r].TXoutputs[o],
            outputAddress = getOut.Address,
            outputVal = getOut.outVal,
            outputNum = getOut.out_num,
            status = getOut.status,
            txSpent = getOut.txSpent;
            totOut = totOut + outputVal;
        if(outputAddress===addressId){
        
            
       totOutCheck = totOutCheck + outputVal;
        
        }
           
        var Outputs = {outAddress: outputAddress,
                       outValInt: outputVal,
                       outVal: numeral(outputVal).format('0,0.[000000]'), 
                       out_num:outputNum,
                       status:status,
                       txSpent:txSpent
                      };
        
        Trans.outputs.push(Outputs);
    }//for outCount

    fee = totIn - totOut;
    if(fee<0){ 
    
        if(totIn !==0){
            
            var reward = fee*-1;
            totIn = reward;
            totOut = 0;            
            fee = 0;    
        }
        else{
            var reward = totOutCheck;
            totIn = totOut;
            totOut = 0;            
            fee = 0;
        }
            
        
        Trans.totInCheckInt =0,
        Trans.totInCheck = "0";
        
        Trans.totOutCheckInt = parseFloat(reward.toFixed(6)),
        Trans.totOutCheck = numeral(reward).format('0,0.[000000]');
            
        Trans.totCDDCheckInt = parseFloat(totCDDCheck.toFixed(6)),
        Trans.totCDDCheck = numeral(totCDDCheck).format('0,0.[000000]');
        
        
        Trans.totInInt = parseFloat(totIn.toFixed(6)),
        Trans.totIn  = numeral(totIn).format('0,0.[000000]');
        
        Trans.totOutInt =parseFloat(totOut.toFixed(6)),
        Trans.totOut = numeral(totOut).format('0,0.[000000]');
        
        Trans.totCDDInt = parseFloat(totCDD.toFixed(6)),
        Trans.totCDD = numeral(totCDD).format('0,0.[000000]');
        
        Trans.feeInt = parseFloat(fee.toFixed(6)),
        Trans.fee    = numeral(fee).format('0,0.[000000]');
    
    }
    else{ 
        
       
      
        Trans.totInCheckInt = parseFloat(totInCheck.toFixed(6)),
        Trans.totInCheck = numeral(totInCheck).format('0,0.[000000]');
        
        Trans.totOutCheckInt = parseFloat(totOutCheck.toFixed(6)),
        Trans.totOutCheck = numeral(totOutCheck).format('0,0.[000000]');
            
        Trans.totCDDCheckInt = parseFloat(totCDDCheck.toFixed(6)),
        Trans.totCDDCheck = numeral(totCDDCheck).format('0,0.[000000]');
       
        Trans.totInInt = parseFloat(totIn.toFixed(6)),
        Trans.totIn  = numeral(totIn).format('0,0.[000000]');
        
        Trans.totOutInt =parseFloat(totOut.toFixed(6)),
        Trans.totOut = numeral(totOut).format('0,0.[000000]');
        
        Trans.totCDDInt = parseFloat(totCDD.toFixed(6)),
        Trans.totCDD = numeral(totCDD).format('0,0.[000000]');
        
        Trans.feeInt = parseFloat(fee.toFixed(6)),
        Trans.fee    = numeral(fee).format('0,0.[000000]');
        
      
    }
    
    
    
    Address.tx.push(Trans);
    

        }//for noTrans

       
       res.send(Address);    
 

});        
        
      
        
        
        
    

        }//else 
       }//else for error
});//db.TxCollection.find() 
}
//----------------------------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------ADDRESS ORPHAN DETAILS API ------------------------------------------------------


exports.addressOrphanDetails = function(req,res){ 

var addressId = req.params.address_id;
addressId = addressId.replace(" ","");
var sortId = req.params.sort_id;  
var pageId = req.params.page_id;

pageId = parseFloat(pageId.replace("/,/g",""));
if((pageId % 1)!==0 || pageId===0){
    
    res.send({exists:false});
    
}
else if(sortId !== "orphan"){

    res.send({exists:false});

}
    
    
if(addressId.length===34 || addressId.length===33){
   

  var query = {"Addresses":{"$in":[addressId]}};
    
  
  var totalBalance = 0,
      totalIn = 0,
      totalOut = 0,
      totalCDD = 0,
      totalCDA = 0;
  
  var Address = { 
                exists:true,
                address: addressId,
                tx:[],
                
                
                    
                  };

    
  
   
}
else{
      
res.send({exists:false});    
   
}
    
db.OrphanTxCollection.find(query, function(err, docTx){ 
if(err!==null){
	console.log(err);
}
else{
if(docTx.length===0){
    
    res.send({exists:false});
    
}    
else{ 
    
if (sortId === "orphan"){

    var sTx = docTx.sort(function(a,b){
   return b.TXdetails.tx_timeStamp - a.TXdetails.tx_timeStamp; 
});
    
}
else {

    var sTx = docTx.sort(function(a,b){
   return a.TXdetails.tx_timeStamp - b.TXdetails.tx_timeStamp; 
});

}
 
        
    var noTrans = docTx.length;  
    
db.BlockCollection.runCommand('count', function(err, count) {        
    
    
   
    if(pageId > Math.ceil(noTrans/20)){
        res.send({exists:false});
    }
    
     var start = (pageId-1)*20;
     var end   = (pageId)*20;
    if (end > noTrans){
        end = noTrans;
    }
    
    
for (var r=start;r<end;r++){ //for each tx. in block 
    
            
     var fee    = 0,
         totIn  = 0,
         totOut = 0,            
         totCDD = 0,
         totInCheck  = 0,
         totOutCheck = 0,
         totCDDCheck = 0,
         txHash = sTx[r]._id,
         curTimeStamp = sTx[r].TXdetails.tx_timeStamp,
         txTimeStamp = moment.unix(sTx[r].TXdetails.tx_timeStamp).format(" D MMM YYYY  HH:mm:ss"),
         inCount = numeral(sTx[r].TXdetails.inCount).format('0,0.[000000]'),
         inCountInt = sTx[r].TXdetails.inCount,
         outCount = numeral(sTx[r].TXdetails.outCount).format('0,0.[000000]'),
         outCountInt = sTx[r].TXdetails.outCount,
         txIndex = sTx[r].TXdetails.tx_index,
         forBlock = sTx[r].forBlock,
         chain = sTx[r].chain,
         txType = sTx[r].tx_type;
         if (txType === "53"){
         
             var transType = "NSR";
         }
         else{
         
            var transType = "NBT";
         
         }  

 
     var  Trans = { 
                    chain:chain,
                    txHash:txHash, 
                    txTimeStampUnix:curTimeStamp,
                    txTimeStamp:txTimeStamp, 
                    inCount:inCount,
                    inCountInt:inCountInt,
                    outCount:outCount,
                    outCountInt:outCountInt,
                    txIndex:docTx[r].TXdetails.tx_index,
                    forBlockInt:forBlock,
                    forBlock: numeral(forBlock).format('0,0'),
                    tx_Type:transType,
                    inputs:[], 
                    outputs:[] 
                    
                };       
   if(forBlock<0){
     Trans.confInt = 0,
     Trans.conf = "0";
    }
    else{
        
        if(chain === 'main'){
        
            Trans.confInt = count.n - forBlock;
            Trans.conf = numeral(count.n-forBlock).format('0,0');
            
        }
        else{
            Trans.confInt = 0;
            Trans.conf = '0';
        }
        
        
        
    }
    
    
    
    for(var i = 0; i<inCountInt ; i++){
    
    var cdd  = 0;
    var inTx = sTx[r].TXinputs[i].prevOut.inTx,
        txIndex = sTx[r].TXinputs[i].prevOut.index,
        inScript = sTx[r].TXinputs[i].inputs.inScript,
        prevTimeStamp =  sTx[r].TXinputs[i].prevOut.prevTimeStamp,
        inputNum = sTx[r].TXinputs[i].inputs.in_num;
        
        
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
        
       
            var inputAddress = sTx[r].TXinputs[i].inputs.Address ,
                inputVal     = sTx[r].TXinputs[i].inputs.inVal;
                
                totIn    = totIn + inputVal;
                
                //LET'S GET CDD...
            
            if(inputAddress===addressId){
                totInCheck = totInCheck+inputVal;
                
                
                var step0 = curTimeStamp - prevTimeStamp;
                if(step0>7776000){ //if the input has been sitting for more than 90 days...we use 90days worth of coin days...because of the limiter
                
                    cdd = 90*inputVal;
                
                }
                else{ //if the input has been sitting for less than 90 days...we use the accumulated amount of coin days
                
                    cdd = (step0/86400)*inputVal;
                
                }
                
                totCDD = totCDD + cdd;
                totCDDCheck = totCDDCheck + cdd;
          
            }
            
            var Inputs       = { 
                                prevTx: inTx,
                                inScript:inScript,
                                inAddress:inputAddress,
                                inValInt:inputVal,
                                inVal : numeral(inputVal).format('0,0.[000000]'), //server crashed because of this. probably no input tx.
                                in_num:inputNum
                               };
                
                
                 
         Trans.inputs.push(Inputs);
        }
        
        
        
    }//for inCount
    for(var o = 0; o<outCountInt; o++){ 
        
        var getOut = sTx[r].TXoutputs[o],
            outputAddress = getOut.Address,
            outputVal = getOut.outVal,
            outputNum = getOut.out_num,
            status = getOut.status,
            txSpent = getOut.txSpent;
            totOut = totOut + outputVal;
        if(outputAddress===addressId){
        
            
       totOutCheck = totOutCheck + outputVal;
        
        }
           
        var Outputs = {outAddress: outputAddress,
                       outValInt: outputVal,
                       outVal: numeral(outputVal).format('0,0.[000000]'), 
                       out_num:outputNum,
                       status:status,
                       txSpent:txSpent
                      };
        
        Trans.outputs.push(Outputs);
    }//for outCount

    fee = totIn - totOut;
    if(fee<0){ 
    
        if(totIn !==0){
            
            var reward = fee*-1;
            totIn = reward;
            totOut = 0;            
            fee = 0;    
        }
        else{
            var reward = totOutCheck;
            totIn = totOut;
            totOut = 0;            
            fee = 0;
        }
            
        
        Trans.totInCheckInt =0,
        Trans.totInCheck = "0";
        
        Trans.totOutCheckInt = parseFloat(reward.toFixed(6)),
        Trans.totOutCheck = numeral(reward).format('0,0.[000000]');
            
        Trans.totCDDCheckInt = parseFloat(totCDDCheck.toFixed(6)),
        Trans.totCDDCheck = numeral(totCDDCheck).format('0,0.[000000]');
        
        
        Trans.totInInt = parseFloat(totIn.toFixed(6)),
        Trans.totIn  = numeral(totIn).format('0,0.[000000]');
        
        Trans.totOutInt =parseFloat(totOut.toFixed(6)),
        Trans.totOut = numeral(totOut).format('0,0.[000000]');
        
        Trans.totCDDInt = parseFloat(totCDD.toFixed(6)),
        Trans.totCDD = numeral(totCDD).format('0,0.[000000]');
        
        Trans.feeInt = parseFloat(fee.toFixed(6)),
        Trans.fee    = numeral(fee).format('0,0.[000000]');
    
    }
    else{ 
        
       
      
        Trans.totInCheckInt = parseFloat(totInCheck.toFixed(6)),
        Trans.totInCheck = numeral(totInCheck).format('0,0.[000000]');
        
        Trans.totOutCheckInt = parseFloat(totOutCheck.toFixed(6)),
        Trans.totOutCheck = numeral(totOutCheck).format('0,0.[000000]');
            
        Trans.totCDDCheckInt = parseFloat(totCDDCheck.toFixed(6)),
        Trans.totCDDCheck = numeral(totCDDCheck).format('0,0.[000000]');
       
        Trans.totInInt = parseFloat(totIn.toFixed(6)),
        Trans.totIn  = numeral(totIn).format('0,0.[000000]');
        
        Trans.totOutInt =parseFloat(totOut.toFixed(6)),
        Trans.totOut = numeral(totOut).format('0,0.[000000]');
        
        Trans.totCDDInt = parseFloat(totCDD.toFixed(6)),
        Trans.totCDD = numeral(totCDD).format('0,0.[000000]');
        
        Trans.feeInt = parseFloat(fee.toFixed(6)),
        Trans.fee    = numeral(fee).format('0,0.[000000]');
        
      
    }
    
    
    
    Address.tx.push(Trans);
    

        }//for noTrans

       
       res.send(Address);    
 

});        
        
      
        
        
        
    

        }//else 
       }//else for error
});//db.TxCollection.find() 
}


//----------------------------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------ADDRESS INFO------------------------------------------------------------------


exports.addressInfo = function(req,res){ 

var addressId = req.params.address_id;
addressId = addressId.replace(" ","");

if(addressId.length===34 || addressId.length===33){
   

  var query = {"Addresses":{"$in":[addressId]}};
    
  
  var totalBalance = 0,
      totalIn = 0,
      totalOut = 0,
      totalCDD = 0,
      totalCDA = 0,
      totalOrphans = 0;
  if(addressId.substring(0,1) === 'S'){
    var aType = "NSR";
  }
  else{
    var aType = "NBT";
  }
  var Address = { 
                exists:true,
                address: addressId,
                type:aType
                
                
                
                    
                  };

    
  
   
}
else{
    
  
res.send({exists:false});    
   
}
    
db.TxCollection.find(query, function(err, docTx){ 
console.log(query,"docTx.length->",docTx.length);
if(err!==null){
	console.log(err);
}
else{
if(docTx.length===0){
    
    res.send({exists:false});
    
}    
else{ 
    
    
db.OrphanTxCollection.find(query, function(err,odocTx) {   
    
    
    totalOrphans = odocTx.length;
    
    var noTrans = docTx.length;
    Address.numTransInt = noTrans;
    Address.numTrans = numeral(noTrans).format('0,0');
    for (var r=0;r<noTrans;r++){ //for each tx.
    
    var chain = docTx[r].chain;
        
    
        
        
        
    var  fee       = 0,
         isparked  = false,
         totInFee  = 0,
         totOutFee = 0,
         totIn     = 0,
         totOut    = 0,            
         totCDD    = 0,
         totCDA    = 0,
         txHash    = docTx[r]._id,
         curTimeStamp = docTx[r].TXdetails.tx_timeStamp,
         inCountInt = docTx[r].TXdetails.inCount,     
         outCountInt = docTx[r].TXdetails.outCount;
      
 
    
   
    for(var i = 0; i<inCountInt ; i++){
    
    var cdd  = 0;
    var inTx = docTx[r].TXinputs[i].prevOut.inTx,
        txIndex = docTx[r].TXinputs[i].prevOut.index,
        prevTimeStamp =  docTx[r].TXinputs[i].prevOut.prevTimeStamp,
        inputNum = docTx[r].TXinputs[i].inputs.in_num;
        
        
        if(txIndex<0){ //coinbase Transactions
        
            inTx = "Coinbase"
   
   
            
        }
        else{ //regular transactions (this includes PoS Transactions)
        
       
            var inputAddress = docTx[r].TXinputs[i].inputs.Address ,
                inputVal     = docTx[r].TXinputs[i].inputs.inVal ; 
            
            if(inputAddress === "Parked NuBits"){
                isparked = true;
            }
            else{
                
                isparked = false;    
            
            }
                
                totInFee = totInFee + inputVal;
                //LET'S GET CDD...
            
            if(inputAddress===addressId){
                
                totIn        = totIn + inputVal;
               // totalOut = totalOut + inputVal;
                var step0 = curTimeStamp - prevTimeStamp;
                    cdd = (step0/86400)*inputVal;
                                
                totCDD = totCDD + cdd
                totalCDD = totalCDD + cdd;
            }
            
        }
        
        
        
    }//for inCount
    for(var o = 0; o<outCountInt; o++){ 
        var totCDA = 0; 
        var getOut = docTx[r].TXoutputs[o],
            outputAddress = getOut.Address,
            hash160 = getOut.Hash160,
            outputVal = getOut.outVal,
            outputNum = getOut.out_num,
            status = getOut.status;  
        totOutFee = totOutFee + outputVal;
        
        if(outputAddress === addressId){
            
            totOut = totOut + outputVal;
            Address.hash160 = hash160;
            
            if(status==="unspent"){
                
                
                var date = parseInt(((new Date).getTime())/1000);
                var sub = date - curTimeStamp;
                if(sub<0){
                	console.log(sub,date,curTimeStamp);
                }
                if(sub>7776000){
                                        
                    totCDA = totCDA + (outputVal*90);
                    
                }
                else{
                    var val = sub/86400;
                    totCDA = totCDA + (outputVal*val);
                    
                    
                }
                              
                totalCDA = totalCDA + totCDA;
                
            }
                
        }

    }//for outCount

      fee = totInFee - totOutFee;
      fee = parseFloat(fee.toFixed(6));
      if(fee<0){
          //totOut = fee*-1; 
          if(totInFee !==0){
            totIn = 0;  
            if(isparked === true){
                totOut = totOut;
                isparked = false;
            }
            else{
                totOut = fee*-1;    
            }
                        
            fee = 0;    
        }
        else{
            
                   
            fee = 0;
        }
            
          
          
      }
     
      

         
totalIn = totalIn + totOut;
totalOut = totalOut + totIn;



    
        
            }//no trans
    
/*
    if(totalOrphans === noTrans){ //special case were the only trans. for the address is orphaned. We use this to get the hash 160 of the address
                     
    for (var ro=0;ro<noTrans;ro++){ //for each tx.
    outCountInt = docTx[ro].TXdetails.outCount;       
   
    for(var o = 0; o<outCountInt; o++){ 
         
        var getOut = docTx[ro].TXoutputs[o],
            outputAddress = getOut.Address,
            hash160 = getOut.Hash160;
            
        
        if(outputAddress === addressId){
            
           Address.hash160 = hash160;
            
            
                
        }

    }//for outCount
    }
      
    }
*/ 
    
    totalBalance = totalIn - totalOut;
                      
            Address.totalCDAInt = parseFloat(totalCDA.toFixed(6)),
            Address.totalCDA = numeral(totalCDA).format('0,0.[000000]');
            
            Address.totalOrphans = totalOrphans;
            
            Address.totalBalanceInt = parseFloat(totalBalance.toFixed(6));
            Address.totalBalance = numeral(totalBalance).format('0,0.[000000]'),
            
            Address.totalOutInt = parseFloat(totalOut.toFixed(6)),
            Address.totalOut    = numeral(totalOut).format('0,0.[000000]') 
                
            Address.totalInInt = parseFloat(totalIn.toFixed(6)),
            Address.totalIn    = numeral(totalIn).format('0,0.[000000]'),
            
                
            Address.totalCDDInt = parseFloat(totalCDD.toFixed(6)),  
            Address.totalCDD    = numeral(totalCDD).format('0,0.[000000]');
       
       res.send(Address);    
 

      
        
      
        
        
        
    
});
        }//else 

       }//else for error
});//db.TxCollection.find() 
}                     
                     



            
  






























