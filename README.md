nuexplorer
==========

##Nu network Block Explorer
NuExplorer is powered by MongoDB, Expressjs, Angularjs and Nodejs. Query for blocks, transactions, and addresses found in the Nu network (https://nubits.com).

###Dependencies
- Nodejs
- Mongodb
- Nu Client

###Installation
1. Download Latest Nu Wallet [NuBits](https://nubits.com/download)
  - unzip,install and launch nu.exe to sync all blocks (might be a while)
2. Install [Node.js](https://nodejs.org/)
3. Install [MongoDB](https://mongodb.org/)
  - a replica set is needed to keep track of changes in db.
  - use mongod `--replSet <name>`; Note: `--auth` and `bind_ip=127.0.0.1` are recommended configurations
4. Clone the NuExplorer repo to the server you want to deploy it on.
5. Load dependencies with `sudo npm install`.
6. Copy the `mongo-oplog-watcher` folder into `node_modules`
7. Adjust mongodb connection urls according to your mongodb setup
  - connection urls are located in `server.js`, and at the top of each `/public/app/api/*_api.js` scripts 
8. From the command line, invoke `node server.js` to launch the application.
9. Open any web browser and enter `localhost:800` in the url. 

###Setup
1. To start, create a db in mongo shell (for simplicity type `use BlockDB` )
2. Create the collections in `BlockDB` by typing `db.createCollection('<CollectionName>')`
  - `BlockCollection`
  - `ChartCollection`
  - `InputTxCollection`
  - `MotionCollection`
  - `OrphanBlockCollection`
  - `OrphanTxCollection`
  - `PeerCollection`
  - `SharesAddressCollection`
  - `StatusCollection`
  - `TxCollection`
  - `VoteCollection`
3. Now, depending on what OS your running, we have to create a `nu.conf` file.
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
4. Open the pythonparser folder, then locate and open `NuParserv007.py` in your choice of IDE
  - make sure the dependencies at the top are installed on your system i.e) bitcoinrpc, pymongo, bitstring, etc.
  - adjust `line 14` according to your mongodb setup
  - adjust `line 30` according to your nu.conf `rpcuser`,`rpcpassword`,`rpcport` properties
  - find the variables `blk01`,`blk02` and according to where your `nu.conf` file is located, comment/uncomment
    the correct location 
    i.e) for Windows use: `blk01 = "C:/users/<username>/appdata/roaming/nu/blk0001.dat",blk02=...,blk=""`
  - now, running the script will insert the latest 2 blocks into the db. Feel free to tinker with
    the variables `fi.seek()`(line 416) and `START`,`END` (lines 486,487) respectively to insert the desired blocks.
5. Feel free to take a little break at this point :) (steps 6 and 7 are optional)
6. if you want to insert the latest block discovered (make it realtime), open your `nu.conf` file and add this property 
at the bottom:
  - for windows: `blocknotify=C:\<python-location>\python.exe C:\<folder-location>\NuExplorerOS\pythonparser\NuParserv007.py`
  - for linux: `blocknotify=/usr/bin/python /<folder-location>/NuExplorerOS/pythonparser/NuParserv007.py`
7. now close and reopen nu.exe or nud.exe (whichever you prefer).
DONE! Your setup and installation is complete.
If your stuck, feel free to contact me at jgeorges371@gmail.com or write a github issue. 
 


LICENSE
----------------------------
The MIT License (MIT)

Copyright (c) 2016 Johny Georges

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.