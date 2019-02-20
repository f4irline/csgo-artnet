http = require('http');
fs = require('fs');

const HOST = 'localhost';
const PORT = 8080;

server = http.createServer( function(req, res) {

    if (req.method == 'POST') {
        console.log("Handling POST request...");
        res.writeHead(200, {'Content-Type': 'text/html'});

        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            console.log("POST payload: " + body);
        	res.end( '' );
        });
    } else {
        console.log("Not expecting other request types...");
        res.writeHead(200, {'Content-Type': 'text/html'});
		var html = '<html><body>HTTP Server at http://' + HOST + ':' + PORT + '</body></html>';
        res.end(html);
    }

});

server.listen(PORT, HOST);
console.log('Listening at http://' + HOST + ':' + PORT);
