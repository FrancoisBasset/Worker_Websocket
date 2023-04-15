const { randomInt } = require('crypto');
const { createClient } = require('redis');

const { parentPort } = require('worker_threads');

parentPort.on('message', async ([cid, mid]) => {
	const redisClient = createClient();

	await redisClient.connect();

	let bet = await redisClient.rPop(mid);

	do {
		const idx = parseInt(bet.split(':')[2]);

		const delay = randomInt(300, 500);

		await new Promise(r => setTimeout(r, delay));
		fetch('http://localhost:8080/bet', {
			method: 'POST',
			body: JSON.stringify({
				command: 'processed',
				idx: idx,
				cid: cid,
				mid: mid
			})
		});
	} while ((bet = await redisClient.rPop(mid)) != null);
});
