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
#client.admin.authenticate("<username>","<password>")
BDB = client.BlockDB
#BCL = BDB.blockCollection
BCT = BDB.BlockCollection
OBCT = BDB.OrphanBlockCollection
TCL = BDB.TxCollection
OTCL = BDB.OrphanTxCollection
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
# blk01 = "C:/users/home/appdata/roaming/nu/blk0001.dat"
# blk02 = "C:/users/home/appdata/roaming/nu/blk0002.dat"
# blk   = ""


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
official_list = []
start = BCT.count()
startOrphan = OBCT.count()
end = start#access.getblockcount() #BCT.count()
getBlockCount = access.getblockcount()
#START BLOCK HEIGHT = 225,879
#START = BCT.count() + OBCT.count()
START = start+startOrphan-10000#225663+start+startOrphan
END = START + 5000
shortBlock = []
for each in xrange(START,END):
    shortBlock.append(wed[each])

del wed

print "deleted block,officiallist, and wed"
print len(shortBlock),"len of shortblock"
#oneBlock = []
#oneBlock.append(block[10041])
#block = f7(block);
print "BlockChain Parsing in Progress..."
#---------------------------------------------------BLOCK PARSING STARTS HERE-------------------------------------------------------

BLOCKPPC = {}
BLOCK = {}
TRANSACTIONS = []
list_bHash = []
TXdetails = {}
TXinputs = {}
TXoutputs = {}
v = 0
h= TCL.count()
PoS = 0
PoW = 0
fo = START#start
#NOTE: 42HEX = "B" in ASCII , 53HEX = "S" in ASCII 
print fo,"this is the last block u entered into mongo"
for each in shortBlock:
    print fo
    Trans = {}
    totRec= 0
    totRecBits= 0
    b_numTxS = 0
    b_numTxB = 0
    bHash = computeBlockHash(each[8:168])    
    list_bHash.append(bHash)
    bCheck = access.getblock(bHash)["height"]
    
    if fo != bCheck:
        fo = bCheck
        print "fo not equal to bCheck"
        chainCheck = access.getblockhash(fo)
        if chainCheck != bHash:
            chain  = "orphan"
        else:
            chain = "main"
    else:
        chainCheck = access.getblockhash(fo)
        if chainCheck != bHash:
            chain = "orphan"
        else:
            chain = "main"
        
    BLOCK[fo] = {'_id':[],"chain":[],"blockHash":[],"blockHeight":[],"blockSize":[],"blockVer":[],"blockPrevHash":[],"blockMrkRoot":[],"blockTimeStamp":[],\
                "blockBits":[],"blockDifficulty":[],"blockNonce":[],"blockNumTrans":[],"blockTotRec":[],"blockType":[],"blockSolvedBy":[],\
                "blockVotes":{"custodianVotes":[],"parkRateVotes":[],"motionHashVote":[]},"blockTrans":[],"blockCustodianVotes":[],"blockCDD":0,"blockTotRecBits":[],"blocknumTxS":[],"blocknumTxB":[]}

    BLOCK[fo]["chain"] = chain
    
    BLOCK[fo]["blockHash"] = bHash
    
    BLOCK[fo]["blockHeight"] = fo
    
    BLOCK[fo]["blockSize"] = getLitEndian(each[0:8])/1024
    
    BLOCK[fo]["blockVer"] = getLitEndian(each[8:16])
    
    BLOCK[fo]["blockPrevHash"] = getBigEndian(each[16:80])
    
    BLOCK[fo]["blockMrkRoot"] = getBigEndian(each[80:144])
    
    BLOCK[fo]["blockTimeStamp"] = getLitEndian(each[144:152])
    
    BLOCK[fo]["blockBits"] = getLitEndian(each[152:160])
    
    BLOCK[fo]["blockDifficulty"] = getDifficult(each[152:160])
    
    BLOCK[fo]["blockNonce"] = getLitEndian(each[160:168])
    
    BLOCK[fo]["_id"] = bHash
    
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
        Trans[r]= {"TXdetails":[],"TXinputs":[],"TXoutputs":[],"_id":[],"forBlock":fo,"blockHash":bHash,"chain":chain,"tx_type":[]}
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
            if tx_index=="ffffffff" or tx_inTx == "0000000000000000000000000000000000000000000000000000000000000000":
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
                            print "no pushStack",pushStack
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
                                print "sleeping"
                                time.sleep(10)
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
                                num_parkRates = "00"
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
                                
                            print "num_motionHash",num_motionHash
                            print each[OPcounter:OPcounter+20]
                            if num_motionHash == "fd":
                                #length of motion hashes > 255 bytes.
                                num_motions = getLitEndian(each[OPcounter+10:OPcounter+14])
                                OPcounter +=14
                            else:
                                num_motions = int(num_motionHash,16)
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
#the script length is greater than 255 bytes---------------------------------------------------------------------------------------------------------------
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
                                num_motions = int(num_motionHash,16)
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
            BLOCK[fo]["blockTrans"].append(txHash)
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
            BLOCK[fo]["blockTrans"].append(txHash)
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
    BLOCKPPC[bHash]=(BLOCK[fo])
    v+=1
    fo+=1   
    


