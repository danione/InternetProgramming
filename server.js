const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

var fs = require('fs');


fs.readFile('./index.html', function (err, html) {
    if (err) {
        throw err;
    }
    const server = http.createServer(function(request, response) {
        response.writeHeader(200, {"Content-Type": "text/html"});
        response.write(html);
        response.end();
    });

    server.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
    });

});
