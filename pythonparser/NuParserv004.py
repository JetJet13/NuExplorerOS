from __future__ import division
import time
import hashlib
from bitstring import BitArray
from bitcoinrpc.authproxy import AuthServiceProxy
import pymongo
import os
from operator import itemgetter
from urllib2 import Request, urlopen
import json


client = pymongo.MongoClient("127.0.0.1",27017)
BDB = client.BlockDB
#BCL = BDB.blockCollection
BCT = BDB.BlockCollection
TCL = BDB.TxCollection
ICL = BDB.InputTxCollection
SCL = BDB.StatusCollection
VCL = BDB.VoteCollection
PCL = BDB.PeerCollection
MCL = BDB.MotionCollection

#r = requests.get('https://btc-e.com/api/2/ppc_usd/ticker')
#print r.json()

access = AuthServiceProxy("http://user:pass@127.0.0.1:14001")
getInfo = access.getinfo()
BlockCount =  getInfo["blocks"]
#getDifficulty = access.getdifficulty()
#networkghps = access.getnetworkghps()
#print getInfo
#SCL.update({"_id":"statusInfo"},{"USDprice":1,"USDvol":0,"MoneySupply":int(getInfo["moneysupply"]),"BlockCount":getInfo["blocks"], "Con":getInfo["connections"], "Ver":getInfo["version"],"powDifficulty":int(getInfo["difficulty"]),"posDifficulty":int(getDifficulty["proof-of-stake"]),"ProtocolVer":getInfo["protocolversion"],"networkghps":int(networkghps)})
#print "done"
print BlockCount,"this is the main blockcount"

#AUTHOR: JOHNY GEORGES
#DATE: 29/04/2014
# HEXHASHREVERSER IS USED FOR PREV.BLOCK[v] HASH, MERKLE ROOT, BITS, RAW BLOCK[v] HASH ETC. 
# GETDIFFICULT WILL SPIT OUT THE DIFFICULTY OF THE BLOCK

def display_time(seconds):
    print "minutes",seconds
    answer = []
    result = ""
    intervals = (('year', 525949),('month', 43829),('week', 10080 ),('day', 1440 ),('hour', 60),('minute', 1))    
    suffix = "s"
    for each in intervals:
        interval_sec = each[1]
        modo = seconds//interval_sec
        rojo = seconds//interval_sec
        
        if modo != 0:            
            if modo > 1:                
                mojo = str(modo)+" "+each[0]+suffix
                print mojo
                answer.append({"duration":modo,"type":each[0]+suffix})
                seconds -= interval_sec*rojo
                print "minutes minus",seconds
            else:
                jojo = str(modo)+" "+each[0]
                print jojo
                answer.append({"duration":modo,"type":each[0]})
                seconds -= each[1]
                print "minutes minus 1",seconds
    r=0
    for each in answer:
        dur = each["duration"]
        typ = each["type"]
        if dur==4 and typ=="weeks":
            answer[r-1]["duration"] +=1
            del answer[r]
            r-=1
            
        elif dur==7 and typ=="days":
            answer[r-1]["duration"] +=1
            del answer[r]
            r-=1
            
        elif dur==24 and typ=="hours":
            answer[r-1]["duration"] +=1
            del answer[r]
            r-=1
            
        elif dur==60 and typ=="minutes":
            answer[r-1]["duration"] +=1
            del answer[r]
            r-=1
        r+=1
        
    q=0
    for each in answer:
        dur = each["duration"]
        typ = each["type"]
        if dur==12 and typ=="months":
            answer[q]["type"] = "year"
            answer[q]["duration"] = 1
            
        if dur==4 and typ=="weeks":
            answer[q]["type"] = "month"
            answer[q]["duration"] = 1
            
        elif dur==7 and typ=="days":
            answer[q]["type"] = "week"
            answer[q]["duration"] = 1
            
        elif dur==24 and typ=="hours":
            answer[q]["type"] = "day"
            answer[q]["duration"] = 1
            
        elif dur==60 and typ=="minutes":
            answer[q]["type"] = "hour"
            answer[q]["duration"] = 1
            
        q+=1
    if len(answer)>1:
        for x in xrange(0,2):
            result += str(answer[x]["duration"])+" "+answer[x]["type"]+" "
    else:
        result += str(answer[0]["duration"])+" "+answer[0]["type"]+" "
     
    return result

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
    
    answer = float(highDiffDec/bitsDec)
    return answer

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

def computeTransHash(rawHash):
    
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
 
