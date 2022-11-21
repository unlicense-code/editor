// code-oss-dev/src/buildfile.js (CJS)
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
//import type { Plugin, RollupOptions, WarningHandlerWithDefault } from 'rollup';
import { string } from 'rollup-plugin-string';
import { dirname, join } from 'path'
import { fstat } from 'node:fs';
import fs from 'node:fs/promises'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const somePath = join(__dirname, '../some-dir-or-some-file')

// A Module that returns Module Compositions
const buildfile = { 
    input: ["code-oss-dev/src/buildfile.js", "code-oss-dev/scripts/update-xterm.js"],
    plugins: [commonjs(), { transform(code){ return code.replaceAll('var','const')}}],
    output: { dir: `${__dirname}/../build` },
};

const updateXterm = { 
    input: ["code-oss-dev/scripts/update-xterm.js"],
    plugins: [
        //{ transform(code){ return code.replaceAll('require(','import(\'node:')}}
        { async load (resolvedPath) {
            return `${await fs.readFile(resolvedPath)}`
                .replaceAll("require('","await import('node:") 
        } },
    ],
    output: { dir: `${__dirname}/../build` },
};
export default [buildfile,updateXterm]

