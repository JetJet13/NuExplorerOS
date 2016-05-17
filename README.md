nuexplorer
==========

[![Join the chat at https://gitter.im/JetJet13/NuExplorerOS](https://badges.gitter.im/JetJet13/NuExplorerOS.svg)](https://gitter.im/JetJet13/NuExplorerOS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

##Nu network Block Explorer
NuExplorer is powered by MongoDB, Expressjs, Angularjs and Nodejs. Query for blocks, transactions, and addresses found in the Nu network (https://nubits.com).

###Dependencies
- Nodejs v0.10 or greater
- Mongodb 2.6
- Nu Client

###Installation
1. Download Latest Nu Wallet [NuBits](https://nubits.com/download)
  - unzip,install and launch nu.exe to sync all blocks (might be a while)
2. Install [Node.js](https://nodejs.org/)
3. Install [MongoDB](https://mongodb.org/)
  - a replica set is needed to keep track of changes in db.
  - use mongod `--replSet <name>`; Note: `--auth` and `bind_ip=127.0.0.1` are recommended configurations
4. Clone the NuExplorer repo to the server you want to deploy it on.
5. cd into directory `cd ./NuExplorerOS-master`
5. Load dependencies with `sudo npm install`.
6. Copy the `mongo-oplog-watcher` folder into `node_modules`
7. Adjust mongodb connection urls according to your mongodb setup
  - connection urls are located in `server.js`, and `/public/app/api/api.tools.js`,specifically `exports.db` 

###Setup
1. Start up the mongodb daemon. For simplicity, type `mongod --replSet rs0` to spin up the daemon.
  - Note this uses a replica set configuration, `--replSet rs0`
  - The daemon will keep repeating some context telling you that it is waiting for a `mongo shell` connection
2. To start the mongo shell, simply type `mongo` in a new window pane
  - Once the mongo shell opens, we have to connect to `mongod --replSet rs0`.
    - To do this, type `rs.initiate()`
    - Now, a new line should show with pointer `rs0:PRIMARY>`. If it doesn't,type `use admin`, then `db.shutdownServer()` and repeat step 1.
3. Now we need to create a new database in mongo shell
  - for simplicity type `use BlockDB`
4. Now we need to create collections in `BlockDB` to store our data
  - to do this, type `db.createCollection('<CollectionName>')`
    - replace `<CollectionName>` with the following names
    - `BlockCollection`
    - `ChartCollection`
      - after creating `ChartCollection` paste the following commands in the mongo shell
        - `db.ChartCollection.insert({ "_id":"orphan", "orph":[] })`
        - `db.ChartCollection.insert({ "_id":"diff", "pos":[] })`
        - `db.ChartCollection.insert({ "_id":"numtrans", "Bits":[], "Shares":[]})`
    - `InputTxCollection`
    - `MotionCollection`
    - `OrphanBlockCollection`
    - `OrphanTxCollection`
    - `PeerCollection`
    - `SharesAddressCollection`
    - `StatusCollection`
      - after creating `StatusCollection` paste the following commands in the mongo shell 
        - `db.StatusCollection.insert({_id:"statusInfo"})`,
        - `db.StatusCollection.insert({_id:"addressLeftOff","blockHeight":0})`
    - `TxCollection`
    - `VoteCollection`
5. Double check that you have created all the collections by typing `show collections` in mongo shell.
6. Now, depending on what OS your running, we have to create a `nu.conf` file.
  - if your on Windows, head to the folder `C:/users/<username>/appdata/roaming/nu/`
  - if your on Linux, head to the folder `/root/.nu/` (the same might apply to Mac OSX)
  - create a file called `nu.conf` in the folder. (windows users can use notepad)
  - now, open `nu.conf` and copy and paste the following into the file.
    - server=1                                                                      
                                                                                    
    - rpcport=14001                                                                       
    - rpcuser=user                                                                        
    - rpcpassword=pass                                                                    
                                                                                    
    - addnode=198.52.160.71                                                               
    - addnode=198.52.217.4                                                                
    - addnode=198.52.199.75                                                               
    - addnode=198.52.199.46                                                               
    - addnode=162.242.208.43                                                              
    - addnode=192.237.200.146                                                             
    - addnode=119.9.75.189                                                                
    - addnode=119.9.12.63                                                                 
    - listen=1 
7. Open the pythonparser folder, then locate and open `NuParserv007.py` in your choice of IDE
  - make sure the dependencies at the top are installed on your system i.e) bitcoinrpc, pymongo, bitstring, etc.
  - for bitcoinrpc, if you are using pip, use this command to install it `pip install git+https://github.com/jgarzik/python-bitcoinrpc.git`
  - adjust `line 14` according to your mongodb setup
  - adjust `line 30` according to your nu.conf `rpcuser`,`rpcpassword`,`rpcport` properties
  - find the variables `blk01`,`blk02` and according to where your `nu.conf` file is located, comment/uncomment
    the correct location 
    i.e) for Windows use: `blk01 = "C:/users/<username>/appdata/roaming/nu/blk0001.dat",blk02=...,blk=""`
  - now, running the script will insert the latest 2 blocks into the db. Feel free to tinker with
    the variables `fi.seek()`(line 416) and `START`,`END` (lines 486,487) respectively to insert the desired blocks.
8. Feel free to take a little break at this point :) (steps 6 and 7 are optional)
9. if you want to insert the latest block discovered (make it realtime), open your `nu.conf` file and add this property 
at the bottom:
  - for windows: `blocknotify=C:\<python-location>\python.exe C:\<folder-location>\NuExplorerOS\pythonparser\NuParserv007.py`
  - for linux: `blocknotify=/usr/bin/python /<folder-location>/NuExplorerOS/pythonparser/NuParserv007.py`
10. now close and reopen nu.exe or nud.exe (whichever you prefer).
DONE! Your setup and installation is complete.
If your stuck, feel free to contact me at jgeorges371@gmail.com or write a github issue. 
 


LICENSE
----------------------------
The MIT License (MIT)

Copyright (c) 2016 Johny Georges

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
