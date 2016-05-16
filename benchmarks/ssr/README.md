# Vue.js SSR benchmark

This benchmark renders a table of 1000 rows with 10 columns (10 thousand components). This benchmark is to demonstrate the overall speeds of Vue.js SSR and time to content comparison between `renderToString` and `renderToStream`.

To view the results follow the run section. Note that the overall completion time for the results are variable, this is due to other system related variants at run time (available memory, processing ect). In ideal circumstances both should finish within equal times.

`renderToStream` pipes the content through a stream which gives massive performance benefits over renderToString. This can be observed through the benchmark.

### run

``` bash
npm run bench:ssr
```
