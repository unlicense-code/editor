// taking http requests also via other methods!
// usage with net.socket.on('data', onHttpData)
const onHttpData = (data) => {
	const [requestHeader, ...bodyContent] = data.toString().split('\r\n\r\n');
	const [firstLine, ...otherLines] = requestHeader.split('\n');
	const [method, path, httpVersion] = firstLine.trim().split(' ');
	const headers = Object.fromEntries(otherLines.filter(_ => _)
		.map(line => line.split(':').map(part => part.trim()))
		.map(([name, ...rest]) => [name, rest.join(' ')]));

	var body;
	try {
		body = JSON.parse(bodyContent);
	} catch (err) {/* ignore */ }

	const request = { method, path, httpVersion, headers, body };
	//console.log({ request })
	socket.write(`HTTP/1.1 200 OK\n\nhallo ${request.body.name}`)
	socket.end((err) => { console.log(err) })
};