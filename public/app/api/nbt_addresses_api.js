var db = require('mongojs').connect('mongodb://<username>:<password>@127.0.0.1:27017/BlockDB',['BlockCollection', 'BitsAddressCollection', 'StatusCollection', 'TxCollection' ]);
var moment = require('moment');
var numeral = require('numeral');



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





