var net = require('net');
var fs = require('fs');
var exec = require('child_process').exec;

var HOST = '190.114.192.40';
var PORT = 6969;
var open = true;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {

    // We have a connection - a socket object is assigned to the connection automatically
    //console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        open = true;
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        var order = 'rtl_sdr captura.bin -s ' + data.toString().split(" ")[0] + ' -f ' + data.toString().split(" ")[1] + ' -n ' + data.toString().split(" ")[2] + ' -g ' + data.toString().split(" ")[3];
        console.log(order);

        exec(order , function(error, stdout, stderr) {
            fs.readFile("captura.bin",function(error,data2){
                if(error){
                    sock.write("Error");
                  }else{
                    if (open){
                      var testBuff = new Buffer(data2);
                      var buf = new Buffer(4);
                      var length = testBuff.length >>> 0;
                      buf.writeUInt32BE(length, 0);
                      sock.write(buf);
                      sock.write(testBuff);
                    }
                  }
                })
        });
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        open = false;
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });

}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);
