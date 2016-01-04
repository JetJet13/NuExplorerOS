from __future__ import division
import time
import pymongo
from bitcoinrpc.authproxy import AuthServiceProxy



client = pymongo.MongoClient("127.0.0.1",27017)
#client.admin.authenticate("<username>","<password>")
BDB = client.BlockDB
#BCL = BDB.blockCollection
BCT = BDB.BlockCollection
TCL = BDB.TxCollection
ICL = BDB.InputTxCollection
SCL = BDB.StatusCollection
MCL = BDB.MotionCollection
VCL = BDB.VoteCollection
SACL = BDB.SharesAddressCollection
BACL = BDB.BitsAddressCollection

access = AuthServiceProxy("http://user:pass@127.0.0.1:14001")

#AUTHOR: JOHNY GEORGES
#DATE: 29/04/2014
# HEXHASHREVERSER IS USED FOR PREV.BLOCK[v] HASH, MERKLE ROOT, BITS, RAW BLOCK[v] HASH ETC. 
# GETDIFFICULT WILL SPIT OUT THE DIFFICULTY OF THE BLOCK

start_time = time.time()

blk01 = "C:/users/home/appdata/roaming/nu/blk0001.dat"
blk02 = "C:/users/home/appdata/roaming/nu/blk0002.dat"
blk   = ""


print "no_sleeping"
getLeftOffBlock = SCL.find({"_id":"addressLeftOff"})[0]["blockHeight"]
print  "getLeftOffBlock",getLeftOffBlock
addresses = []
bCount = BCT.count()
allTrans = TCL.find({"forBlock":{ "$gt":getLeftOffBlock, "$lt":bCount } }).sort("forBlock",-1)
num_allTrans = allTrans.count()
print num_allTrans
w = 0
for each in allTrans:
    print num_allTrans - w, "more to go"
    trans_type = each["tx_type"]
    tx_chain = each["chain"]
    addressList = []
    addresses = set()
    txHash = each["_id"]
    inCount = each["TXdetails"]["inCount"]
    outCount = each["TXdetails"]["outCount"]
    transIndex = each["TXdetails"]["tx_index"]
    txTimeStamp = each["TXdetails"]["tx_timeStamp"]
    forBlock = each["forBlock"]
    tx_blockHash = each["blockHash"]   
    Addresses = each["Addresses"]
    
    for k in Addresses:
        if k != "None" and k!= "Nonstandard" and k != "Coinbase":
            if trans_type == "53":                
                isNewAddress = SACL.find({"_id":k}).count()
                                
                if isNewAddress == 0:
                    SACL.insert({"_id":k,"type":trans_type,"num_trans":1 ,"lastSeen":tx_blockHash,"lastSeenHeight":forBlock, "balance":0,"num_inputs":0,"num_outputs":0, "o_num_inputs":0  , "o_num_outputs":0, "timeStamp":txTimeStamp,"firstSeen":tx_blockHash})
                else:
                    if tx_chain == "main":
                        SACL.update({"_id":k},{"$inc":{"num_trans":1 } })
            
            else:
                isNewAddress = BACL.find({"_id":k}).count()
                
                if isNewAddress == 0:
                    BACL.insert({"_id":k,"type":trans_type, "num_trans":1, "lastSeen":tx_blockHash,"lastSeenHeight":forBlock, "balance":0,"num_inputs":0,"num_outputs":0, "o_num_inputs":0  , "o_num_outputs":0,"timeStamp":txTimeStamp,"firstSeen":tx_blockHash})
                else:
                    if tx_chain == "main":
                        BACL.update({"_id":k},{"$inc":{"num_trans":1 } })
            
    
    for i in xrange(0,inCount):
        
        string_i = str(i)
        inTx = each["TXinputs"][i]["prevOut"]["inTx"]
        txIndex = each["TXinputs"][i]["prevOut"]["index"]
        
        if txIndex < 0:
            gigi = "coinbase"
            
        else:         
            inSearch = TCL.find({"_id":str(inTx)})             
            for g in inSearch:
                getInput = g["TXoutputs"][txIndex]
                inputAddress = getInput["Address"]
                inputVal     = getInput["outVal"]
                if tx_chain == "main" and trans_type == "53":#NUSHARES MAIN
                    SACL.update({"_id":inputAddress},{"$set":{"lastSeen": tx_blockHash,"lastSeenHeight":forBlock },"$inc":{"balance":-1*inputVal,"num_inputs":1} })
                
                elif tx_chain == "main" and trans_type != "53":#NUBITS MAIN
                    BACL.update({"_id":inputAddress},{"$set":{"lastSeen": tx_blockHash,"lastSeenHeight":forBlock },"$inc":{"balance":-1*inputVal,"num_inputs":1} })
                
                elif tx_chain == "orphan" and trans_type == "53":#NUSHARES ORPHAN
                    SACL.update({"_id":inputAddress},{"$inc":{"o_num_inputs":1} })
                
                elif tx_chain == "orphan" and trans_type != "53":# NUBITS ORPHAN
                    BACL.update({"_id":inputAddress},{"$inc":{"o_num_inputs":1} })
                  
                
                        
    for o in xrange(0,outCount):
        
        getOut    = each["TXoutputs"][o]        
        outputAddress   = getOut["Address"]
        outputVal = getOut["outVal"]
        if outputAddress != "None" and outputAddress != "Nonstandard" and outputAddress !="Parked NuBits":
            
            if tx_chain == "main" and trans_type == "53":#NUSHARES MAIN
                SACL.update({"_id":outputAddress},{"$set":{"lastSeen": tx_blockHash,"lastSeenHeight":forBlock },"$inc":{"balance":outputVal,"num_outputs":1} })
            
            elif tx_chain == "main" and trans_type != "53":#NUBITS MAIN
                BACL.update({"_id":outputAddress},{"$set":{"lastSeen": tx_blockHash,"lastSeenHeight":forBlock },"$inc":{"balance":outputVal,"num_outputs":1} })
            
            elif tx_chain == "orphan" and trans_type == "53":#NUSHARES ORPHAN
                SACL.update({"_id":outputAddress},{"$inc":{"o_num_outputs":1} })
            
            elif tx_chain == "orphan" and trans_type != "53":# NUBITS ORPHAN
                SACL.update({"_id":outputAddress},{"$inc":{"o_num_outputs":1} })
            
    w+=1
    if w == 1:
        SCL.update({"_id":"addressLeftOff"},{"$set":{"blockHeight":forBlock}})
        
 

elapsed_time = time.time() - start_time

print "it took %s seconds " % elapsed_time
