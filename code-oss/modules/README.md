# How to Clean Build vscode?
Should merge up with ../build


```
tsc -p node_modules/code-oss-dev/src/tsconfig.monaco.json --noEmit false --module ESNext --outDir ./monaco-esm-src
```

# TODO
- [ ] Clean Readmes
- [ ] merge converte https://github.com/xtermjs/xterm.js it is bad maintained needs love.
 - [ ] see: rollup-configs/xterm-resolver.js to see the case