start_time = time.time()
               
bSupply = 0
remTx = len(TRANSACTIONS)
w = 0 
for each in TRANSACTIONS:
    print remTx-w,"More to go..."
    w+=1
    trans_type = each["tx_type"]
    tx_chain = each["chain"]
    #TCL.insert(each)
    addressList = []
    addresses = set()
    txHash = each["_id"]
    inCount = each["TXdetails"]["inCount"]
    outCount = each["TXdetails"]["outCount"]
    transIndex = each["TXdetails"]["tx_index"]
    forBlock = each["forBlock"]
    tx_blockHash = each["blockHash"]
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
        
        
        
    if tx_chain == "main": #MAIN CHAIN
        TCL.update({"_id":each["_id"]},each,upsert=True)
    else:
        OTCL.update({"_id":each["_id"]},each,upsert=True)
    
    for i in xrange(0,inCount):
        
        string_i = str(i)
        inTx = each["TXinputs"][i]["prevOut"]["inTx"]
        txIndex = each["TXinputs"][i]["prevOut"]["index"]
        inScript = each["TXinputs"][i]["inputs"]["inScript"]
        if txIndex<0 and tx_chain == "main":
            TCL.update({"_id":txHash } , {"$set":{ "TXinputs."+string_i+".prevOut.prevTimeStamp": 0, "TXinputs."+string_i+".inputs":{ "Address": "Coinbase", "inVal": 0 ,"in_num":i,"inScript":inScript}  } })
            addresses.add("Coinbase")
        
        elif txIndex<0 and tx_chain == "orphan":
            OTCL.update({"_id":txHash } , {"$set":{ "TXinputs."+string_i+".prevOut.prevTimeStamp": 0, "TXinputs."+string_i+".inputs":{ "Address": "Coinbase", "inVal": 0 ,"in_num":i,"inScript":inScript}  } })
            addresses.add("Coinbase")
            
        else:
            inputTx = {"_id":str(txIndex)+inTx,"inTx":inTx,"index":txIndex,"txHash":txHash}
            ICL.update({"_id":str(txIndex)+inTx}, inputTx, upsert=True)
            
            if tx_chain == "main":#MAIN CHAIN
                TCL.update({"_id":inTx},{"$set":{"TXoutputs."+str(txIndex)+".status":"spent","TXoutputs."+str(txIndex)+".txSpent":txHash}})
            else:                 #ORPHAN CHAIN
                OTCL.update({"_id":inTx},{"$set":{"TXoutputs."+str(txIndex)+".status":"spent","TXoutputs."+str(txIndex)+".txSpent":txHash}})
                        
            
            inSearch = TCL.find({"_id":str(inTx)})
            if inSearch.count() == 0:
                #tx wasn't in TxCollection, let's check in OrphanTxCollection
                orphSearch = OTCL.find({"_id":str(inTx)})
                
                if orphSearch.count() == 0: #not in OrphanTxCollection
                    print "Couldn't find Input Transaction, ",inTx,"txHash = ",txHash,"for block",each["forBlock"]
                
                    getraw = access.getrawtransaction(str(inTx),1)
                    if getraw["vout"][txIndex]["scriptPubKey"]["type"] == "park":
                        inputAddress = getraw["vout"][txIndex]["scriptPubKey"]["park"]["unparkaddress"]                    
                    else:
                        inputAddress = getraw["vout"][txIndex]["scriptPubKey"]["addresses"][0]
                    inputVal     = float(getraw["vout"][txIndex]["value"])
                    oldTimeStamp = getraw["time"]
                    getblock = access.getblock(getraw["blockhash"])
                    tx_number = getblock["tx"].index(str(inTx))
                    
                    addresses.add(inputAddress)
                    
                    if tx_chain == "main":
                        TCL.update({"_id":txHash} , {"$set":{ "TXinputs."+string_i+".prevOut.prevTimeStamp": oldTimeStamp , "TXinputs."+string_i+".inputs":{ "Address": inputAddress, "inVal":inputVal, "in_num":i, "inScript":inScript}  } })
                    else:
                        OTCL.update({"_id":txHash} , {"$set":{ "TXinputs."+string_i+".prevOut.prevTimeStamp": oldTimeStamp , "TXinputs."+string_i+".inputs":{ "Address": inputAddress, "inVal":inputVal, "in_num":i, "inScript":inScript}  } })

                    if tx_number == 1 and forBlock > 400:
                        
                        CDD = each["TXdetails"]["tx_timeStamp"] - oldTimeStamp
                        blockCDD = int((CDD/86400)*inputVal)
                        print forBlock-START,"forblock - START"
                        BLOCKPPC[tx_blockHash]["blockCDD"] = blockCDD
                        #print BLOCKPPC[(forBlock-START)],forBlock,blockCDD
                        #raise Exception("FOUND A CDD")
                
                else:#orphSearch found the input tx.
                    for g in orphSearch:
                        
                        getInput = g["TXoutputs"][txIndex]
                        inputAddress = getInput["Address"]
                        inputVal     = getInput["outVal"]
                        oldTimeStamp = g["TXdetails"]["tx_timeStamp"]  
                    
                        addresses.add(inputAddress)
                        
                        if tx_chain == "main":
                            TCL.update({"_id":txHash} , {"$set":{ "TXinputs."+string_i+".prevOut.prevTimeStamp": oldTimeStamp , "TXinputs."+string_i+".inputs":{ "Address": inputAddress, "inVal":inputVal, "in_num":i, "inScript":inScript}  } })
                        else:
                            OTCL.update({"_id":txHash} , {"$set":{ "TXinputs."+string_i+".prevOut.prevTimeStamp": oldTimeStamp , "TXinputs."+string_i+".inputs":{ "Address": inputAddress, "inVal":inputVal, "in_num":i, "inScript":inScript}  } })

                        
                        if each["TXdetails"]["tx_num"] == 1 and forBlock > 400:
                            
                            CDD = each["TXdetails"]["tx_timeStamp"] - oldTimeStamp
                            blockCDD = int((CDD/86400)*inputVal)
                            
                            BLOCKPPC[tx_blockHash]["blockCDD"] = blockCDD
                            #print BLOCKPPC[(forBlock-START)],forBlock,blockCDD
                            #raise Exception("FOUND A CDD")
            else:
                for g in inSearch:
                    getInput = g["TXoutputs"][txIndex]
                    inputAddress = getInput["Address"]
                    inputVal     = getInput["outVal"]
                    oldTimeStamp = g["TXdetails"]["tx_timeStamp"]  
                
                    addresses.add(inputAddress)
                    
                    if tx_chain == "main":
                        TCL.update({"_id":txHash} , {"$set":{ "TXinputs."+string_i+".prevOut.prevTimeStamp": oldTimeStamp , "TXinputs."+string_i+".inputs":{ "Address": inputAddress, "inVal":inputVal, "in_num":i, "inScript":inScript}  } })
                    else:
                        OTCL.update({"_id":txHash} , {"$set":{ "TXinputs."+string_i+".prevOut.prevTimeStamp": oldTimeStamp , "TXinputs."+string_i+".inputs":{ "Address": inputAddress, "inVal":inputVal, "in_num":i, "inScript":inScript}  } })

                    
                    if each["TXdetails"]["tx_num"] == 1 and forBlock > 400:
                        
                        CDD = each["TXdetails"]["tx_timeStamp"] - oldTimeStamp
                        blockCDD = int((CDD/86400)*inputVal)
                        
                        BLOCKPPC[tx_blockHash]["blockCDD"] = blockCDD
                        #print BLOCKPPC[(forBlock-START)],forBlock,blockCDD
                        #raise Exception("FOUND A CDD")
    
    
    for o in xrange(0,outCount):
        
        getOut    = each["TXoutputs"][o]        
        outputAddress   = getOut["Address"]
                
        addresses.add(outputAddress)
    for addr in addresses:
        addressList.append(addr)
    
    if tx_chain == "main":
        TCL.update({"_id":txHash},{"$set":{"Addresses":addressList}})
    else:
        OTCL.update({"_id":txHash},{"$set":{"Addresses":addressList}})
    
print "Inserting Blocks..."

#rollback_num is for maintaining correct number of custodian votes.
rollback_num = 0 
#set it to the number of blocks in the db BEFORE you removed the set of blocks from the db.

endo = len(BLOCKPPC)
for x in list_bHash:
    if BLOCKPPC[x]["chain"] == "main":x
        #BCTinsert = BCT.update(BLOCKPPC[x])
        BCTinsert = BCT.update({"_id":BLOCKPPC[x]["_id"]}, BLOCKPPC[x], upsert=True)
    else:
        #OBCTinsert = OBCT.insert(BLOCKPPC[x])
        OBCTinsert = OBCT.update({"_id":BLOCKPPC[x]["_id"]}, BLOCKPPC[x], upsert=True)
    
    
    print bHeight
    
print BCT.count(),"No. of Blocks BCT.count()"
print"done"
elapsed_time = time.time() - start_time
print "%s seconds for complete blockchain Parse" % elapsed_time
print "END",END






