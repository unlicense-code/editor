// TODO: Apply total args overwrite patch but this is only a poc
// Configuration for a PWA/Extension / Web Module
export const window = { // channel: "stable",
	executablePath: './chromium', // you need to link it manualy to ./chromium i do not setup that now
	headless: false,
	defaultViewport: null, // Fix window-size
	ignoreDefaultArgs: [
		'--enable-automation', // No Automation futures
		'--enable-blink-features=IdleDetection' // Disable experimental default flag
	],
	args: [ //--window-position=0,0 --window-size=1,1
		'--enable-features=NetworkService',
		'--no-default-browser-check', // Suppress browser check
		//'--window-size=800,800',
		'--start-maximized',
	],
	//ignoreHTTPSErrors: true, userDataDir: './myUserDataDir', //width: 800, //top: 20,
};