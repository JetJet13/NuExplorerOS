var winston = require('winston');

winston.add(winston.transports.File, {
    
    
    
    level:'debug', //Level of messages that this transport should log.
    silent:false, //Boolean flag indicating whether to suppress output.
    colorize:true, //Boolean flag indicating if we should colorize output.
    timestamp:true, //Boolean flag indicating if we should prepend output with timestamps (default false). If function is specified, its return value will be used instead of timestamps.
    filename: './public/app/logs/all-logs.log', //The filename of the logfile to write output to.
    maxsize:5242880, // 5mb. Max size in bytes of the logfile, if the size is exceeded then a new file is created.
    maxFiles:5, //Limit the number of files created when the size of the logfile is exceeded.
    //The WriteableStream to write output to.
    json:true, //If true, messages will be logged as JSON (default true).
    prettyPrint:true,
    handleExceptions: true
    //Boolean flag indicating if we should util.inspect the meta (default false).
    //depth Numeric indicating how many times to recurse while formatting the object with util.inspect (only used with prettyPrint: true) (default null, unlimited)

    
    
});
winston.info('Chill Winston, the logs are being captured 2 ways - console and file')

module.exports = winston;
