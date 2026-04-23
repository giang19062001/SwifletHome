const helmet = require('helmet');
const req = {};
const res = { setHeader: (k, v) => console.log(k, v) };
const next = () => {};

const mw = helmet({
  contentSecurityPolicy: {
    directives: {
      scriptSrcAttr: ["'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    }
  }
});

mw(req, res, next);
