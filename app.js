const http = require('http');
const { parse } = require('querystring');
const xmlDrawer = require('xml-drawer');

const PORT = process.env.PORT || 5000

const appForm = 'application/x-www-form-urlencoded';

const throwError = function(res, errString) {
	res.writeHead(400, {'Content-Type': 'text/html'});
	res.end(errString);
}

const drawXml = function(data, res) {
	if (data.xml) {
		xmlDrawer(data.xml).then(canvas => {
			res.writeHead(200, {'Content-Type': 'image/png'});
			canvas.createPNGStream().pipe(res);
		}).catch(err => {
			throwError(res, "An error occured while drawing the xml.")
		});
	} else {
		throwError(res, "No xml recieved.");
	}
}

const onPostData = function(req, res, callback) {
	let body = '';
	req.on('data', chunk => {
		body += chunk.toString();
	});
	req.on('end', () => {
		callback(parse(body), res);
	});
}

http.createServer(function (req, res) {
	if (req.method == "POST") {
		if (req.headers['content-type'] == appForm) {
			onPostData(req, res, drawXml);
		}
	} else if (req.method == "GET") {
		drawXml(parse(req.url.substring(2)), res);
	}
}).listen(PORT);