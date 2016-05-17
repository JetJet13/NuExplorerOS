var db = require('./api.tools.js').db;
var moment = require('./api.tools.js').moment;
var numeral = require('./api.tools.js').numeral;

exports.statusDetails = function(req, res){
    
    db.StatusCollection.find({_id:'statusInfo'},function(err,info){
               
       res.send({
           conn:info[0].Con,
           blocks:info[0].BlockCount,
           sSupply:info[0].SharesSupply,
           bSupply:info[0].BitsSupply,
           USDprice:info[0].USDprice,
           USDpriceBits:info[0].USDpriceBits,
           EURprice:info[0].EURprice,
           EURpriceBits:info[0].EURpriceBits,
           CNYprice:info[0].CNYprice,
           CNYpriceBits:info[0].CNYpriceBits
       });  
            
    });
    
    
    
    
    
    
    
    
    
};

//-----------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------STATUS PAGE API------------------------------------------------------------------------------

exports.statusInfo = function(req, res){
  
     //var curry = req.currency_id;
     db.StatusCollection.find({_id:'statusInfo'},function(err,info){
        
        
       var height = info[0].BlockCount,
           sSupply = info[0].SharesSupply,
           bSupply = info[0].BitsSupply - 4040000,//4,040,000 NBT are being held in reserve. adjust manually when told so.
           priceUSD = info[0].USDprice,
           priceUSDBits = info[0].USDpriceBits,
           priceEUR = info[0].EURprice,
           priceEURBits = info[0].EURpriceBits,
           priceCNY = info[0].CNYprice,
           priceCNYBits = info[0].CNYpriceBits,
           conn = info[0].Con,
           ver = info[0].Ver,
           protocolVer = info[0].ProtocolVer,
           powDiff = info[0].powDifficulty,
           posDiff = info[0].posDifficulty,
           networkghps = info[0].networkghps,
           parkRates = info[0].ParkRates;
         
    db.BlockCollection.runCommand('count', function(err,docW){
        
        var pow = 401;
        var pos = docW.n-pow;
                    
        
        
    db.TxCollection.runCommand('count',function(err,txCount){
        
        var txCount = txCount.n;
        
        var date = parseInt(((new Date).getTime())/1000); 
        var oneDay = date - 86400;
        
        //var oneDay = 1347365420 - 86400;//this is for testing
    db.BlockCollection.find({'blockTimeStamp':{"$gte":oneDay}},function(err,docOD){
        
        
        var dayBlocks = docOD.length, //~144 blocks
            dayTransacted = 0,
            dayTransactedBits = 0,
            dayNumTrans = 0,
            dayTimeBlocks = [];
            
        for(var d=0; d<dayBlocks; d++){
            
            dayTransacted = dayTransacted + docOD[d]["blockTotRec"];
            dayTransactedBits = dayTransactedBits + docOD[d]["blockTotRecBits"];
            dayNumTrans = dayNumTrans + docOD[d]["blockNumTrans"];
            var dayBlockType = docOD[d]["blockType"];
            
           
            
            var checkd = dayBlocks - d;
            if(checkd>1){
                var curTimeStamp = docOD[d]["blockTimeStamp"];
                var nxtTimeStamp = docOD[d+1]["blockTimeStamp"];
                var diffTimeStamp = nxtTimeStamp - curTimeStamp;
                dayTimeBlocks.push(diffTimeStamp);
            }
            
            
            
            
            
            
        }//for loop one day   
        
        var totDayTimeBlocks = 0;
        for (var z=0; z < dayTimeBlocks.length; z++){
         
            totDayTimeBlocks = totDayTimeBlocks + dayTimeBlocks[z];            
            
        }
        
        var avgDayTimeBlocks =  (totDayTimeBlocks / dayTimeBlocks.length) / 60 ; //this will be in minutes
        
            avgDayTimeBlocks = parseFloat(avgDayTimeBlocks.toFixed(2));
        
        res.send(
            {
              heightInt:height,
              height:numeral(height).format('0,0'),
              sSupply:sSupply,
              bSupply:bSupply,
              marketCap:sSupply*priceUSD,
              marketCapBits:bSupply*priceUSDBits,
              priceUSD:priceUSD,
              priceUSDBits:priceUSDBits,
              priceEUR:priceEUR,
              priceEURBits:priceEURBits,
              priceCNY:priceCNY,
              priceCNYBits:priceCNYBits,
              conn:numeral(conn).format('0,0'),
              ver:ver,
              protocolVer:protocolVer,
              powDiff:powDiff,
              posDiff:posDiff,  
              networkghps:numeral(networkghps).format('0,0'),
              posInt:pos,
              pos:numeral(pos).format('0,0'),
              powInt:pow,
              pow:numeral(pow).format('0,0'),
              txCount:numeral(txCount).format('0,0'),
              dayBlocksInt:dayBlocks,
              dayBlocks:numeral(dayBlocks).format('0,0'),
              dayTransacted:numeral(dayTransacted).format('0,0.[000000]'),
              dayTransactedBits:numeral(dayTransactedBits).format('0,0.[000000]'),
              dayTransactedInt:dayTransacted,
              dayTransactedBitsInt:dayTransactedBits,
              dayNumTrans:numeral(dayNumTrans).format('0,0'),
              avgDayTimeBlocks:avgDayTimeBlocks,
              parkRates:parkRates
                
                
                
                
            });
            
    });
        
           });
        
             
    });  
    });
    
    
};

//-----------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------STATUS INFO API------------------------------------------------------------------------------

exports.statusInfoAPI = function(req, res){
  
    
     db.StatusCollection.find({_id:'statusInfo'},function(err,info){
        
        
       var height = info[0].BlockCount,
           sSupply = info[0].SharesSupply,
           bSupply = info[0].BitsSupply - 4040000,
           priceUSD = info[0].USDprice,
           conn = info[0].Con,
           ver = info[0].Ver,
           protocolVer = info[0].ProtocolVer,
           powDiff = info[0].powDifficulty,
           posDiff = info[0].posDifficulty,
           networkghps = info[0].networkghps,
           parkRates = info[0].ParkRates;
         
    db.BlockCollection.find({'blockType':'PoW'}, function(err,docW){
        
        var pow = docW.length;
        var pos = height-pow;
                    
        
        
    db.TxCollection.runCommand('count',function(err,txCount){
        
        var txCount = txCount.n;
    
        
        res.send(
            {
              heightInt:height,    
              height:numeral(height).format('0,0'),
              sSupplyInt:sSupply,
              sSupply:numeral(sSupply).format('0,0'),
              bSupplyInt:bSupply,
              bSupply:numeral(bSupply).format('0,0'),
              marketCap:numeral(sSupply*priceUSD).format('0,0'),
              priceUSD:priceUSD,
              connInt:conn,
              conn:numeral(conn).format('0,0'),
              ver:ver,
              protocolVer:protocolVer,
              powDiffInt:powDiff,
              powDiff:numeral(powDiff).format('0,0'),
              posDiffInt:posDiff,
              posDiff:numeral(posDiff).format('0,0'),  
              networkghps:numeral(networkghps).format('0,0'),
              posInt:pos,
              pos:numeral(pos).format('0,0'),
              powInt:pow,
              pow:numeral(pow).format('0,0'),
              txCountInt:txCount,
              txCount:numeral(txCount).format('0,0'),
              parkRates:parkRates
                      
            
            });
        
        
           });
        
           
    });  
    });
    
    
};