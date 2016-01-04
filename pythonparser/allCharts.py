from __future__ import division
import pymongo
from bitstring import BitArray
import hashlib
import time
import os

def hexHashReverser(bit):
    
    step1 = BitArray(bit)
    
    step2 = step1.hex
    
    step3 = step2[::-1]
   
    step4 = len(step2)
    string=""
    for b in range(0,step4,2):
        revString = step3[b:(b+2)]
        string += revString[::-1]

    return string

def computeBlockHash(rawHash):
    
    initial_step = "0x" + rawHash
    primary_step = BitArray(initial_step)
    step0 = primary_step.bytes
    
    step1 = hashlib.sha256(step0)
    step2 = step1.digest()
     
    step3 = hashlib.sha256(step2)
    step4 = step3.hexdigest()
    
    step5 = "0x" + step4 
    step6 = BitArray(step5)
    
    step7 = hexHashReverser(step6)
    return step7

def getBigEndian(hex_val):
    
    step0 = "0x" + hex_val
    step1 = BitArray(step0)
    
    step2 = step1.hex
    
    step3 = step2[::-1]
   
    step4 = len(step2)
    string=""
    for b in range(0,step4,2):
        revString = step3[b:(b+2)]
        string += revString[::-1]

    return string

def getLitEndian(hex_val):
    
    step0 = "0x"+ hex_val
    step1 = BitArray(step0) 
    
    step2 = step1.uintle
    
    return step2


def getDifficult(bits):
    step0 = getBigEndian(bits)    
    step1 = "0x"+step0
    step2 = BitArray(step1)
    step3 = step2.hex
    
    first_pair ="0x" + step3[:2]
    firstPair = BitArray(first_pair)
    
    second_pair ="0x" + step3[2:8]
    secondPair = BitArray(second_pair)
    
    firstPairVal = firstPair.int
    secondPairVal = secondPair.int
    
    formula = 2**(8*(firstPairVal -3))
    bitsDec = secondPairVal * formula
    
    highestDifficulty = BitArray("0x00000000FFFF0000000000000000000000000000000000000000000000000000")
    highDiffDec = highestDifficulty.int
    
    answer = round(highDiffDec/bitsDec,2)
    return answer

def f7(seq):
    seen = set()
    seen_add = seen.add
    return [ x for x in seq if x not in seen and not seen_add(x)]


client = pymongo.MongoClient("127.0.0.1",27017)
#client.admin.authenticate("<username>","<password>")
BDB = client.BlockDB
#BCL = BDB.blockCollection
BCT = BDB.BlockCollection
CCT = BDB.ChartCollection

pofs=0
pofw=0

print "sleeping"
time.sleep(5)
print "done sleeping"
#blk01 = "/root/.nu/blk0001.dat"
#blk02 = "/root/.nu/blk0002.dat"
#blk   = ""
blk01 = "C:/users/home/appdata/roaming/nu/blk0001.dat"
blk02 = "C:/users/home/appdata/roaming/nu/blk0002.dat"
blk   = ""
if os.path.isfile(blk02):
    blk = blk02
    print "blk02 found"
else:
    blk = blk01

fi = open(blk,"rb")

data=fi.read()
hex_data =  data.encode('hex')

magic_number = "e6e8e9e5"
block = hex_data.split(magic_number)

print len(block)
del block[1000:] # the first element in the list is blank, so we get rid of it
del block[0]
wed = f7(block)
last_blocks = len(wed)
print last_blocks,"len of wed"
x=0
z=0
p=0
s=0
wowo = [] 
gigiList =[]
orphanList = []
officialList = []
latestblockHash = computeBlockHash(wed[len(wed)-1][8:168])
latestprevHash = getBigEndian(wed[len(wed)-1][16:80])

gigiList.append({"blockHash":latestblockHash,"blockprevHash":latestprevHash})
del wed[len(wed)-1]
for each in reversed(wed):
    blockTimeStamp = getLitEndian(each[144:152])*1000
    blockHash = computeBlockHash(each[8:168])
    blockPrevHash = getBigEndian(each[16:80])
    if gigiList[x]["blockprevHash"] == blockHash:
        gigiList.append({"blockHash":blockHash, "blockprevHash":blockPrevHash})
        officialList.append(each)
        x+=1
        
    else:
        
        s+=1
        #print blockHash,blockPrevHash
    if x % 1440 == 0:
        orphanList.append([blockTimeStamp,s])
        s = 0 
print x,"x"
del wed
    
print len(officialList),"len of official lists"
start = 0
reorderList = []
for each in reversed(officialList):
    reorderList.append(each)

print len(reorderList),"reorderList length"

shortBlock = []
for each in xrange(start,len(reorderList)):
    shortBlock.append(reorderList[each])

chartOrphanList = []
for each in reversed(orphanList):
    chartOrphanList.append(each)


CCT.update({"_id":"orphan"},{"orph":chartOrphanList})
posDiff_list = []
S_list = []
B_list = []
num_trans_S = 0
num_trans_B = 0
posDiff = 0
count = 0
getAllBlocks = BCT.find({}).sort("blockHeight")
for each in getAllBlocks:
    
    blockTimeStamp = each["blockTimeStamp"]*1000
    #print blockTimeStamp
    num_S_tx = each["blocknumTxS"]
    num_B_tx = each["blocknumTxB"]
    blockType = each["blockType"]
    
    if blockType == "PoS":
        diff = each["blockDifficulty"]
        #print diff
    else:
        diff = 0
    
    #posDiff += diff
    num_trans_S += num_S_tx
    num_trans_B += num_B_tx
    
    if count % 1440 == 0:
        #print "posDiff ->",posDiff,"diff ->",diff
        B = [blockTimeStamp,num_trans_B]
        S = [blockTimeStamp,num_trans_S]
        D = [blockTimeStamp,diff]
        
        B_list.append(B)
        S_list.append(S)
        posDiff_list.append(D)
        
        #posDiff = 0
        num_trans_S = 0
        num_trans_B = 0
    count +=1
CCT.update({"_id":"diff"},{"pos":posDiff_list})
CCT.update({"_id":"numtrans"},{"Bits":B_list,"Shares":S_list})
print "done updating..."
            
        
        
        
        
        
        