#address must be in decimal form before entering it into base58encode
def base58encode(dec_address):
    
    b58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    b58base = len(b58chars)    
    
    answer = ""
    while dec_address >=1:
        modulo = dec_address % b58base
        answer = b58chars[modulo] + answer
        dec_address = int( (dec_address - modulo) // b58base )
        
    return answer
__b58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
__b58base = len(__b58chars)
b58chars = __b58chars
def b58decode(v, length = None):
    """ decode v into a string of len bytes
    """
    long_value = 0
    for (i, c) in enumerate(v[::-1]):
        long_value += __b58chars.find(c) * (__b58base**i)

    result = bytes()
    while long_value >= 256:
        div, mod = divmod(long_value, 256)
        result = chr(mod) + result
        long_value = div
    result = chr(long_value) + result

    nPad = 0
    for c in v:
        if c == __b58chars[0]: nPad += 1
        else: break

    result = chr(0)*nPad + result
    if length is not None and len(result) != length:
        return None

    return result
    
def getAddress(hex_string,tx_type):
    
    step0 = "0x" + hex_string
    step1 = BitArray(step0)
    
    step2 = step1.bytes
    step3 = hashlib.sha256(step2)
    step4 = step3.digest()
    
    step5 = hashlib.new("ripemd160", step4)
    step6 = step5.hexdigest() 
    
    if tx_type == '53':
        
        step7 = "3F" + step6 
    
    else: 
        step7 = "19" + step6 
        
    step8 = "0x"+ step7
    step9 = BitArray(step8)
    
    step10 = hashlib.sha256(step9.bytes)
    step11 = step10.digest()
    
    step12 = hashlib.sha256(step11)
    step13 = step12.hexdigest()
    
    check_sum = step13[0:8]
    
    step14 = step7 + check_sum 
    
    step15 = "0x"+step14
    
    step16 = BitArray(step15) 
    step17 = step16.int
    
    step18 = base58encode(step17) 
    
    return step18

def getAddress20byte(hex_string, tx_type):
    
    if tx_type == "53":
        
        step0 = "0x3F" + hex_string #3F hex = 63Dec. = S
    else:
        
        step0 = "0x19" + hex_string #19 hex = 25Dec. = B
        
    step1 = BitArray(step0)
    
    step10 = hashlib.sha256(step1.bytes)
    step11 = step10.digest()
    
    step12 = hashlib.sha256(step11)
    step13 = step12.hexdigest()
    
    check_sum = step13[0:8]
    
    step14 = step0 + check_sum
    
    step15 = BitArray(step14) 
    
    step17 = step15.int
    
    step18 = base58encode(step17) 
    
    return step18

def getAddress20byteP2SH(hex_string, tx_type):#this is for pay-to-script-hash 20byte
    
    if tx_type == "53":
        
        step0 = "0x40" + hex_string #40 hex = 63Dec. = S
        
    else:
        
        step0 = "0x1A" + hex_string #20 hex = 25Dec. = B
        
    step1 = BitArray(step0)
    
    step10 = hashlib.sha256(step1.bytes)
    step11 = step10.digest()
    
    step12 = hashlib.sha256(step11)
    step13 = step12.hexdigest()
    
    check_sum = step13[0:8]
    
    step14 = step0 + check_sum
    
    step15 = BitArray(step14) 
    
    step17 = step15.int
    
    step18 = base58encode(step17) 
    
    return step18

def getHash160(hex_string):
    step0 = "0x" + hex_string
    step1 = BitArray(step0)
    
    step2 = step1.bytes
    step3 = hashlib.sha256(step2)
    step4 = step3.digest()
    
    step5 = hashlib.new("ripemd160", step4)
    step6 = step5.hexdigest() 
    
    return step6

def f7(seq):
    seen = set()
    seen_add = seen.add
    return [ x for x in seq if x not in seen and not seen_add(x)]

start_time = time.time()


blk01 = "/root/.nu/blk0001.dat"
blk02 = "/root/.nu/blk0002.dat"
blk   = ""
#blk01 = "C:/users/home/appdata/roaming/nu/blk0001.dat"
#blk02 = "C:/users/home/appdata/roaming/nu/blk0002.dat"
#blk   = ""


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

del block[0] # the first element in the list is blank, so we get rid of it
print len(block)

wed = f7(block)
print len(wed),"len of wed"
del block
x=0
z=0
gigiList =[]
orphanList = []
officialList = []
hundo = 0
onehundredblock = computeBlockHash(wed[len(wed)-501][8:168])
twohundredblock = computeBlockHash(wed[len(wed)-601][8:168])
threehundredblock = computeBlockHash(wed[len(wed)-701][8:168])
fourhundredblock = computeBlockHash(wed[len(wed)-801][8:168])
bSearch  = BCT.find({"_id":onehundredblock}).count()
verify_1 = access.getblock(onehundredblock)["height"]
is_mainchain_1 = access.getblockhash(verify_1)
print "is_mainchain_1",is_mainchain_1,onehundredblock
if bSearch == 0 and is_mainchain_1 != onehundredblock:
    #raise Exception("one hundred block not found.")
    bTwoSearch  = BCT.find({"_id":twohundredblock}).count()
    
    verify_2 = access.getblock(twohundredblock)["height"]
    is_mainchain_2 = access.getblockhash(verify_2)
    
    if bTwoSearch == 0 and is_mainchain_2 != twohundredblock:
        #raise Exception("one hundred & two hundred block not found.")
        bThreeSearch  = BCT.find({"_id":threehundredblock}).count()
        
        verify_3 = access.getblock(threehundredblock)["height"]
        is_mainchain_3 = access.getblockhash(verify_3)
        
        if bThreeSearch == 0 and is_mainchain_3 != threehundredblock:
            #raise Exception("one hundred & two hundred & three hundred block not found.")
            bFourSearch  = BCT.find({"_id":fourhundredblock}).count()
            
            verify_4 = access.getblock(fourhundredblock)["height"]
            is_mainchain_4 = access.getblockhash(verify_4)
            
            if bFourSearch == 0 and is_mainchain_4 != fourhundredblock:
                raise Exception("one hundred & two hundred & three hundred & four hundred block not found.")
                
            else:
                print "400 block was found"
                hundo = 801
        else:
            print "300 block was found"
            hundo = 701
    else:
        print "200 block was found"
        hundo = 601
else:
    print "100 hundred block was found."
    hundo = 501
        
print "hundo",hundo
latestblockHash = computeBlockHash(wed[len(wed)-1][8:168])
latestprevHash = getBigEndian(wed[len(wed)-1][16:80])
officialList.append(wed[len(wed)-1])
gigiList.append({"blockHash":latestblockHash,"blockprevHash":latestprevHash})

for each in xrange(len(wed)-1,len(wed)-hundo,-1):
    blockHash = computeBlockHash(wed[each][8:168])
    blockPrevHash = getBigEndian(wed[each][16:80])
    if gigiList[x]["blockprevHash"] == blockHash:
        gigiList.append({"blockHash":blockHash, "blockprevHash":blockPrevHash})
        officialList.append(wed[each])
        x+=1
        
    else:
        orphanList.append({"blockHash":blockHash, "blockprevHash":blockPrevHash})
        #print blockHash,blockPrevHash
print x,"x"
del wed

print len(officialList),"len of official lists"
start = BCT.count()
#start = 64200

reorderList = []
for each in reversed(officialList):
    reorderList.append(each)
print len(reorderList),"reorderList length"
shortBlock = []

START = start
END = BlockCount

h=0
for each in xrange(start-1,BlockCount):

    h+=1
    
print h,"h"

vov = len(reorderList)-h
print "vov before",vov
for each in xrange(0,h):
    shortBlock.append(reorderList[vov])
    vov+=1
    

print vov,"vov after"

officialList_len = len(officialList)


del officialList

   

start = BCT.count()
START = start
print "deleted block,officiallist, and wed"
print len(shortBlock),"len of shortblock"
#oneBlock = []
#oneBlock.append(block[10041])
#block = f7(block);
print "BlockChain Parsing in Progress..."
#---------------------------------------------------BLOCK PARSING STARTS HERE-------------------------------------------------------

BLOCKPPC = []
BLOCK = {}
TRANSACTIONS = []

TXdetails = {}
TXinputs = {}
TXoutputs = {}
v = 0
h= TCL.count()
PoS = 0
PoW = 0
fo = start
#NOTE: 42HEX = "B" in ASCII , 53HEX = "S" in ASCII 
print fo,"this is the last block u entered into mongo"
for each in shortBlock:
    print fo
    BLOCK[fo] = {'_id':[],"blockHash":[],"blockHeight":[],"blockSize":[],"blockVer":[],"blockPrevHash":[],"blockMrkRoot":[],"blockTimeStamp":[],\
                "blockBits":[],"blockDifficulty":[],"blockNonce":[],"blockNumTrans":[],"blockTotRec":[],"blockType":[],"blockSolvedBy":[],\
                "blockVotes":{"custodianVotes":[],"parkRateVotes":[],"motionHashVote":[]},"blockCustodianVotes":[],"blockCDD":0,"blockTotRecBits":[],"blocknumTxS":[],"blocknumTxB":[]}
    Trans = {}
    totRec= 0
    totRecBits= 0
    b_numTxS = 0
    b_numTxB = 0
    BLOCK[fo]["blockHeight"] = fo
   
    BLOCK[fo]["blockHash"] = computeBlockHash(each[8:168])
    print computeBlockHash(each[8:168])
    BLOCK[fo]["blockSize"] = getLitEndian(each[0:8])/1024
    
    BLOCK[fo]["blockVer"] = getLitEndian(each[8:16])
    
    BLOCK[fo]["blockPrevHash"] = getBigEndian(each[16:80])
    
    BLOCK[fo]["blockMrkRoot"] = getBigEndian(each[80:144])
    
    BLOCK[fo]["blockTimeStamp"] = getLitEndian(each[144:152])
    
    BLOCK[fo]["blockBits"] = getLitEndian(each[152:160])
    
    BLOCK[fo]["blockDifficulty"] = getDifficult(each[152:160])
    
    BLOCK[fo]["blockNonce"] = getLitEndian(each[160:168])
    
    BLOCK[fo]["_id"] = computeBlockHash(each[8:168])
    
    if BLOCK[fo]["blockNonce"]==0:
        BLOCK[fo]["blockType"]="PoS"
        #print "I found a PoS!"
    else:
        BLOCK[fo]["blockType"]="PoW"
 

    if each[168:170]=="fd" and each.find("01000000",168)==174: #for num. of tx in the block >255
        
        Transactions = []
        num_trans = getLitEndian(each[170:174])
        BLOCK[fo]["blockNumTrans"] = num_trans
        
        counter = 174
        
        if each.find("ffffffff0100000000000000000000000000",counter)>=122:
            PoS+=1
        else:
            PoW+=1
        z=0
    else:                                                   #for num. of tx in block <255
        
        Transactions = []
        num_trans = int(each[168:170],16)
        BLOCK[fo]["blockNumTrans"] = num_trans
        counter = 170
        if each.find("ffffffff0100000000000000000000000000",counter)>=118: 
            PoS+=1
        else:
            PoW+=1
            
    for r in xrange(0,num_trans):
        po = counter
        v+=1
        h+=1
        txTotRec = 0
        TXdetails[r]={"tx_index":h,"tx_num":[],"tx_Hash":[],"tx_ver":[],"tx_timeStamp":[],"inCount":[],"outCount":[],"endScript":[]}
        Trans[r]= {"TXdetails":[],"TXinputs":[],"TXoutputs":[],"_id":[],"forBlock":fo,"tx_type":[]}
        TXdetails[r]["tx_num"]=r
        tx_ver = each[counter+0:counter+8]
        TXdetails[r]["tx_ver"]=getLitEndian(tx_ver) 
        tx_timeStamp = each[counter+8:counter+16]
        TXdetails[r]["tx_timeStamp"]=getLitEndian(tx_timeStamp)
        tx_inCount = each[counter+16:counter+18]
        print "ver",tx_ver,tx_timeStamp,tx_inCount
        print "inCount",tx_inCount
        
#---------------------------------------------------INPUT PARSING-------------------------------------------------
        
        if tx_inCount =="fd" and each[counter+90:counter+94]=="0000":        #tx's with > 255 inputs
            
            tx_inCount = each[counter+16:counter+22]
            counter += len(tx_ver+tx_timeStamp+tx_inCount)
            tx_inCount_int = getLitEndian(tx_inCount[2:6])
            TXdetails[r]["inCount"]=(tx_inCount_int)
            c=0
        else:                                                               #tx's with < 255 inputs
            counter += len(tx_ver+tx_timeStamp+tx_inCount)
            #print counter                                                  
            tx_inCount_int = int(tx_inCount,16)
            TXdetails[r]["inCount"]=(tx_inCount_int)
        
        for i in xrange(0,tx_inCount_int):
            
            TXinputs[i] = {"num_trans":[],"prevOut":{"inTx":[],"index":[],"prevTimeStamp":[]},"inputs":{"in_num":[],"Address":[],"inVal":[],"inScript":[]}}
            TXinputs[i]["num_trans"] = r
            tx_inTx =each[counter:counter+64]
            print "inTx",tx_inTx
            tx_index =each[counter+64:counter+72]
            print "txIndex",tx_index
            TXinputs[i]["inputs"]["in_num"] = i
            TXinputs[i]["prevOut"]["inTx"]=getBigEndian(tx_inTx)
            if tx_index=="ffffffff":
                TXinputs[i]["prevOut"]["index"]= -1
            else:
                TXinputs[i]["prevOut"]["index"]=getLitEndian(tx_index)
            tx_inScriptLen =each[counter+72:counter+74]
            print "inScriptLength",tx_inScriptLen
            
#----------------------------------------INPUT SCRIPT PARSING-----------------------------------------------------
            
            if tx_inScriptLen=="fd" and each.find("ffffffff",counter+74)!=counter+580: # 74 + 506 = 580
                tx_inScriptLen =each[counter+72:counter+78]
                tx_inScriptLen_int = getLitEndian(tx_inScriptLen[2:6])*2
                tx_inScript =each[counter+78:counter + tx_inScriptLen_int + 78]
                TXinputs[i]["inputs"]["inScript"]=(tx_inScript)
                print "txInScript",tx_inScript
                tx_inSequence =each[counter + tx_inScriptLen_int + 78:counter + tx_inScriptLen_int + 86]
                print "txInSequence",tx_inSequence
                counter +=len(tx_inTx+tx_index+tx_inScriptLen+tx_inScript+tx_inSequence)
                #print counter
             
                
                
            else: 
                tx_inScriptLen_int = int(tx_inScriptLen,16)*2
                tx_inScript =each[counter+74:counter + tx_inScriptLen_int + 74]
                TXinputs[i]["inputs"]["inScript"]=(tx_inScript)
                print "tx_InScript", tx_inScript
                tx_inSequence =each[counter + tx_inScriptLen_int + 74:counter + tx_inScriptLen_int + 82]
                print "tx_InSequence" ,tx_inSequence
                counter +=len(tx_inTx+tx_index+tx_inScriptLen+tx_inScript+tx_inSequence)
                print counter
            Trans[r]["TXinputs"].append(TXinputs[i]) 

        
#-------------------OUTPUTS----------------------------------------------------------------------------------------
        
        tx_outCount =each[counter:counter+2]
        
        if tx_outCount=="fd"and each[counter+18:counter+22]=="0000":      #outputs > 255
            tx_outCount =each[counter:counter+6]
            print "txOutCount",tx_outCount
            tx_outCount_int = getLitEndian(tx_outCount[2:6])
            counter +=len(tx_outCount)
            k=0
            TXdetails[r]["outCount"]=tx_outCount_int
        else:                                                           #outputs <255
            
            tx_outCount_int = int(tx_outCount,16)
            TXdetails[r]["outCount"]=(tx_outCount_int)
            print "txOutCount",tx_outCount
            counter +=len(tx_outCount)
            
#-------------------------------------------OUTPUT PARSING--------------------------------------------------------
       
        for x in xrange(0,tx_outCount_int):
            TXoutputs[x]= {"tx_num":[],"out_num":[],"outVal":[],"outScript":[],"Address":[],"Hash160":[],"status":"unspent","txSpent":[]}
            TXoutputs[x]["tx_num"] = r
            outVal =each[counter:counter+16]
            print "outVal ", outVal
            if outVal == "0000000000000000":
                outScriptLen = each[counter+16:counter+18]
                #print "outScript",outScriptLen
                if outScriptLen == "00":
                    TXoutputs[x]["out_num"]=x
                    TXoutputs[x]["outVal"]= 0
                    TXoutputs[x]["outScript"]= "00"
                    TXoutputs[x]["outType"]= "00"
                    TXoutputs[x]["Address"]=("None")
                    TXoutputs[x]["Hash160"]="None"
                    counter += len(outVal + outScriptLen)
                else:
                    OP=""
                    OPcounter = counter
                    if each[counter+18:counter+22] == "6a51": #the script length is less than 255 bytes
                        outScriptLen = each[counter+16:counter+18]
                        print "outScriptLen",outScriptLen
                        outScriptLen_int = int(outScriptLen,16)*2
                        print "outScriptLen_int",outScriptLen_int
                        print "OPRETURN PARSE",each[counter+16:counter+40]
                        #print "WITHOUT PUSH STACK BYTE",each[counter+24:counter+38]
                        #print "WITH PUSH STACK BYTE",each[counter+26:counter+40]
                        
                        pushStack = each[counter+22:counter+24] #should be either 4c or 4d
                        
                        if pushStack!="4c" and each[counter+30:counter+32]=="00":
                            #no pushStack
                            pushy = False
                            OPcounter+=32
                            print " no pushStack",pushStack
                            #raise Exception("NO PUSHSTACK!")
                        elif pushStack =="4c" and each[counter+32:counter+34]=="00":
                            #with pushStack
                            pushy = True
                            OPcounter+=34
                            print "pushStack",pushStack
                            #raise Exception("WITH PUSHSTACK")
                        else:
                            raise Exception("ALL WRONG WITH PUSHSTACK")
                        
                        
                        
                        num_custodians = each[OPcounter:OPcounter+2]
                        print "num_custodians",num_custodians
                        if num_custodians!="00":
                            num_custodians_int = int(num_custodians,16)
                            print "There are custodianVotes",each[OPcounter:OPcounter+10]
                            for cu in xrange(0,num_custodians_int):
                                unit_type = each[OPcounter+2:OPcounter+4]#[36:38]
                                print "unit_type,'B' ",unit_type
                                nuBitAddress_len_int = 40
                                print "skippy",each[OPcounter:OPcounter+6]
                                p2sh = False
                                if each[OPcounter+4:OPcounter+6]=="00":
                                    print "WE GOT A SKIPPER!"
                                    #raise Exception("SKIPPY!")
                                    OPcounter+=2
                                elif each[OPcounter+4:OPcounter+6]=="01":
                                    p2sh = True
                                    OPcounter+=2
                                    
                                nuBitAddress = each[OPcounter+4:OPcounter+nuBitAddress_len_int+4]
                                print "nubit address hex and some more",each[OPcounter:OPcounter+nuBitAddress_len_int+4]
                                
                                if p2sh == True:
                                    cust_addy = getAddress20byteP2SH(nuBitAddress,"42")
                                else:
                                    cust_addy = getAddress20byte(nuBitAddress,"42")
                                p2sh = False
                                print cust_addy,"nuBitAddress Custodian"
                                nuBitAmount = each[OPcounter+nuBitAddress_len_int+4:OPcounter+nuBitAddress_len_int+20]
                                nuBitVal = getLitEndian(nuBitAmount)/10000
                                print nuBitVal,"nuBitVal"
                                BLOCK[fo]["blockVotes"]["custodianVotes"].append({"address":cust_addy,"amount":nuBitVal})
                                BLOCK[fo]["blockCustodianVotes"].append(cust_addy)
                                OPcounter += len(nuBitAmount+unit_type+nuBitAddress)
                            #raise Exception("I FOUND ONE!")
                            unsignedChar = each[OPcounter+2:OPcounter+4]#usually just 01
                            print "unsignedChar",unsignedChar
                            if unsignedChar =="01":
                                parkRate_type = each[OPcounter+4:OPcounter+6]#usually 42
                                print "parkRate_type",parkRate_type
                                num_parkRates = each[OPcounter+6:OPcounter+8]
                                num_parkRates_int = int(num_parkRates,16)
                                for vo in xrange(0,num_parkRates_int):
                                    multiple = each[OPcounter+8:OPcounter+10]
                                    print "multiple",multiple
                                    num_blocks =2**int(multiple,16)
                                    print "num_blocks",num_blocks
                                    rateAmount = each[OPcounter+10:OPcounter+26]
                                    rateVal = getLitEndian(rateAmount)/1000000000
                                    print "rateVal",rateVal
                                    BLOCK[fo]["blockVotes"]["parkRateVotes"].append({"type":parkRate_type,"blocks":num_blocks,"rate":rateVal})
                                    OPcounter += len(multiple+rateAmount)
                        
                                

                                #raise Exception("I FOUND ONE!")
                            elif unsignedChar =="00":
                                parkRate_type=""
                                print "no parkRate_type"
                            else:
                                raise Exception("PARK RATES UNKNOWN")
                            
                            
                            
                        elif num_custodians=="00":
                            print "There are no custodianVotes",each[OPcounter:OPcounter+10]
                            unsignedChar = each[OPcounter+2:OPcounter+4]#usually just 01
                            print "unsignedChar",unsignedChar
                            if unsignedChar =="01":
                                parkRate_type = each[OPcounter+4:OPcounter+6]#usually 42
                                print "parkRate_type",parkRate_type
                                num_parkRates = each[OPcounter+6:OPcounter+8]
                                num_parkRates_int = int(num_parkRates,16)
                                for vo in xrange(0,num_parkRates_int):
                                    multiple = each[OPcounter+8:OPcounter+10]
                                    print "multiple",multiple
                                    num_blocks =2**int(multiple,16)
                                    print "num_blocks",num_blocks
                                    rateAmount = each[OPcounter+10:OPcounter+26]
                                    rateVal = getLitEndian(rateAmount)/1000000000
                                    print "rateVal",rateVal
                                    BLOCK[fo]["blockVotes"]["parkRateVotes"].append({"type":parkRate_type,"blocks":num_blocks,"rate":rateVal})
                                    OPcounter += len(multiple+rateAmount)
                        
                                

                                #raise Exception("I FOUND ONE!")
                            elif unsignedChar =="00":
                                parkRate_type=""
                                print "no parkRate_type"
                            else:
                                raise Exception("PARK RATES UNKNOWN")
                                                            
                        else:
                            raise Exception("Unsigned Char is off!")
                                                
                        if (getLitEndian(each[counter+26:counter+34]) >= 50000 and pushy==True) or (getLitEndian(each[counter+24:counter+32]) >= 50000 and pushy == False):
                            
                            if unsignedChar != "00" and num_parkRates == "00" and num_custodians == "00":
                                num_motionHash = each[OPcounter+8:OPcounter+10]
                            elif unsignedChar == "00" and num_custodians == "00":
                                num_motionHash = each[OPcounter+4:OPcounter+6]
                            elif unsignedChar == "00" and num_custodians != "00":
                                num_motionHash = each[OPcounter+4:OPcounter+6]
                            elif unsignedChar != "00" and num_custodians == "00":
                                num_motionHash = each[OPcounter+4:OPcounter+6]
                            else:                            
                                num_motionHash = each[OPcounter+8:OPcounter+10]
                            print num_motionHash
                            print each[OPcounter:OPcounter+20]
                            if num_motionHash == "fd":
                                #length of motion hashes > 255 bytes.
                                num_motions = getLitEndian(each[OPcounter+10:OPcounter+14])
                                OPcounter +=14
                            else:
                                num_motions = int(num_motionHash)
                                if unsignedChar != "00" and num_parkRates == "00" and num_custodians == "00":
                                    OPcounter+=10
                                elif unsignedChar == "00" and num_custodians == "00":
                                    OPcounter +=6
                                elif unsignedChar == "00" and num_custodians != "00":
                                    OPcounter +=6
                                elif unsignedChar != "00" and num_custodians == "00":
                                    OPcounter +=6                                
                                else:                            
                                    OPcounter +=10
                            for m in xrange(0,num_motions):
                                motionHash = getBigEndian(each[OPcounter:OPcounter+40])
                                print "motionHash",motionHash
                                BLOCK[fo]["blockVotes"]["motionHashVote"].append(motionHash)
                                OPcounter +=40
                        else:
                            motionHash = getBigEndian(each[counter+outScriptLen_int-22:counter+outScriptLen_int+18])
                            print "motionHash",motionHash
                            BLOCK[fo]["blockVotes"]["motionHashVote"].append(motionHash)
                        
                        outScript =each[counter+18:counter+outScriptLen_int+18]
                        outscript_decode = "OP_RETURN "+"OP_1 "+each[counter+22:counter+outScriptLen_int+18]
                        print "outscript_decode", outscript_decode
                        Address = "Nonstandard"
                        TXoutputs[x]["out_num"]=x
                        TXoutputs[x]["outVal"]=0
                        TXoutputs[x]["Address"]=Address
                        TXoutputs[x]["outScript"]= outscript_decode
                        TXoutputs[x]["outType"]= "OP_RETURN"
                        TXoutputs[x]["Hash160"]="None"
                        counter += len(outVal + outScript + outScriptLen)
                    elif each[counter+22:counter+26] == "6a51":                                       #the script length is greater than 255 bytes
                        outScriptLen = each[counter+16:counter+22]
                        print "outScriptLen",outScriptLen, "[2:6]",outScriptLen[2:6]
                        outScriptLen_int = getLitEndian(outScriptLen[2:6])*2
                        print "outScriptLen_int",outScriptLen_int
                        print "OPRETURN PARSE",each[counter+16:counter+40]
                        #print "WITHOUT PUSH STACK BYTE",each[counter+24:counter+38]
                        #print "WITH PUSH STACK BYTE",each[counter+26:counter+40]
                        
                        pushStack = each[counter+26:counter+28] #should be either 4c or 4d
                        
                        if pushStack!="4d" and each[counter+36:counter+38]=="00":
                            #no pushStack
                            pushy = False
                            OPcounter+=38
                            print "no pushStack",pushStack
                            #raise Exception("NO PUSHSTACK!")
                        elif pushStack=="4d" and each[counter+38:counter+40]=="00":
                            #with pushStack
                            pushy = True
                            OPcounter+=40
                            print "pushStack",pushStack
                            #raise Exception("WITH PUSHSTACK")
                        else:
                            raise Exception("ALL WRONG WITH PUSHSTACK")
                        
                        
                        num_custodians = each[OPcounter:OPcounter+2]
                        print "num_custodians",num_custodians
                        if num_custodians!="00":
                            num_custodians_int = int(num_custodians,16)
                            print "There are custodianVotes",each[OPcounter:OPcounter+10]
                            for cu in xrange(0,num_custodians_int):
                                unit_type = each[OPcounter+2:OPcounter+4]#[36:38]
                                print "unit_type,'B' ",unit_type
                                nuBitAddress_len_int = 40
                                print "skippy",each[OPcounter:OPcounter+6]
                                p2sh = False
                                if each[OPcounter+4:OPcounter+6]=="00":
                                    print "WE GOT A SKIPPER!"
                                    #raise Exception("SKIPPY!")
                                    OPcounter+=2
                                elif each[OPcounter+4:OPcounter+6]=="01":
                                    p2sh = True
                                    OPcounter+=2
                                    
                                nuBitAddress = each[OPcounter+4:OPcounter+nuBitAddress_len_int+4]
                                print "nubit address hex and some more",each[OPcounter:OPcounter+nuBitAddress_len_int+4]
                                
                                if p2sh == True:
                                    cust_addy = getAddress20byteP2SH(nuBitAddress,"42")
                                else:
                                    cust_addy = getAddress20byte(nuBitAddress,"42")
                                p2sh = False
                                print cust_addy,"nuBitAddress Custodian"
                                nuBitAmount = each[OPcounter+nuBitAddress_len_int+4:OPcounter+nuBitAddress_len_int+20]
                                nuBitVal = getLitEndian(nuBitAmount)/10000
                                print nuBitVal,"nuBitVal"
                                BLOCK[fo]["blockVotes"]["custodianVotes"].append({"address":cust_addy,"amount":nuBitVal})
                                BLOCK[fo]["blockCustodianVotes"].append(cust_addy)
                                OPcounter += len(nuBitAmount+unit_type+nuBitAddress)
                            #raise Exception("I FOUND ONE!")
                            unsignedChar = each[OPcounter+2:OPcounter+4]#usually just 01
                            print "unsignedChar",unsignedChar
                            if unsignedChar =="01":
                                parkRate_type = each[OPcounter+4:OPcounter+6]#usually 42
                                print "parkRate_type",parkRate_type
                                num_parkRates = each[OPcounter+6:OPcounter+8]
                                num_parkRates_int = int(num_parkRates,16)
                                for vo in xrange(0,num_parkRates_int):
                                    multiple = each[OPcounter+8:OPcounter+10]
                                    print "multiple",multiple
                                    num_blocks =2**int(multiple,16)
                                    print "num_blocks",num_blocks
                                    rateAmount = each[OPcounter+10:OPcounter+26]
                                    rateVal = getLitEndian(rateAmount)/1000000000
                                    print "rateVal",rateVal
                                    BLOCK[fo]["blockVotes"]["parkRateVotes"].append({"type":parkRate_type,"blocks":num_blocks,"rate":rateVal})
                                    OPcounter += len(multiple+rateAmount)
                        
                                

                                #raise Exception("I FOUND ONE!")
                            elif unsignedChar =="00":
                                parkRate_type=""
                                print "no parkRate_type"
                            else:
                                raise Exception("PARK RATES UNKNOWN")
                            
                            
                            
                        elif num_custodians=="00":
                            print "There are no custodianVotes",each[OPcounter:OPcounter+10]
                            unsignedChar = each[OPcounter+2:OPcounter+4]#usually just 01
                            print "unsignedChar",unsignedChar
                            if unsignedChar =="01":
                                parkRate_type = each[OPcounter+4:OPcounter+6]#usually 42
                                print "parkRate_type",parkRate_type
                                num_parkRates = each[OPcounter+6:OPcounter+8]
                                num_parkRates_int = int(num_parkRates,16)
                                for vo in xrange(0,num_parkRates_int):
                                    multiple = each[OPcounter+8:OPcounter+10]
                                    print "multiple",multiple
                                    num_blocks =2**int(multiple,16)
                                    print "num_blocks",num_blocks
                                    rateAmount = each[OPcounter+10:OPcounter+26]
                                    rateVal = getLitEndian(rateAmount)/1000000000
                                    print "rateVal",rateVal
                                    BLOCK[fo]["blockVotes"]["parkRateVotes"].append({"type":parkRate_type,"blocks":num_blocks,"rate":rateVal})
                                    OPcounter += len(multiple+rateAmount)
                        
                                

                                #raise Exception("I FOUND ONE!")
                            elif unsignedChar =="00":
                                parkRate_type=""
                                print "no parkRate_type"
                            else:
                                raise Exception("PARK RATES UNKNOWN")
                                                            
                        else:
                            raise Exception("Unsigned Char is off!")
                        
                        if (getLitEndian(each[counter+32:counter+40]) >= 50000 and pushy == True) or (getLitEndian(each[counter+30:counter+38]) >= 50000 and pushy == False):
                            
                            if unsignedChar != "00" and num_parkRates == "00" and num_custodians == "00":
                                num_motionHash = each[OPcounter+8:OPcounter+10]
                            elif unsignedChar == "00" and num_custodians == "00":
                                num_motionHash = each[OPcounter+4:OPcounter+6]
                            elif unsignedChar == "00" and num_custodians != "00":
                                num_motionHash = each[OPcounter+4:OPcounter+6]
                            elif unsignedChar != "00" and num_custodians == "00":
                                num_motionHash = each[OPcounter+4:OPcounter+6]                            
                            else:                            
                                num_motionHash = each[OPcounter+8:OPcounter+10]
                            
                            print num_motionHash
                            if num_motionHash == "fd":
                                #length of motion hashes > 255 bytes.
                                num_motions = getLitEndian(each[OPcounter+10:OPcounter+14])
                                OPcounter +=20
                            else:
                                num_motions = int(num_motionHash)
                                if unsignedChar != "00" and num_parkRates == "00" and num_custodians == "00":
                                    OPcounter+=10
                                elif unsignedChar == "00" and num_custodians == "00":
                                    OPcounter +=6
                                elif unsignedChar == "00" and num_custodians != "00":
                                    OPcounter +=6
                                elif unsignedChar != "00" and num_custodians == "00":
                                    OPcounter +=6                                
                                else:                            
                                    OPcounter +=10
                                    
                            for m in xrange(0,num_motions):
                                motionHash = getBigEndian(each[OPcounter:OPcounter+40])
                                print "motionHash",motionHash
                                BLOCK[fo]["blockVotes"]["motionHashVote"].append(motionHash)
                                OPcounter +=40
                        else:
                            motionHash = getBigEndian(each[counter+outScriptLen_int-18:counter+outScriptLen_int+22])
                            print "motionHash",motionHash
                            BLOCK[fo]["blockVotes"]["motionHashVote"].append(motionHash)
                        
                        outScript =each[counter+22:counter+outScriptLen_int+22]
                        outscript_decode = "OP_RETURN "+"OP_1 "+each[counter+26:counter+outScriptLen_int+14]
                        print "outscript_decode", outscript_decode
                        Address = "Nonstandard"
                        TXoutputs[x]["out_num"]=x
                        TXoutputs[x]["outVal"]=0
                        TXoutputs[x]["Address"]=Address
                        TXoutputs[x]["outScript"]= outscript_decode
                        TXoutputs[x]["outType"]= "OP_RETURN"
                        TXoutputs[x]["Hash160"]="None"
                        counter += len(outVal + outScript + outScriptLen)
                    
                    elif each[counter+18:counter+22] == "6a52": #the script length is less than 255 bytes (OP_2)
                        outScriptLen = each[counter+16:counter+18]
                        print "outScriptLen",outScriptLen
                        outScriptLen_int = int(outScriptLen,16)*2
                        print "outScriptLen_int",outScriptLen_int
                        print "OPRETURN PARSE",each[counter+16:counter+40]
                        isPushStack = each[counter+22:counter+24]
                        if isPushStack == "4c" and outScriptLen != "4f":
                            OPcounter +=2
                        parkRateScriptLen = each[OPcounter+22:OPcounter+24]
                        print "OP_2 parkRateScriptLen",parkRateScriptLen
                        unit_type = each[OPcounter+24:OPcounter+26]#usually '42'=Bits
                        print "OP_2 unit_type",unit_type
                        num_parkRates = each[OPcounter+26:OPcounter+28]
                        print "OP_2 num_parkRates",num_parkRates
                        if num_parkRates=="00":
                            print "OP_2 THERE ARE NO PARK RATES"
                        else:
                            OPcounter +=28
                            num_parkRates_int = int(num_parkRates,16)
                            for vo in xrange(0,num_parkRates_int):
                                multiple = each[OPcounter:OPcounter+2]
                                print "OP_2 multiple",multiple
                                num_blocks =2**int(multiple,16)
                                print "OP_2 num_blocks",num_blocks
                                rateAmount = each[OPcounter+2:OPcounter+18]
                                rateVal = getLitEndian(rateAmount)/1000000000
                                print "OP_2 rateVal",rateVal
                                OPcounter += len(multiple+rateAmount)
                        
                        
                        outScript =each[counter+18:counter+outScriptLen_int+18]
                        print "outScript",outScript
                        outscript_decode = "OP_RETURN "+"OP_2 "+each[counter+22:counter+outScriptLen_int+18]
                        print "outscript_decode", outscript_decode
                        Address = "Nonstandard"
                        TXoutputs[x]["out_num"]=x
                        TXoutputs[x]["outVal"]=0
                        TXoutputs[x]["Address"]=Address
                        TXoutputs[x]["outScript"]= outscript_decode
                        TXoutputs[x]["outType"]= "OP_RETURN"
                        TXoutputs[x]["Hash160"]="None"
                        counter += len(outVal + outScript + outScriptLen)
                    elif each[counter+22:counter+26] == "6a52":#the script length is greater than 255 bytes (OP_2)
                        outScriptLen = each[counter+16:counter+22]
                        print "outScriptLen",outScriptLen, "[2:6]",outScriptLen[2:6]
                        outScriptLen_int = getLitEndian(outScriptLen[2:6])*2
                        print "outScriptLen_int",outScriptLen_int
                        print "OPRETURN PARSE",each[counter+16:counter+40]
                        isPushStack = each[counter+26:counter+28]
                        if isPushStack == "4d":
                            OPcounter +=2
                        parkRateScriptLen = each[OPcounter+26:OPcounter+30]
                        print "OP_2 parkRateScriptLen",parkRateScriptLen
                        unit_type = each[OPcounter+30:OPcounter+32]#usually '42'=Bits
                        print "OP_2 unit_type",unit_type
                        num_parkRates = each[OPcounter+32:OPcounter+34]
                        print "OP_2 num_parkRates",num_parkRates
                        if num_parkRates=="00":
                            print "OP_2 THERE ARE NO PARK RATES"
                        else:
                            OPcounter +=34
                            num_parkRates_int = int(num_parkRates,16)
                            for vo in xrange(0,num_parkRates_int):
                                multiple = each[OPcounter:OPcounter+2]
                                print "OP_2 multiple",multiple
                                num_blocks =2**int(multiple,16)
                                print "OP_2 num_blocks",num_blocks
                                rateAmount = each[OPcounter+2:OPcounter+18]
                                rateVal = getLitEndian(rateAmount)/1000000000
                                print "OP_2 rateVal",rateVal
                                OPcounter += len(multiple+rateAmount)
                        #raise Exception("OP_2 >255 BYTES")
                    
                        outScript =each[counter+18:counter+outScriptLen_int+18]
                        outscript_decode = "OP_RETURN "+"OP_2 "+each[counter+22:counter+outScriptLen_int+18]
                        print "outscript_decode", outscript_decode
                        Address = "Nonstandard"
                        TXoutputs[x]["out_num"]=x
                        TXoutputs[x]["outVal"]=0
                        TXoutputs[x]["Address"]=Address
                        TXoutputs[x]["outScript"]= outscript_decode
                        TXoutputs[x]["outType"]= "OP_RETURN"
                        TXoutputs[x]["Hash160"]="None"
                        counter += len(outVal + outScript + outScriptLen)
                    
                     
                    
                    
                    
                #print counter
            else:
                tx_outType =each[counter+16:counter+18]
                tx_park = each[counter+18:counter+22]
                if tx_outType=="19":
                    outScript =each[counter+18:counter+68]
                    outScript_decode = "OP_DUP OP_HASH160 "+each[counter+24:counter+64] + " OP_EQUALVERIFY OP_CHECKSIG"
                    print "outScript Decode ",outScript_decode
                    Address =each[counter+24:counter+64]
                    TXoutputs[x]["out_num"]=x
                    TXoutputs[x]["outVal"]=getLitEndian(outVal)/10000
                    TXoutputs[x]["outScript"]=(outScript_decode)
                    TXoutputs[x]["outType"]=tx_outType
                    TXoutputs[x]["Address"]=Address
                    TXoutputs[x]["Hash160"]=Address
                    txTotRec += TXoutputs[x]["outVal"]
                    totRec += TXoutputs[x]["outVal"]
                    counter+= len(outVal + outScript+ tx_outType)
                    #print counter  
                elif tx_outType=="17": #multisig outputs 
                    outScript =each[counter+20:counter+66]
                    outScript_decode = "OP_HASH160 " +each[counter+22:counter+62] + " OP_EQUAL"
                    print "outScript Decode ",outScript_decode
                    Address =each[counter+22:counter+62]
                    TXoutputs[x]["out_num"]=x
                    TXoutputs[x]["outVal"]=getLitEndian(outVal)/10000
                    TXoutputs[x]["outScript"]=(outScript_decode)
                    TXoutputs[x]["outType"]=tx_outType
                    TXoutputs[x]["Address"]=Address
                    TXoutputs[x]["Hash160"]=Address
                    txTotRec += TXoutputs[x]["outVal"]
                    totRec += TXoutputs[x]["outVal"]    
                    counter += len(outVal + outScript+ tx_outType) 
                    #print counter
                elif tx_outType =="23":
                    outScript =each[counter+20:counter+88]
                    outScript_decode =each[counter+20:counter+86] +" OP_CHECKSIG"
                    print "outScript Decode ",outScript_decode
                    Address =each[counter+20:counter+86]
                    #print "outScript",outScript
                    #print "Address",Address
                    TXoutputs[x]["out_num"]=x
                    TXoutputs[x]["outVal"]=getLitEndian(outVal)/10000
                    TXoutputs[x]["outScript"]=(outScript_decode)
                    TXoutputs[x]["outType"]=tx_outType
                    TXoutputs[x]["Address"]=Address
                    TXoutputs[x]["Hash160"]=getHash160(Address)
                    txTotRec += TXoutputs[x]["outVal"]
                    totRec += TXoutputs[x]["outVal"]
                    if BLOCK[fo]["blockType"]=="PoW" and r==0 and x==0:
                        BLOCK[fo]["blockSolvedBy"] = getAddress(Address,"53")
                    elif BLOCK[fo]["blockType"]=="PoS" and r==1 and x==1:
                        BLOCK[fo]["blockSolvedBy"] = getAddress(Address,"53")
                        
                    counter += len(outVal + outScript + tx_outType)+2 # +2 for "2321"
                    #print counter
                elif tx_outType == "43":
                     
                    outScript =each[counter+20:counter+152]
                    outScript_decode =each[counter+20:counter+150]+" OP_CHECKSIG"
                    print "outScript Decode ",outScript_decode 
                    Address =each[counter+20:counter+150]
                    #print "outScript",outScript
                    #print "Address",Address
                    TXoutputs[x]["out_num"]=x
                    TXoutputs[x]["outVal"]=getLitEndian(outVal)/10000
                    TXoutputs[x]["outScript"]=(outScript_decode)
                    TXoutputs[x]["outType"]=tx_outType
                    TXoutputs[x]["Address"]=Address
                    TXoutputs[x]["Hash160"]=getHash160(Address)
                    txTotRec += TXoutputs[x]["outVal"]
                    totRec += TXoutputs[x]["outVal"]
                    counter += len(outVal + outScript + tx_outType)+2 # +2 for "4341"
                    #print counter
                elif tx_park == "6a53": #OP_RETURN OP_3 AKA Park Transactions
                    outScript_len = int(tx_outType,16)*2
                    print "outScript_len",outScript_len
                    outScript =each[counter+18:counter+outScript_len+18]
                    print "OP_3 outScript",outScript
                    outscript_decode = "OP_RETURN OP_3"+each[counter+22:counter+outScript_len+18]
                    Address = "Parked NuBits"
                    TXoutputs[x]["out_num"]=x
                    TXoutputs[x]["outVal"]=getLitEndian(outVal)/10000
                    TXoutputs[x]["Address"]=Address
                    TXoutputs[x]["outScript"]= outscript_decode
                    TXoutputs[x]["outType"]= "OP_RETURN"
                    TXoutputs[x]["Hash160"]="None"
                    counter += len(outVal + outScript+ tx_outType)
                    #raise Exception("OP_3 PARKING NUBITS TRANSACTION")
                
                    
                
            Trans[r]["TXoutputs"].append(TXoutputs[x])       
            
            
        TXdetails[r]["totRec"] = txTotRec
        if r==num_trans-1:
            tx_lockTime =each[counter:counter+8]
            if tx_lockTime != "00000000":
                raise Exception("Locktime is off!")
            tx_type =each[counter + 8:counter+10]
            Trans[r]["tx_type"] = tx_type
            tx_endScriptLen =each[counter+10:counter+12]
            tx_endScriptLen_int = int(tx_endScriptLen,16)*2
            tx_endScript =each[counter + 12:counter+tx_endScriptLen_int+12]
            TXdetails[r]["endScript"]=(tx_endScript)
            tx_Hash =each[po:counter+10]
            txHash = computeTransHash(tx_Hash)
            TXdetails[r]["tx_Hash"] = txHash
            Trans[r]['_id'] = txHash
            if tx_type != "53":
                totRec -= txTotRec
                totRecBits +=txTotRec
                b_numTxB +=1
            else:
                b_numTxS +=1
            #Transactions.append(TXdetails[r])
            #BLOCK[v]["BlockTransactions"].append(Transactions)
            print "locktime ",tx_lockTime
            print "txEndScriptLen " ,tx_endScriptLen
            #print "txEndScript ",tx_endScript
            counter += len(tx_endScriptLen + tx_endScript + tx_lockTime + tx_type)
            #print counter
        else:
            tx_lockTime =each[counter:counter+8]
            tx_type =each[counter + 8:counter+10]
            Trans[r]["tx_type"] = tx_type
            if tx_type != "53":
                totRec -= txTotRec
                totRecBits +=txTotRec
                b_numTxB +=1
            else:
                b_numTxS +=1
            TXdetails[r]["endScript"]=("None")
            tx_Hash =each[po:counter+10]
            txHash = computeTransHash(tx_Hash)
            TXdetails[r]["tx_Hash"] = txHash
            Trans[r]['_id'] = txHash
            TXdetails[r]["endScript"]=("None")
            #Transactions.append(TXdetails[r])
            #BLOCK[v]["BlockTransactions"].append(Transactions)
            counter += len(tx_type + tx_lockTime)
            print "locktime ",tx_lockTime
            #print counter
        
        Trans[r]["TXdetails"] = TXdetails[r]
        
        TRANSACTIONS.append(Trans[r])

    BLOCK[fo]["blockTotRec"] = totRec
    BLOCK[fo]["blockTotRecBits"] = totRecBits
    BLOCK[fo]["blocknumTxS"] = b_numTxS
    BLOCK[fo]["blocknumTxB"] = b_numTxB
    BLOCKPPC.append(BLOCK[fo])
    v+=1
    fo+=1   
    


start_time = time.time()
print "Working with Votes"

cust_county = VCL.count()
for x in BLOCKPPC:

    num_custodians  = len(x["blockVotes"]["custodianVotes"])
    if num_custodians > 0:#----------------------THERE ARE CUSTODIAN VOTES--------------------------------------------
        for nu in xrange(0,num_custodians):
            custodian_address = x["blockVotes"]["custodianVotes"][nu]["address"]
            cust_vote_search = VCL.find({"_id":custodian_address})
            county = cust_vote_search.count()
            if county==0:
                VCL.insert({"_id":custodian_address,"cust_num":cust_county,"cust_details":{"passed":"false","tx_id":[],"blockHeight":0},"timeStamp":x["blockTimeStamp"],"block":x["blockHeight"],"num_votes":0,"total_votes":0,"latest_block":x["blockHeight"],"amount":x["blockVotes"]["custodianVotes"][nu]["amount"],"CDD":x["blockCDD"]})
                cust_county+=1
            
                

        

                
bSupply = 0
remTx = len(TRANSACTIONS)
w = 0 
for each in TRANSACTIONS:
    print remTx-w,"More to go..."
    w+=1
    trans_type = each["tx_type"]
    #TCL.insert(each)
    addressList = []
    addresses = set()
    txHash = each["_id"]
    inCount = each["TXdetails"]["inCount"]
    outCount = each["TXdetails"]["outCount"]
    transIndex = each["TXdetails"]["tx_index"]
    forBlock = each["forBlock"]
    for o in xrange(0,outCount):
        
        getOut    = each["TXoutputs"][o]
        addressType = getOut["outType"]
        if addressType == "19":
            
            outputAddress   = getAddress20byte(getOut["Address"],trans_type)
            getOut["Address"] = outputAddress
            
        elif addressType == "17":
            
            outputAddress   = getAddress20byteP2SH(getOut["Address"],trans_type)
            getOut["Address"] = outputAddress
            
        elif addressType == "23":
            
            outputAddress   = getAddress(getOut["Address"],trans_type)
            getOut["Address"] = outputAddress
            
        elif addressType == "43":
            
            outputAddress   = getAddress(getOut["Address"],trans_type)
            getOut["Address"] = outputAddress
        
        
        
        
    TCL.update({"_id":each["_id"]},each,upsert=True)
    
    for i in xrange(0,inCount):
        
        string_i = str(i)
        inTx = each["TXinputs"][i]["prevOut"]["inTx"]
        txIndex = each["TXinputs"][i]["prevOut"]["index"]
        inScript = each["TXinputs"][i]["inputs"]["inScript"]
        if txIndex<0:
            TCL.update({"_id":txHash } , {"$set":{ "TXinputs."+string_i+".prevOut.prevTimeStamp": 0, "TXinputs."+string_i+".inputs":{ "Address": "Coinbase", "inVal": 0 ,"in_num":i,"inScript":inScript}  } })
            addresses.add("Coinbase")

            
            
            
        else:
            inputTx = {"_id":str(txIndex)+inTx,"inTx":inTx,"index":txIndex,"txHash":txHash}
            ICL.update({"_id":str(txIndex)+inTx}, inputTx, upsert=True)
            TCL.update({"_id":inTx},{"$set":{"TXoutputs."+str(txIndex)+".status":"spent","TXoutputs."+str(txIndex)+".txSpent":txHash}})

                        
            
            inSearch = TCL.find({"_id":str(inTx)})
            if inSearch.count() == 0:
                print "Couldn't find Input Transaction, ",inTx,"txHash = ",txHash,"for block",each["forBlock"]
                getraw = access.getrawtransaction(str(inTx),1)
                inputAddress = getraw["vout"][txIndex]["scriptPubKey"]["addresses"][0]
                inputVal     = float(getraw["vout"][txIndex]["value"])
                oldTimeStamp = getraw["time"]
                getblock = access.getblock(getraw["blockhash"])
                tx_number = getblock["tx"].index(str(inTx))
                
                addresses.add(inputAddress)
                
                TCL.update({"_id":txHash} , {"$set":{ "TXinputs."+string_i+".prevOut.prevTimeStamp": oldTimeStamp , "TXinputs."+string_i+".inputs":{ "Address": inputAddress, "inVal":inputVal, "in_num":i, "inScript":inScript}  } })
                if tx_number == 1 and BLOCKPPC[(forBlock-START)]["blockNonce"]==0:
                    
                    CDD = each["TXdetails"]["tx_timeStamp"] - oldTimeStamp
                    blockCDD = int((CDD/86400)*inputVal)
                    
                    BLOCKPPC[(forBlock-START)]["blockCDD"] = blockCDD
                    #print BLOCKPPC[(forBlock-START)],forBlock,blockCDD
                    #raise Exception("FOUND A CDD")
                
            else:
                for g in inSearch:
                    getInput = g["TXoutputs"][txIndex]
                    inputAddress = getInput["Address"]
                    inputVal     = getInput["outVal"]
                    oldTimeStamp = g["TXdetails"]["tx_timeStamp"]  
                
                    addresses.add(inputAddress)
                    
                    TCL.update({"_id":txHash} , {"$set":{ "TXinputs."+string_i+".prevOut.prevTimeStamp": oldTimeStamp , "TXinputs."+string_i+".inputs":{ "Address": inputAddress, "inVal":inputVal, "in_num":i, "inScript":inScript}  } })
                    if each["TXdetails"]["tx_num"] == 1 and BLOCKPPC[(forBlock-START)]["blockNonce"]==0:
                        
                        CDD = each["TXdetails"]["tx_timeStamp"] - oldTimeStamp
                        blockCDD = int((CDD/86400)*inputVal)
                        
                        BLOCKPPC[(forBlock-START)]["blockCDD"] = blockCDD
                        #print BLOCKPPC[(forBlock-START)],forBlock,blockCDD
                        #raise Exception("FOUND A CDD")
    
    
    for o in xrange(0,outCount):
        
        getOut    = each["TXoutputs"][o]        
        outputAddress   = getOut["Address"]
        
        
        addresses.add(outputAddress)
    for addr in addresses:
        addressList.append(addr)
        if addr[0]=="B" and "Coinbase" in addresses:
            print "addr",addr,addresses
            cust_search = VCL.update({"_id":addr},{"$set":{"cust_details.passed":"true","cust_details.tx_id":txHash,"cust_details.blockHeight":forBlock} })
            #raise Exception("FOUND A NBT COINBASE")
    TCL.update({"_id":txHash},{"$set":{"Addresses":addressList}})
    
print "Inserting Blocks..."
allCDD = 0 
for x in BLOCKPPC:
    BCTinsert = BCT.insert(x)
    blockHeight = x["blockHeight"]
    blockCDD = x["blockCDD"]
    prevBlock = blockHeight - 10000
    blockCustVotes = [] 
    bobo = BCT.find({"blockHeight":prevBlock})
    for each in bobo:
        prevBlockCDD = each["blockCDD"]
        for c in each["blockCustodianVotes"]:
            find_c = VCL.find({"_id":c})
            for ec in find_c:
                if ec["cust_details"]["blockHeight"] >= blockHeight or ec["cust_details"]["blockHeight"] == 0:
                    VCL.update({"_id":c},{"$inc":{"CDD":(prevBlockCDD*-1),"num_votes":-1}})
            blockCustVotes.append(c)
    for nu in x["blockCustodianVotes"]:
        custodian_address = nu
        find_cd = VCL.find({"_id":custodian_address})
        for ec in find_cd:
            if ec["cust_details"]["blockHeight"] >= blockHeight or ec["cust_details"]["blockHeight"] == 0:
                VCL.update({"$and":[ {"_id":custodian_address} ]},{"$inc":{"CDD":blockCDD,"num_votes":1,"total_votes":1},"$set":{"latest_block":blockHeight} })
            
    """
    dodo = x["blockHeight"] - 10000
    xb_CDD = x["blockCDD"]
    find_block = BCT.find({"blockHeight":dodo})
    if find_block.count() == 0:
        allCDD +=xb_CDD
    else:
        for fb in find_block:
            b_CDD = fb["blockCDD"]
            allCDD += (xb_CDD - b_CDD)
            print "allCDD",allCDD
    num_custodians  = len(x["blockVotes"]["custodianVotes"])
    if num_custodians > 0:#----------------------THERE ARE CUSTODIAN VOTES--------------------------------------------
        for nu in xrange(0,num_custodians):
            custodian_address = x["blockVotes"]["custodianVotes"][nu]["address"]
            cust_vote_search = VCL.find({"_id":custodian_address})
            county = cust_vote_search.count()
            if county==0:
                VCL.insert({"_id":custodian_address,"cust_num":cust_county,"cust_details":{"passed":"false","tx_id":[],"blockHeight":0},"timeStamp":x["blockTimeStamp"],"block":x["blockHeight"],"num_votes":0,"total_votes":0,"latest_block":x["blockHeight"],"amount":x["blockVotes"]["custodianVotes"][nu]["amount"],"CDD":x["blockCDD"]})
                cust_county+=1
            else:
                dodo = x["blockHeight"] - 10000
                find_block = BCT.find({"blockHeight":dodo})
                for efb in find_block:
                    block_cust = efb["blockCustodianVotes"]
                    block_CDD = efb["blockCDD"]
                    if custodian_address not in block_cust:#IF THERE WAS NO VOTE PLACED (bHEight - 10,000) BLOCKS AGO
                        #VCL.update({"_id":custodian_address},{"$inc":{"num_votes":-1,"CDD":(block_CDD*-1)},"$set":{"latest_block":x["blockHeight"]}})
                        find_c = VCL.find({"_id":custodian_address})
                        for efc in find_c:
                            if x["blockHeight"] <= efc["cust_details"]["blockHeight"] or efc["cust_details"]["blockHeight"]==0:
                                VCL.update({"_id":custodian_address},{"$inc":{"num_votes":1,"total_votes":1,"CDD":x["blockCDD"]},"$set":{"latest_block":x["blockHeight"]}})
                    else:       #THERE WAS A VOTE PLACED: VOTES +0 , CDD +=diff_CDD
                        diff_CDD = x["blockCDD"] - block_CDD
                        find_c = VCL.find({"_id":custodian_address})
                        for efc in find_c:
                            if x["blockHeight"] <= efc["cust_details"]["blockHeight"] or efc["cust_details"]["blockHeight"]==0:
                                VCL.update({"_id":custodian_address},{"$inc":{"CDD":diff_CDD},"$set":{"latest_block":x["blockHeight"]}})
 
                
    else: #---------------------------THERE ARE NO CUSTODIAN VOTES--------------------------------------------------
        dodo = x["blockHeight"] - 10000
        find_block = BCT.find({"blockHeight":dodo})
        for efb in find_block:
            block_cust = efb["blockCustodianVotes"]
            block_CDD = efb["blockCDD"]
            for ebc in block_cust:
                find_c = VCL.find({"_id":ebc})
                for efc in find_c:
                    if x["blockHeight"] <= efc["cust_details"]["blockHeight"] or efc["cust_details"]["blockHeight"]==0:
                        VCL.update({"_id":ebc},{"$inc":{"num_votes":-1,"CDD":(block_CDD*-1)}})
"""
print BCT.count(),"No. of Blocks BCT.count()"
            
                
                
try:
    rNBT = Request('https://coinmarketcap-nexuist.rhcloud.com/api/nbt')
    responseNBT = urlopen(rNBT)
    dataNBT = json.loads( responseNBT.read() )
    NBTprice = dataNBT["price"]["usd"]
    NBTpriceEUR = dataNBT["price"]["eur"]
    NBTpriceCNY = dataNBT["price"]["cny"]
    
    rNSR = Request('https://coinmarketcap-nexuist.rhcloud.com/api/nsr')
    responseNSR = urlopen(rNSR)
    dataNSR = json.loads( responseNSR.read() )    
    NSRprice = dataNSR["price"]["usd"]
    NSRpriceEUR = dataNSR["price"]["eur"]
    NSRpriceCNY = dataNSR["price"]["cny"]
except Exception, e:
    NSRprice = 0
    NSRpriceEUR = 0
    NSRpriceCNY = 0
    NBTprice = 0
    NBTpriceEUR = 0
    NBTpriceCNY = 0
    print "OH NO! coinmarketcap api failed %s " % e
    pass


access = AuthServiceProxy("http://user:pass@127.0.0.1:14001")
getInfo = access.getinfo()
getDifficulty = access.getdifficulty()
networkghps = access.getnetworkghps()
getparkrates = access.getparkrates(BCT.count()-1,"B")
getSharedays = access.getcustodianvotes()
getPeerInfo =access.getpeerinfo()
for each in getPeerInfo:
    peerCount = PCL.count()
    each["peer_num"] = peerCount
    addr = each["addr"].split(":")
    ip=addr[0]
    #print addr[0]
    ver = each["version"]    
    if ver < 100:
        ver = ver*10000
        print ver
    else:
        print ver
    port = addr[1]
    subverSplit = each["subver"].split("/")
    siglee = subverSplit[1]
    client = siglee.split(":")[1]
    isPeer = PCL.find({"_id":ip}).count()
    if isPeer == 0:#the ip is not in the db, its a new one
        try:
            rIP = Request('http://ipinfo.io/%s/json/'%ip)
            responseIP = urlopen(rIP)
            ipData = json.loads( responseIP.read() )
            location = ipData["loc"].split(",")
            longitude = location[0]
            latitude = location[1]
            
            #print ipData["ip"],ipData["city"],ipData["region"],ipData["country"],"longitude:",longitude,"latitude:",latitude
            PCL.insert({
                        "_id":         ipData["ip"],
                        "subver" :     each["subver"],
                        "lastsend" :   each["lastsend"],
                        "banscore" :   each["banscore"],
                        "addr" :       each["addr"],
                        "inbound" :    each["inbound"],
                        "height" :     each["height"],
                        "lastrecv" :   each["lastrecv"],
                        "version" :    ver,
                        "conntime" :   each["conntime"],
                        "services" :   each["services"],
                        "releasetime": each["releasetime"],
                        "siglee":      siglee,
                        "client":      client,
                        "port":        port,
                        "peer_num":    peerCount,
                        "city":        ipData["city"],
                        "region":      ipData["region"],
                        "country_code":ipData["country"],
                        "long":        longitude,
                        "lat":         latitude 
                        })
        except Exception, e:
            
            PCL.insert({"_id":         ipData["ip"],
                        "subver" :     each["subver"],
                        "lastsend" :   each["lastsend"],
                        "banscore" :   each["banscore"],
                        "addr" :       each["addr"],
                        "inbound" :    each["inbound"],
                        "height" :     each["height"],
                        "lastrecv" :   each["lastrecv"],
                        "version" :    ver,
                        "conntime" :   each["conntime"],
                        "services" :   each["services"],
                        "releasetime": each["releasetime"],
                        "siglee":      siglee,
                        "client":      client,
                        "port":        port,
                        "peer_num":peerCount,
                        "city":"unknown", 
                        "region":"unknown",
                        "country_code":"unknown",
                        "long":"unknown",
                        "lat":"unknown"
                        })
            print "OH NO! IP GEOLOCATION api failed %s " % e
            pass
    else:#the ip is already in the PeerCollection
        PCL.update({"_id":ip},{
                               "$set":{ 
                                        "subver" :     each["subver"],
                                        "lastsend" :   each["lastsend"],
                                        "banscore" :   each["banscore"],
                                        "addr" :       each["addr"],
                                        "inbound" :    each["inbound"],
                                        "height" :     each["height"],
                                        "lastrecv" :   each["lastrecv"],
                                        "version" :    ver,
                                        "conntime" :   each["conntime"],
                                        "services" :   each["services"],
                                        "releasetime": each["releasetime"],
                                        "siglee":      siglee,
                                        "client":      client,
                                        "port":        port
                                        } 
                               })
    
allCDD = getSharedays["total"]["sharedays"]
PR_inEffect = []
for key, value in getparkrates.iteritems():
    num_blocks = int(key[0:len(key)-7])
    time_ofRate = num_blocks
    ParkRate = ( float(value)*100 )/( num_blocks*60/(365.25*24*3600) )
    time_duration = display_time(time_ofRate)
    PR_inEffect.append({"duration":int(key[0:len(key)-7]),"rate":ParkRate,"time":time_duration})
PR_inEffect = sorted(PR_inEffect, key=itemgetter('rate'))
print PR_inEffect
#print getInfo
print "allCDD",allCDD
getNBT = VCL.find({"cust_details.passed":"true"})
bitsSupply = 0
for gNBT in getNBT:
    nbt_amount = gNBT["amount"]
    bitsSupply += nbt_amount

sSupply = int(getInfo["moneysupply"])    
SCL.update({"_id":"statusInfo"},{"USDprice":NSRprice,
                                 "USDvol":0,
                                 "USDpriceBits":NBTprice,
                                 "USDvolBits":0,
                                 "EURprice":NSRpriceEUR,
                                 "EURvol":0,
                                 "EURpriceBits":NBTpriceEUR,
                                 "EURvolBits":0,
                                 "CNYprice":NSRpriceCNY,
                                 "CNYvol":0,
                                 "CNYpriceBits":NBTpriceCNY,
                                 "CNYvolBits":0,
                                 "MoneySupply":int(getInfo["moneysupply"]),
                                 "SharesSupply":sSupply,
                                 "ParkRates":PR_inEffect,
                                 "BlockCount":getInfo["blocks"],
                                 "Con":getInfo["connections"],
                                 "Ver":getInfo["version"],
                                 "powDifficulty":int(getInfo["difficulty"]),
                                 "posDifficulty":float(getDifficulty["proof-of-stake"]),
                                 "ProtocolVer":getInfo["protocolversion"],
                                 "networkghps":int(networkghps),
                                 "BitsSupply":bitsSupply,
                                 "tenK_CDD":allCDD
                                 })

print "Working on Motions..."                

b = start - len(shortBlock)

#rollback_num is for maintaining correct number of motion votes.
rollback_num = 0 
#set it to BCT.count(), BEFORE you remove the set of blocks from the db.

passed = []
moto_pass = []
mo_county = MCL.count()
for ea in xrange(b,END):
    voted_motions = []
    getMotionInfo = access.getmotions(b)
    for each in getMotionInfo:
        motion_hash = each
        voted_motions.append(motion_hash)
        num_votes = getMotionInfo[each]["blocks"]
        CDD = getMotionInfo[each]["sharedays"] 
        sharedays = getMotionInfo[each]["shareday_percentage"]        
        print "motion hash",each,"num of votes",num_votes,"sharedays",sharedays
        find_motion = MCL.find({"_id":motion_hash})
        isMotion = find_motion.count()
        if isMotion == 0:#first time seeing the motion, its not in the db
            MCL.insert({"_id":motion_hash,"mo_num":mo_county,"mo_details":{"passed":"false","blockHeight":0},"block":b,"num_votes":0,"total_votes":0,"latest_block":b,"CDD":CDD})
            mo_county +=1
        else:#motion is already in the db, update num_votes and CDD
            for fm in find_motion:
                prev_num_votes = fm["num_votes"]                
                ispassed = fm["mo_details"]["passed"]
                if num_votes > prev_num_votes and ispassed == "false" and b > rollback_num: #the motion got a vote
                    MCL.update({"_id":motion_hash},{ "$set":{"num_votes":num_votes,"CDD":CDD,"latest_block":b},"$inc":{"total_votes":1} })
                elif num_votes <= prev_num_votes and ispassed == "false"and b > rollback_num:#the motion did not get a vote
                    MCL.update({"_id":motion_hash},{"$set":{"num_votes":num_votes,"CDD":CDD}})
                
        if num_votes >= 5001 and sharedays >= 50.01 and ispassed == "false":
            moto_pass.append(motion_hash)
            MCL.update({"_id":motion_hash},{"$set":{"mo_details.passed":"true","mo_details.blockHeight":b}})
            print "at height",b,"this motion hash passed! %s" % motion_hash,"num of votes",num_votes,"sharedays",sharedays
            passed.append({"height":b,"motion_hash":motion_hash,"num_votes":num_votes,"sharedays_percentage":sharedays})
            #raise Exception ("PASS!")
    if ea == END-1: #the final loop of the xrange, get all motions and see if they have any votes, in the last 10k blocks
        getActiveMotions = MCL.find({"mo_details.passed":"false"})#if not, then set num_votes and CDD to 0
        for gAM in getActiveMotions:
            motionHash = gAM["_id"]
            if motionHash not in voted_motions:
                MCL.update({"_id":motionHash},{"$set":{"num_votes":0,"CDD":0} })
        
    b+=1
    print b
           
print"done"
elapsed_time = time.time() - start_time
print "%s seconds for complete blockchain Parse" % elapsed_time






