#!/usr/bin/env node
'use strict';

import initServer from './server';

initServer()
  .then(server => {
      // Start the server
      server.start(err => {
        console.log('Server running at:', server.info.uri);
      });
  })
  .catch(err => {
      console.err('Error while starting server:', err);
  });
