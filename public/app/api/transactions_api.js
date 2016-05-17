var db = require('./api.tools.js').db;
var moment = require('./api.tools.js').moment;
var numeral = require('./api.tools.js').numeral;

exports.existsById = function(req,res){ 

var txId = req.params.tx_id;

db.TxCollection.find({_id:txId},function(err, doc){ 

 
   if (doc.length === 0){ //NOT IN MAIN CHAIN TRANSACTION COLLECTION
       
    db.OrphanTxCollection.find({_id:txId},function(err, odoc){ //CHECK IF ORPHAN CHAIN
        
        
        if (odoc.length === 0){ // NOT IN ORPHAN CHAIN TRANSACTION COLLECTION
            
            res.send({exists:false});
            
        }
        else{
            
            res.send({exists:true}); //ORPHANED TRANSACTION !
            
        }
        
    });   
       
        
        
        }
        else{ 
        
        res.send({exists:true}); //MAIN CHAIN TRANSACTION !
       
        }

}); 
    



};


//---------------------------------------------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------TRANS. DETAILS API------------------------------------------------------------------------

exports.TxDetails = function(req,res){ 

var txId = req.params.tx_id;



if(txId.length===64){ // its a block hash, search by _id 
   
    
  query = {_id:txId};
    
}
else{
    
  
res.send({exists:false});    
   
}
db.TxCollection.find(query,function(err, docTx){ 

   if(docTx.length===0){
//-----------------------------------------------------------ORPHAN TRANSACTION DETAILS----------------------------------------------------------
   
       db.OrphanTxCollection.find(query,function(oerr, odocTx){
  
        if(odocTx.length ===0){
            res.send({exists:false});
        }
        else{
            
  var    fee    = 0,
         totIn  = 0,
         totOut = 0,            
         totCDD = 0,
         txHash = odocTx[0]._id,
         curTimeStamp = odocTx[0].TXdetails.tx_timeStamp,
         txTimeStamp = moment.unix(odocTx[0].TXdetails.tx_timeStamp).format(" D MMM YYYY  HH:mm:ss"),
         inCount = numeral(odocTx[0].TXdetails.inCount).format('0,0.[000000]'),
         inCountInt = odocTx[0].TXdetails.inCount,
         outCount = numeral(odocTx[0].TXdetails.outCount).format('0,0.[000000]'),
         outCountInt = odocTx[0].TXdetails.outCount,
         forBlockInt = odocTx[0].forBlock,
         blockHash = odocTx[0].blockHash,
         chain = odocTx[0].chain,
         txType = odocTx[0].tx_type;
         if (txType === "53"){
         
             var transType = "NSR";
         }
         else{
         
            var transType = "NBT";
         
         }
   db.BlockCollection.runCommand('count', function(err, count) {
    
    if(forBlockInt<0){
     var confInt = 0,
         conf = "0";
    var  forBlock = "";
         forBlockInt =0; 
    }
    else{
        
        if(chain === 'main'){
        var confInt = count.n - forBlockInt;
        var conf = numeral(confInt).format('0,0');
        var forBlock = numeral(forBlockInt).format('0,0');    
        }
        else{
        
        var confInt = 0;
        var conf = '0';
        var forBlock = numeral(forBlockInt).format('0,0');
        }
        
       
    }
     var  Trans = { exists:true,
                    chain:chain,
                    txHash:txHash, 
                    txTimeStampUnix:curTimeStamp,
                    txTimeStamp:txTimeStamp, 
                    inCount:inCount,
                    inCountInt:inCountInt,
                    outCount:outCount,
                    outCountInt:outCountInt,
                    forBlockInt:forBlockInt,
                    forBlock:forBlock,
                    blockHash:blockHash,
                    tx_Type:transType,
                    confInt: confInt,
                    conf : conf,         
                    inputs:[], 
                    outputs:[] 
                    
                };       
   
    for(var i = 0; i<inCountInt ; i++){
    
    var cdd  = 0;
    var inTx = odocTx[0].TXinputs[i].prevOut.inTx,
        txIndex = odocTx[0].TXinputs[i].prevOut.index,
        prevTimeStamp =  odocTx[0].TXinputs[i].prevOut.prevTimeStamp,
        inputNum = odocTx[0].TXinputs[i].inputs.in_num,
        inScript = odocTx[0].TXinputs[i].inputs.inScript;
        
        
        if(txIndex<0){ //coinbase Transactions
        
            inTx = "Coinbase"
   
            var Inputs = {  inScript:inScript,
                            inAddress:inTx, 
                            inValInt:0, 
                            inVal:"0", 
                            in_num:inputNum
                         };
            
            Trans.inputs.push(Inputs);
        }
        else{ //regular transactions (this includes PoS Transactions)
        
       
            var inputAddress = odocTx[0].TXinputs[i].inputs.Address ,
                inputVal     = odocTx[0].TXinputs[i].inputs.inVal;
                
                totIn        = totIn + inputVal;
                //LET'S GET CDD...
                var step0 = curTimeStamp - prevTimeStamp;
                if(step0>7776000){ //if the input has been sitting for more than 90 days...we use 90days worth of coin days...because of the limiter
                
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
        
        var getOut = odocTx[0].TXoutputs[o],
            outputAddress = getOut.Address,
            outputVal = getOut.outVal,
            outputNum = getOut.out_num,
            outputStatus = getOut.status,
            outputTxSpent = getOut.txSpent,
            outScript = getOut.outScript;
            totOut = totOut + outputVal;
            
        
           
        var Outputs = {outAddress: outputAddress,
                       outValInt: outputVal,
                       outVal: numeral(outputVal).format('0,0.[000000]'), 
                       out_num:outputNum,
                       status:outputStatus,
                       txSpent: outputTxSpent,
                       outScript:outScript
                      };
        
        Trans.outputs.push(Outputs);
    }//for outCount

    fee = totIn - totOut;
    if(fee<0){ 
    
        var reward = fee*-1;
            //totIn = reward;
            totOut = reward;
            fee = 0;
         
        
      
        
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
      
       res.send(Trans); 
   
      });
            
    
    }//orphanTx else
           
           
       });      
       
   }
//-----------------------------------------------MAIN CHAIN TRANSACTION DETAILS--------------------------------------------------------
  else{
 
  var    fee    = 0,
         totIn  = 0,
         totOut = 0,            
         totCDD = 0,
         txHash = docTx[0]._id,
         curTimeStamp = docTx[0].TXdetails.tx_timeStamp,
         txTimeStamp = moment.unix(docTx[0].TXdetails.tx_timeStamp).format(" D MMM YYYY  HH:mm:ss"),
         inCount = numeral(docTx[0].TXdetails.inCount).format('0,0.[000000]'),
         inCountInt = docTx[0].TXdetails.inCount,
         outCount = numeral(docTx[0].TXdetails.outCount).format('0,0.[000000]'),
         outCountInt = docTx[0].TXdetails.outCount,
         forBlockInt = docTx[0].forBlock,
         blockHash = docTx[0].blockHash,
         chain = docTx[0].chain,
         txType = docTx[0].tx_type;
         if (txType === "53"){
         
             var transType = "NSR";
         }
         else{
         
            var transType = "NBT";
         
         }
   db.BlockCollection.runCommand('count', function(err, count) {
    
    if(forBlockInt<0){
     var confInt = 0,
         conf = "0";
    var  forBlock = "";
         forBlockInt =0; 
    }
    else{
        
        if(chain === 'main'){
        var confInt = count.n - forBlockInt;
        var conf = numeral(confInt).format('0,0');
        var forBlock = numeral(forBlockInt).format('0,0');    
        }
        else{
        
        var confInt = 0;
        var conf = '0';
        var forBlock = numeral(forBlockInt).format('0,0');
        }
        
        
    }
     var  Trans = { exists:true,
                    chain:chain,
                    txHash:txHash, 
                    txTimeStampUnix:curTimeStamp,
                    txTimeStamp:txTimeStamp, 
                    inCount:inCount,
                    inCountInt:inCountInt,
                    outCount:outCount,
                    outCountInt:outCountInt,
                    forBlockInt:forBlockInt,
                    forBlock:forBlock,
                    blockHash:blockHash,
                    tx_Type:transType,
                    confInt: confInt,
                    conf : conf,         
                    inputs:[], 
                    outputs:[] 
                    
                };       
   
    for(var i = 0; i<inCountInt ; i++){
    
    var cdd  = 0;
    var inTx = docTx[0].TXinputs[i].prevOut.inTx,
        txIndex = docTx[0].TXinputs[i].prevOut.index,
        prevTimeStamp =  docTx[0].TXinputs[i].prevOut.prevTimeStamp,
        inputNum = docTx[0].TXinputs[i].inputs.in_num,
        inScript = docTx[0].TXinputs[i].inputs.inScript;
        
        
        if(txIndex<0){ //coinbase Transactions
        
            inTx = "Coinbase"
   
            var Inputs = {  inScript:inScript,
                            inAddress:inTx, 
                            inValInt:0, 
                            inVal:"0", 
                            in_num:inputNum
                         };
            
            Trans.inputs.push(Inputs);
        }
        else{ //regular transactions (this includes PoS Transactions)
        
       
            var inputAddress = docTx[0].TXinputs[i].inputs.Address ,
                inputVal     = docTx[0].TXinputs[i].inputs.inVal;
                
                totIn        = totIn + inputVal;
                //LET'S GET CDD...
                var step0 = curTimeStamp - prevTimeStamp;
                if(step0>7776000){ //if the input has been sitting for more than 90 days...we use 90days worth of coin days...because of the limiter
                
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
        
        var getOut = docTx[0].TXoutputs[o],
            outputAddress = getOut.Address,
            outputVal = getOut.outVal,
            outputNum = getOut.out_num,
            outputStatus = getOut.status,
            outputTxSpent = getOut.txSpent,
            outScript = getOut.outScript;
            totOut = totOut + outputVal;
            
        
           
        var Outputs = {outAddress: outputAddress,
                       outValInt: outputVal,
                       outVal: numeral(outputVal).format('0,0.[000000]'), 
                       out_num:outputNum,
                       status:outputStatus,
                       txSpent: outputTxSpent,
                       outScript:outScript
                      };
        
        Trans.outputs.push(Outputs);
    }//for outCount

    fee = totIn - totOut;
    if(fee<0){ 
    
        var reward = fee*-1;
            //totIn = reward;
            totOut = reward;
            fee = 0;
         
        
      
        
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
      
       res.send(Trans); 
   
      });
   }
                                 

     
   });
};



//-----------------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------GET TX INFO------------------------------------------------------------------------

exports.getTxInfo = function(req,res){ 
res.send({exists:false});
/*
var num = req.params.num;
if (( num % 1 )!==0){
    
    res.send({exists:false});
}
else{
	db.BlockCollection.runCommand('count', function(err, countTwo) {
	db.TxCollection.runCommand('count', function(err, countOne) { 
    
        if( parseInt(num) > countOne.n){
            res.send({exists:false});
        }
		else{
			
		var txCount = countOne.n;
        var howNum = txCount - parseInt(num);
        var txs = [];
        console.log(howNum+" this is how many u requested "+num);
        db.TxCollection.find({"TXdetails.tx_index":{"$gte":howNum}},function(err,docTx){ 
        if (err!==null){
        	console.log(err)
        	res.send({exists:false});
        }   
        else{ 
        for(var r=0;r<docTx.length;r++){
        	
  var    fee    = 0,
         totIn  = 0,
         totOut = 0,            
         totCDD = 0,
         txHash = docTx[r]._id,
         curTimeStamp = docTx[r].TXdetails.tx_timeStamp,
         txTimeStamp = moment.unix(docTx[r].TXdetails.tx_timeStamp).format(" D MMM YYYY  HH:mm:ss"),
         inCount = numeral(docTx[r].TXdetails.inCount).format('0,0.[000000]'),
         inCountInt = docTx[r].TXdetails.inCount,
         outCount = numeral(docTx[r].TXdetails.outCount).format('0,0.[000000]'),
         outCountInt = docTx[r].TXdetails.outCount,
         forBlockInt = docTx[r].forBlock,
         txHeight = docTx[r].TXdetails.tx_index;
   
    
    if(forBlockInt<0){
     var confInt = 0,
         conf = "0";
    var  forBlock = "";
         forBlockInt =0; 
    }
    else{
        var confInt = countTwo.n - forBlockInt;
        var conf = numeral(confInt).format('0,0');
        var forBlock = numeral(forBlockInt).format('0,0');
        
    }
     var  Trans = { exists:true,
                    txHash:txHash, 
                    txTimeStampUnix:curTimeStamp,
                    txTimeStamp:txTimeStamp,
                    txTimeStampFromNow:moment.unix(curTimeStamp).fromNow(), 
                    txHeight:txHeight,
                    inCount:inCount,
                    inCountInt:inCountInt,
                    outCount:outCount,
                    outCountInt:outCountInt,
                    forBlockInt:forBlockInt,
                    forBlock:forBlock,  
                    confInt: confInt,
                    conf : conf,                            
                    inputs:[], 
                    outputs:[] 
                    
                };       
   
    for(var i = 0; i<inCountInt ; i++){
    
    var cdd  = 0;
    var inTx = docTx[r].TXinputs[i].prevOut.inTx,
        txIndex = docTx[r].TXinputs[i].prevOut.index,
        prevTimeStamp =  docTx[r].TXinputs[i].prevOut.prevTimeStamp,
        inputNum = docTx[r].TXinputs[i].inputs.in_num,
        inScript = docTx[r].TXinputs[i].inputs.inScript;
        
        
        if(txIndex<0){ //coinbase Transactions
        
            inTx = "Coinbase"
   
            var Inputs = {  inScript:inScript,
                            inAddress:inTx, 
                            inValInt:0, 
                            inVal:"0", 
                            in_num:inputNum
                         };
            
            Trans.inputs.push(Inputs);
        }
        else{ //regular transactions (this includes PoS Transactions)
        
       
            var inputAddress = docTx[r].TXinputs[i].inputs.Address ,
                inputVal     = docTx[r].TXinputs[i].inputs.inVal;
                
                totIn        = totIn + inputVal;
                //LET'S GET CDD...
                var step0 = curTimeStamp - prevTimeStamp;
                if(step0>7776000){ //if the input has been sitting for more than 90 days...we use 90days worth of coin days...because of the limiter
                
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
            outputTxSpent = getOut.txSpent,
            outScript = getOut.outScript;
            totOut = totOut + outputVal;
            
        
           
        var Outputs = {outAddress: outputAddress,
                       outValInt: outputVal,
                       outVal: numeral(outputVal).format('0,0.[000000]'), 
                       out_num:outputNum,
                       status:outputStatus,
                       txSpent: outputTxSpent,
                       outScript:outScript
                      };
        
        Trans.outputs.push(Outputs);
    }//for outCount

    fee = totIn - totOut;
    if(fee<0){ 
    
        var reward = fee*-1;
            //totIn = reward;
            totOut = reward;
            fee = 0;
         
        
      
        
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
		    
		    
		    
		    txs.push(Trans);
		        	
        	
        	
      
        	
        			}//for loop b<num
        res.send(txs)		
        }
        			
				});//txCollection.find()			
			}//else	
		});//runcommand count on TxCollection
		});//runcommand count on BlockCollection
	}//else
	*/
};//function close













