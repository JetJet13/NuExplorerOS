from __future__ import division
import time
import pymongo
from bitcoinrpc.authproxy import AuthServiceProxy



client = pymongo.MongoClient()
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

start_time = time.time()

print "BlockChain Parsing in Progress..."
start = 42000
end = access.getblockcount()

for x in xrange(start,end):
    check = BCT.find({"blockHeight":x}).count()
    if check > 1:
        print "Double!", cursor.fetchone()
    elif check == 0:
	    print "Missing block",x