const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://25.41.17.99:5000',
      changeOrigin: true,
    })
  );
};
