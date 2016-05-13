// vue
import Vue from '../../dist/vue.common.js';
import { compileToFunctions } from '../../dist/compiler.js';
import createRenderer from '../../dist/server-renderer.js';

const { renderToString } = createRenderer();
const renderVmWithOptions = (options, cb) => {
  const res = compileToFunctions(options.template, {
    preserveWhitespace: false
  });
  Object.assign(options, res);
  delete options.template;
  renderToString(new Vue(options), (err, res) => cb(res));
};

// server
import fs from 'fs';
import url from 'url';
import http from 'http';
import https from 'https';

const layout = fs.readFileSync('./templates/layout.html').toString();
const vmTemplate = fs.readFileSync('./templates/vm.html').toString();

// ideally this would be a separate module that client and server could share.
// for now we just duplicate the code to keep the example simple.
const filters = {
  truncate: v => v.indexOf('\n') > 0 ? v.slice(0, v.indexOf('\n')) : v,
  formatDate: v => v.replace(/T|Z/g, ' ')
};

const apiURL = 'https://api.github.com/repos/vuejs/vue/commits?per_page=3&sha=';
const branches = ['master', 'dev', 'next'];

const loadCommits = (branch, cb) => {
  const branchUrl = url.parse(`${apiURL}${branch}`);
  const options = {
    headers: {'user-agent': 'Vue.js SSR example'},
    host: branchUrl.host,
    path: `${branchUrl.path}${branchUrl.search}`
  }
  https.get(options, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => cb(JSON.parse(body)));
  });
};

const handleRequest = (req, res) => {
  switch (req.url) {
    // handle external file requests
    case '/vue.js':
      res.end(fs.readFileSync('../../dist/vue.js').toString());
      break;

    case '/app.js':
      res.end(fs.readFileSync('./app.js').toString());
      break;

    // retrieve the data and render the layout with embedded app
    default:
      // lookup branch from request path (/dev or /next), fallback to master
      const requestedBranch = req.url.substring(1);
      const branch = branches.indexOf(requestedBranch) != -1 ?
        requestedBranch :
        branches[0];

      loadCommits(branch, (commits) => {
        renderVmWithOptions({
          template: vmTemplate,
          filters: filters,
          data: {
            branches: branches,
            currentBranch: branch,
            commits: commits,
            apiURL: apiURL
          }
        }, result => {
          const rendered = layout.replace('{{ body }}', result);
          res.end(rendered);
        });
      });
  }
}

// start server
const port = process.env.PORT || 3000;
http.createServer(handleRequest).listen(port, () => {
  console.log(`Server started: http://localhost:${port}`);
});
