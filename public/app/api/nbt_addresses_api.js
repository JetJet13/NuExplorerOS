var db = require('./api.tools.js').db;
var moment = require('./api.tools.js').moment;
var numeral = require('./api.tools.js').numeral;



//-------------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------ALL PEERS------------------------------------------------------------------------------

exports.topBitsAddresses = function(req,res){
        
    db.StatusCollection.find({"_id":"statusInfo"},function(err,sInfo){
        
        if (err !==null){
            console.log(err);
        }
        else{
            
            var NBTsupply = sInfo[0].BitsSupply;
            
        }
    
    db.BitsAddressCollection.find({}).sort({"balance":-1} ,function(error,peerDoc){
        
         if (error !==null){
            console.log(err);
        }
        else{
            var pInfo = [];
            for(var b=0;b<100;b++){
                peerDoc[b].rank = b+1;
                pInfo.push(peerDoc[b]);
            }
        res.send({'NBTsupply':NBTsupply ,"info":pInfo})
        }
        
        
        });            
    
    });//status collection query

    
};





