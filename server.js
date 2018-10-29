'use strict';
// create an API server
const Restify = require('restify');
const axios = require('axios');
const server = Restify.createServer({
	name: 'ARCBotMessenger'
});
const PORT = process.env.PORT || 3000;

server.use(Restify.jsonp());

// Tokens
const config = require('./config');

// FBeamer
const FBeamer = require('./fbeamer');
const f = new FBeamer(config.FB);

// Register the webhooks
server.get('/', (req, res, next) => {
	f.registerHook(req, res);
	return next();
});

// Receive all incoming messages
server.post('/',
	(req, res, next) => f.verifySignature(req, res, next),
	Restify.bodyParser(),
	(req, res, next) => {
		f.incoming(req, res, msg => {
			// Process messages
			const {
				message,
				sender
			} = msg;

			if (message.text) {
				axios.post('http://209.97.143.4:8000/arclight/parsemessage', {
			    model_id: '5bd642c741d1701e640c938e',
			    message: message.text
			  })
			  .then(function (response) {
						f.txt(sender, response.data.result.intent.name);
			    	f.txt(sender, `You just said ${message.text}`);
			  })
			  .catch(function (error) {
			    console.log(error);
			  });
			}
		});
		return next();
	});

// Subscribe
f.subscribe();

server.listen(PORT, () => console.log(`ARCBotMessenger running on port ${PORT}`));
