# hemmo-backend

## Overview

This is the backend for Pelastakaa Lapset ry's Hemmo mobile app. It provides authentication functionality as well as various API endpoints for both employees and children. See API documentation in docs folder.

Mobile app: https://github.com/futurice/PelaryHemmo

Admin frontend app: https://github.com/futurice/hemmo-admin/

## Documentation

- [Setup](/docs/SETUP.md)
- [Deployment](/docs/DEPLOYMENT.md)
- [Architecture](/docs/ARCHITECTURE.md)

## Tech stack

* [hapi.js](https://hapijs.com/), a server framework for Node.js
* [knex](http://knexjs.org/), SQL query builder

### Misc

* [lodash](https://lodash.com/), various useful JavaScript utils

### Tools

* [babel](https://babeljs.io/), transpile ES6 syntax into ES5
* [eslint](http://eslint.org/), make sure your code is remotely sane, using [Airbnb's JS style guide](https://github.com/airbnb/javascript)
* [jest](https://facebook.github.io/jest/), painless JavaScript testing
