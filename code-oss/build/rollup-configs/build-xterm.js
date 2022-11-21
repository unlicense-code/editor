const cp = await import('node:child_process');
const path = await import('node:path');
const fs = await import('node:fs/promises');

//for (const cwd of [vscodeDir, path.join(vscodeDir, 'remote'), path.join(vscodeDir, 'remote/web')]) {
const moduleNames = [
	'xterm',
	'xterm-addon-canvas',
	'xterm-addon-search',
	'xterm-addon-unicode11',
	'xterm-addon-webgl'
];

//for (const cwd of [vscodeDir, path.join(vscodeDir, 'remote')]) {
const backendOnlyModuleNames = [
	'xterm-headless',
	'xterm-addon-serialize'
];

const useVersionTag = "beta";
// import.resolve('code-oss-dev/package.json'); 
const vscodeDir = "code-oss-dev"
const pkg = { dependencies: {
    "xterm": "5.1.0-beta.49",
    "xterm-addon-canvas": "0.3.0-beta.23",
    "xterm-addon-search": "0.11.0-beta.7",
    "xterm-addon-serialize": "0.9.0-beta.3",
    "xterm-addon-unicode11": "0.5.0-beta.1",
    "xterm-addon-webgl": "0.14.0-beta.32",
    "xterm-headless": "5.1.0-beta.49",
}}; // await fs.readFile(path.join(codeOssDev, 'package.json'));

const getVersionFromModuleSpecifier = (specifier) => specifier.split('@')[1];
const fetchLatestModuleVersion = (moduleName) => {
    const stdout = cp.execSync(`npm view ${moduleName}@${useVersionTag} --json`).toString()
    
    const latestVersion = JSON.parse(`${stdout.slice(0,256).split(',')[0]} }`);

    if (pkg.dependencies[moduleName] !== getVersionFromModuleSpecifier(latestVersion._id)) {
        return latestVersion._id;
    }        
};

const update = () => {
	
    const backendOnlyModules = backendOnlyModuleNames
        .map(fetchLatestModuleVersion)
        .filter(x=>x) // Filtered out typeof undefined

    const backendAndWeb = moduleNames
        .map(fetchLatestModuleVersion)
        .filter(x=>x) // Filtered out typeof undefined
    
    if (backendOnlyModules.length) {

        for (const cwd of [
            vscodeDir,
            path.join(vscodeDir, 'remote')
        ]) {
            //cp.execSync(`yarn add ${backendOnlyModules.concat(backendAndWeb).join(' ')}`, { cwd });
        }
        console.log(`Needs Update ${path.join(vscodeDir, 'remote')}: ${           
            backendOnlyModules.join(' ')
        }`);
        console.log(`Needs Update ${path.join(vscodeDir, 'remote/web')}: ${backendAndWeb.join(' ')}`);
    } else {
        console.log(`Skiped: ${backendOnlyModuleNames.join(' ')}` )
    }
    
    

    
    //console.log(`${path.join(cwd, 'package.json')}: Updating ${backendAndWeb.join(' ')||''}`);
    // for (const cwd of [
    //     vscodeDir,
    //     path.join(vscodeDir, 'remote'),
    //     path.join(vscodeDir, 'remote/web')]
    // ) {    
        
    //     //cp.execSync(`yarn add ${backendAndWeb.join(' ')}`, { cwd });
    // }

}

update();



/** Microsoft code style example */
// const vscodeDir = process.argv.length >= 3 ? process.argv[2] : process.cwd();
// if (path.basename(vscodeDir) !== 'vscode') {
// 	console.error('The cwd is not named "vscode"');
// 	return;
// }
// function getLatestModuleVersion(moduleName) {
        
//             // let versions = JSON.parse(stdout);
// 			// // HACK: Some bad versions were published as v5 which cannot be unpublished, ignore these
// 			// if (moduleName === 'xterm-addon-canvas') {
// 			// 	versions = versions.filter(e => ![
// 			// 		'0.12.0',
// 			// 		'5.0.0-beta.1',
// 			// 		'5.0.0-beta.2',
// 			// 		'5.0.0-beta.3',
// 			// 		'5.0.0-beta.4',
// 			// 	].includes(e));
// 			// }
			
//             // resolve(versions[versions.length - 1]);
	
// }
