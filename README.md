nuexplorer
==========

##Nu network Block Explorer
NuExplorer is powered by MongoDB, Expressjs, Angularjs and Nodejs. Query for blocks, transactions, and addresses found in the Nu network (https://nubits.com).

###Dependencies
- Nodejs
- Mongodb

###Installation
1. Install [Node.js](https://nodejs.org/)
2. Install [MongoDB](https://mongodb.org/)
  - a replica set is needed to keep track of changes in db.
  - use mongod --replSet `name`; Note: `--auth` and `bind_ip=127.0.0.1` are recommended for production
3. Clone the NuExplorer repo to the server you want to deploy it on.
4. Load dependencies with `sudo npm install` before deploying.
5. From the command line, invoke `node server.js` to launch the application.


LICENSE
----------------------------
The MIT License (MIT)

Copyright (c) 2016 Johny Georges

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.