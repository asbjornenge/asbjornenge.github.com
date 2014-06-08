var express   = require('express')
var httpProxy = require('http-proxy')
var path      = require('path')

var conf = {
    path      : '/build',
    port      : 4000,
    proxyHost : 'localhost',
    proxyPort : 8000
}

/** Server */

var proxy = new httpProxy.createProxyServer({});
 
function apiProxy(host, port, path) {
  return function(req, res, next) {
    if(req.url.indexOf(path) !== 0) { next(); return }
    proxy.proxyRequest(req, res, {target: 'http://'+host+':'+port});
  }
}

var app = express()
    .use(express.static(__dirname+conf.path))
    // .use(apiProxy(conf.proxyHost, conf.proxyPort, '/projects'))
    // .use(apiProxy(conf.proxyHost, conf.proxyPort, '/api'))
    // .use(apiProxy(conf.proxyHost, conf.proxyPort, '/header/standalone'))
    // .use(apiProxy(conf.proxyHost, conf.proxyPort, '/applications'))
    .listen(conf.port, function(){
        console.log('Server running at http://localhost:'+conf.port)
    })

