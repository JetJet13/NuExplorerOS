var express  = require('express');
var app      = express();	
var path = require('path');
var numeral = require('numeral');
var moment = require('moment');
var favicon = require('static-favicon');
var logger = require('morgan');
var http = require('http');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ws = require('ws').Server;		
var routes = require('./public/app/index.js');
var loggerWinston = require('./public/app/logger.js');
var block = require('./public/app/api/blocks_api');
var tx = require('./public/app/api/transactions_api');
var address = require('./public/app/api/address_api');
var status = require('./public/app/api/status_api');
var charts = require('./public/app/api/charts_api');
var votes = require('./public/app/api/vote_api');
var motions = require('./public/app/api/motions_api');
var peers = require('./public/app/api/peers_api');
var NSRaddresses = require('./public/app/api/nsr_addresses_api');
var NBTaddresses = require('./public/app/api/nbt_addresses_api');
var OplogWatcher = require('mongo-oplog-watcher');

var oplogTx = new OplogWatcher({
  host:"mongodb://<username>:<password>@localhost", oplogDb:'local?authSource=admin', ns: "BlockDB.TxCollection"
}); 

var oplogBlock = new OplogWatcher({
  host:"mongodb://<username>:<password>@localhost", oplogDb:'local?authSource=admin', ns: "BlockDB.BlockCollection"
}); 

var oplogStatus = new OplogWatcher({
  host:"mongodb://<username>:<password>@localhost", oplogDb:'local?authSource=admin', ns: "BlockDB.StatusCollection"
});


// configuration ===========================================
// view engine setup
app.set('views', path.join(__dirname, './public/app/pug'));
app.set('view engine', 'pug');
app.use(favicon());
app.use(logger('dev')); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(__dirname + '/public')); // set the static files location
app.set('port', 800);
app.set('/',routes);
app.get('/');
var server = http.createServer(app).listen(app.get('port'),function() {
    console.log("App listening on port " + app.get('port'));
});


var webSocket = new ws({server:server});
webSocket.on('connection', function connection(ws) {
  console.log('WebSocket Server has found a client');
  
});
//create the broadcast function/method
webSocket.broadcast = function broadcast(data) {
  webSocket.clients.forEach(function each(client) {
    client.send(data);
  });
};

// io.sockets.on('connection', function (socket) {

// console.log("Connected to Websocket");

// });
//app.get('*', routes);
/*
app.route('/').get(function (req, res) {
  res.render('./app/jade/layout.jade');
});
*/

var router = express.Router(); 				// get an instance of the express Router

router.use(express.static(__dirname + './routes'));

router.route('/blockExist/:block_id').get(block.existsById);  

router.route('/blockDetails/:block_id/:page_id').get(block.blockDetails);

router.route('/blockInfo/:num').get(block.getBlockInfo);

router.route('/allblockInfo/:page_id').get(block.getAllBlockInfo);

router.route('/allorphanblockInfo/:page_id').get(block.getAllOrphanBlockInfo);

router.route('/orphanblockDetails/:block_id/:page_id').get(block.orphanblockDetails);

router.route('/transactionexist/:tx_id').get(tx.existsById);

router.route('/txDetails/:tx_id').get(tx.TxDetails);

router.route('/txInfo/:num').get(tx.getTxInfo);

router.route('/addressexist/:address_id').get(address.existsById);

router.route('/addressInfo/:address_id').get(address.addressInfo);

router.route('/addressDetails/:address_id/:page_id/:sort_id').get(address.addressDetails);

router.route('/addressOrphanDetails/:address_id/:page_id/:sort_id').get(address.addressOrphanDetails);

router.route('/statusDetails').get(status.statusDetails);

router.route('/statusInfo').get(status.statusInfo);

router.route('/posvpow').get(charts.pospow);

router.route('/diff').get(charts.diff);

router.route('/size').get(charts.size);

router.route('/numtrans').get(charts.numTrans);

router.route('/orphan').get(charts.orphan);

router.route('/solvedBy').get(charts.solvedBy);

