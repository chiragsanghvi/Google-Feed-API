// Load Http library
var http = require('http'),
	sys = require('sys'),
    Router = require('node-simple-router'),
    gfeed = require('./feed-api.js'),
	url = require('url');

// Create a new instance of router
var router = Router({ logging: false });

// Route for get connections
router.get('/', function (req, res) {
 	
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
 
  // Create a domain for exception handling
  var domain = require('domain').create();

  domain.on('error', function(err) {
  	try {
	  	res.writeHead(500, {'Content-Type': 'application/json'});
		res.end(JSON.stringify({message: "Server Error" }));
	} catch(e) {}

    sys.puts("Error "  + err.message + '\n' + err.stack);
    domain.dispose();
  });

  domain.run(function() {

	  var url_parts = url.parse(req.url, true);
	  var query = url_parts.query;
	  var feed = new gfeed.Feed(query.q);
	  feed.setNumEntries(-1);

	  feed.listItems(function(response) {
	  	    if (response.responseData != null) {
	  			res.writeHead(200, {'Content-Type': 'application/json'});
	  			res.end(JSON.stringify(response));
	  		} else {
	  			res.writeHead(400, {'Content-Type': 'application/json'});
	  			res.end(JSON.stringify(response));
	  		}
	  });
  });

});

// Start an HTTP Server for logs with router
var httpServer = require('http').createServer(router);

httpServer.on('error', function(e) {
  sys.puts("\n\nHttp server error " + e.message + "\n Stack: " + e.stack + "\n\n");
});

// Start listening on http-port in config
httpServer.listen(8094);

console.log("HTTP Server running at port 8094\n");