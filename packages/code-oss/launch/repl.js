const connections = [];
const repl = await import('node:repl');

const myEval = (cmd, context, filename, callback) =>
	callback(null, cmd);

const myWriter = (output) => output.toUpperCase();


const httpRepl = (req, res) => req.pipe(repl.start()).pipe(res);

const http = await import('node:http');
// repl.start({ prompt: 'Node.js via stdin> ', input: process.stdin,  output: process.stdout });

const input = new ReadableStream({
	async start(controller) {

		const httpServer = http.createServer(
			(req, res) => controller.enqueue([req, res])
		).listen(app.port);

		const unixSocket = (await import('node:net')).createServer((socket) => {
			repl.start({
				prompt: 'Node.js via Unix socket> ',
				input: socket, output: socket,
			}).on('exit', socket.end);
		}).listen('/tmp/node-repl-sock')




	}
});