router.route('/custodians').get(votes.allCustodians);

router.route('/successCustodians').get(votes.allSuccessCustodians);

router.route('/allBlockVotesCustodians/:cust_id/:page_id').get(votes.allBlockVotesCustodians);

router.route('/motions').get(motions.allMotions);

router.route('/successMotions').get(motions.allSuccessMotions);

router.route('/allBlockVotesMotions/:mo_id/:page_id').get(motions.allBlockVotesMotions);

router.route('/allPeers/:page_id').get(peers.allPeers);

router.route('/topSharesAddresses/').get(NSRaddresses.topSharesAddresses);

router.route('/topBitsAddresses/').get(NBTaddresses.topBitsAddresses);

app.use('/api', router);


//-----------------------------------------------------------------------------------------------------------------------
//---------------------------------------routing for Public API's--------------------------------------------------------


var routerAPI = express.Router(); 				// get an instance of the express Router
app.use('/api/v1', routerAPI);

routerAPI.route('/blockExist/:block_id').get(block.existsById);  

routerAPI.route('/blockLatest/').get(block.getBlockLatest);

routerAPI.route('/blockSingle/:block_id').get(block.getBlockSingle);

routerAPI.route('/txDetails/:tx_id').get(tx.TxDetails);

routerAPI.route('/txExist/:tx_id').get(tx.existsById);

routerAPI.route('/addressUnspent/:address_id').get(address.addressUnspent);

routerAPI.route('/addressexist/:address_id').get(address.existsById);

routerAPI.route('/addressInfo/:address_id').get(address.addressInfo);

routerAPI.route('/networkInfo').get(status.statusInfoAPI);


//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

oplogBlock.on('insert', function(doc) {
	
	console.log(doc.bl);
	var bHeight = doc.blockHeight;
    var bTimeStamp = doc.blockTimeStamp;
    var bSize = doc.blockSize;
    var bNumTrans = doc.blockNumTrans;
    var bTotRec = doc.blockTotRec;
    var bType = doc.blockType;
    var bCDD = doc.blockCDD;
    var bTotRecBits = doc.blockTotRecBits;
    var bSolvedBy = doc.blockSolvedBy;
 	var date = new Date().getTime();
    
    if (date/1000 - bTimeStamp < 6000){
        // console.log('found new block',doc);
        webSocket.broadcast(JSON.stringify({"type": "block", "info": {
                                
                                height:bHeight,
                                timestamp:bTimeStamp*1000,
                                size:bSize,
                                numTrans:bNumTrans,
                                solvedBy:bSolvedBy,
                                totRec:bTotRec,
                                totRecBits:bTotRecBits,
                                cdd:bCDD
                                }
        }));
        
        
        
        
        
    }
    
    
});

oplogTx.on('insert', function(doc) {
	
	var hash = doc._id;
    var timeStamp = doc.TXdetails.tx_timeStamp;
    var totRec = doc.TXdetails.totRec;
    var forBlock = doc.forBlock;
    
    if (forBlock<0){
        
         webSocket.broadcast(JSON.stringify({
         "type": "tx", 
         "info": {
                    hash:hash,
                    timestamp:timeStamp*1000,
                    totRec:totRec
                }
        }));
    						
    }
    
});


oplogStatus.on('update', function(doc) {
	// console.log('UPDATED STATUS',doc);
    
     
    webSocket.broadcast(JSON.stringify({
         "type": "status", 
         "info": {
                    conn:doc.Con,
                    blocks:doc.BlockCount,
                    sSupply:doc.SharesSupply,
                    bSupply:doc.BitsSupply - 4040000,//4,040,000 NBT are being held in reserve. adjust manually when told so.
                    USDprice:doc.USDprice,
                    USDpriceBits:doc.USDpriceBits,
                    EURprice:doc.EURprice,
                    EURpriceBits:doc.EURpriceBits,
                    CNYprice:doc.CNYprice,
                    CNYpriceBits:doc.CNYpriceBits
                }
        }));  
    
});


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

