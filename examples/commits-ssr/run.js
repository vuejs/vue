process.env.PORT = process.env.PORT || 8079;
process.env.VUE_ENV = process.env.VUE_ENV || 'server';

require('babel-register');
require('./server');
