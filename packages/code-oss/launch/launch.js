// @ts-check
// above inits typescript bridge to JSDOC Annotations and type comments for IDE Support. makes JS the better typescript by default.
const disableGoogleKeysMissingMessage = () => {
	process.env.GOOGLE_API_KEY = "no";
	process.env.GOOGLE_DEFAULT_CLIENT_ID = "no";
	process.env.GOOGLE_DEFAULT_CLIENT_SECRET = "no";
}

disableGoogleKeysMissingMessage();

// We use Puppeteer here because chromium engineers know what they do

const { window } = await import('./window.js');
const { index: html6 } = await import('./vfs.js');
window.args.push(`--app=data:text/html,${html6}`);

const browser = await (await import('puppeteer-core')).launch(window);
const openPages = await browser.pages();
openPages.forEach(async (page, i) => {
	if (i === 0) {
		const preloadScript = () => { }
		await page.evaluateOnNewDocument(preloadScript);
		//await page.goto('');// Read localstorage last viewed goto last viewed or offer interface.
	} else {
		page.close(); // Close eventual existing popups
	}
});

export { };
