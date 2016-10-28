'use strict';

module.exports = (server, options) => {
  return new Promise(resolve => {
    return server.inject(options, (res) => {
      resolve(res);
    });
  });
};
