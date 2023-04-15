const { createClient } = require('redis');

const redisClient = createClient();

let wsConnection;

//// WORKER
const { Worker } = require('worker_threads');

const worker = new Worker('./worker.js');
worker.on('online', async () => {
	console.log('Launching intensive CPU task');
	await redisClient.connect();
});

//// HTTP SERVER
const http = require('http');
const fs = require('fs');

const server = http.createServer(async function (request, response) {
	console.log('Received request for ' + request.url);

	if (request.method == 'GET' && request.url == '/') {
		const html = fs.readFileSync('./index.html');
		response.write(html);
	} else if (request.method == 'POST' && request.url == '/bet') {
		request.on('data', data => {
			data = JSON.parse(data.toString());

			wsConnection.sendUTF(JSON.stringify({
				command: 'processed',
				result: {
					idx: data.idx
				},
				mid: data.mid
			}));
		});
	}

	response.end();
});
server.listen(8080, function () {
	console.log('Server is listening on port 8080');
});

//// WEBSOCKET SERVER
const WebSocketServer = require('websocket').server;
const crypto = require('crypto');
let cid;

const wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});

wsServer.on('request', async function (request) {
	wsConnection = request.accept('echo-protocol', request.origin);

	console.log('Connection accepted');
	cid = crypto.randomUUID();

	wsConnection.on('message', async function (message) {
		const data = JSON.parse(message.utf8Data);

		const bets = [];

		console.log('Added to Redis :');
		for (let i = 0; i < data.count; i++) {
			const bet = `${cid}:${data.mid}:${i + 1}`;
			console.log(bet);
			bets.push(bet);
		}

		redisClient.lPush(data.mid, bets);

		console.log('Send to worker : ' + data.mid);
		worker.postMessage([cid, data.mid]);
	});
});
