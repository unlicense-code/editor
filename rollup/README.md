# rollup
A Rollup distribution based on unobscured build of rollup via build instructions inside 'build.js'
which creates the ./src_rollup/plugins dirs which we use as base. for './rollup.js' programatical.
to offer our [/modules/loader/](https://github.com/unlicense-code/editor/blob/main/modules/loader/loader.js)


## Documentation
How to use rollup as loader and how to reuse the cache as userland ECMAScript Module cache to dynamicaly build
run able ECMAScript Scripts that run in any environment/worker

```js
const modulesCache = rollup().then(async chunksOrAssets => (await chunksOrAssets.generate()).cache)
const higherModuleCache = rollup({ 
  input: 'imported-specifier',
  cache: modulesCache 
}).then(async chunksOrAssets => (await chunksOrassets.generate()).cache)
// Loope watch 
// rollup({ cache: modulesCache }).then(async chunksOrAssets => (await chunksOrAssets.generate({ format: 'iife' })).build());
// rollup({ cache: modulesCache }).then(async chunksOrAssets => (await chunksOrAssets.generate({ format: 'esm' })).build());
```
