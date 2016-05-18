// vue
import Vue from '../../dist/vue.common.js';
import { compileToFunctions } from '../../dist/compiler.js';
import createRenderer from '../../dist/server-renderer.js';

const { renderToString } = createRenderer();

const compileTemplateWithOptions = (options) => {
  const res = compileToFunctions(options.template);
  Object.assign(options, res);
  return options;
};

const renderVmWithOptions = (options, cb) => {
  options = compileTemplateWithOptions(options);
  renderToString(new Vue(options), cb);
};

// server
import fs from 'fs';
import url from 'url';
import http from 'http';
import https from 'https';

// import and register component
import AppOptions from './common/app';
import Commits from './common/commits';

const commits = Vue.component('commits', compileTemplateWithOptions(Commits.options));

const apiUrl = 'https://api.github.com/repos/vuejs/vue/commits?per_page=3&sha=';
const branches = ['master', 'dev', 'next'];

const loadCommits = (branch, cb) => {
  const branchUrl = url.parse(`${apiUrl}${branch}`);
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
      res.end(fs.readFileSync('./dist/app.js').toString());
      break;

    // retrieve the data and render the layout with embedded app
    default:
      // lookup branch from request path (/dev or /next), fallback to master
      const requestedBranch = req.url.substring(1);
      const branch = branches.indexOf(requestedBranch) != -1 ?
        requestedBranch :
        branches[0];

      loadCommits(branch, (commits) => {
        const data = {
          branches: branches,
          currentBranch: branch,
          commits: commits,
          apiUrl: apiUrl
        };
        Object.assign(AppOptions, { data: data });
        renderVmWithOptions(AppOptions, (err, result) => {
          if (err) { console.error(err); }
          let rendered = fs.readFileSync('./layout.html').toString();
          rendered = rendered.replace('{{ app }}', result);
          rendered = rendered.replace('{{ initialState }}', JSON.stringify(data));
          res.end(rendered);
        });
      });
  }
};

// start server
const port = process.env.PORT || 3000;
http.createServer(handleRequest).listen(port, () => {
  console.log(`Server started: http://localhost:${port}`);
});
