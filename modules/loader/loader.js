// # loads ECMAScript
// uses ../../rollup/rollup.js
// ## Implements generic ECMAScript Loading Methods
// In a shim able inject able way.  fully rollup compatible
// see: vscode loader as example.
const loader = ({ 
  input: [] // note: can also be used for mapping { 'specifier': 'uri' }
  plugins: [{
    buildStart: () => {}, // Use this if input does not fit your needs
    resolveId: (Uri, baseUri) => {},
    load: (specifier) => {},
    transform: (code) => {},
  }],
  output: {
    dir: "",
    plugins: [{
      resolveId: (Uri, baseUri) => {},
      load: (specifier) => {},
      transform: (code) => {},
    }],
  },
  onwarn (warning, warn) {
    // skip certain warnings
    if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;

    // throw on others
    // Using Object.assign over new Error(warning.message) will make the CLI
    // print additional information such as warning location and help url.
    if (warning.code === 'MISSING_EXPORT') throw Object.assign(new Error(), warning);
    // Many warning do contain loc information to detect src position.
    const { loc, frame, message } = warning;
    if (loc) {
      console.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
      (frame) && console.warn(frame);
    } else {
      console.warn(message);
    }
    // Use default for everything else
    warn(warning);
  }
})


// rollup.config.js
export default {
  
  
  
  load,
  evaluate, 
  watch,
  plug
})
