exports.db = require('mongojs').connect('mongodb://<username>:<password>@127.0.0.1:27017/BlockDB',
	[
	'BlockCollection',
	'ChartCollection',
	'InputTxCollection',
	'MotionCollection',
	'OrphanBlockCollection',
	'OrphanTxCollection',
	'PeerCollection',
	'SharesAddressCollection',
	'StatusCollection',
	'TxCollection',
	'VoteCollection'
	]);
exports.moment = require('moment');
exports.numeral = require('numeral');

exports.showLocalDate = function (timestamp){
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

exports.appear = function (a,i){
 var result = 0;
 for(var o in a)
  if(a[o] == i)
   result++;
 return result;
}