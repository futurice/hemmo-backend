# hemmo-backend

## Overview

This is the backend for Pelastakaa Lapset ry's Hemmo mobile app. It provides authentication functionality as well as various API endpoints for both employees and users. See API documentation in docs folder.

## Running the server

* Install npm dependencies `npm install`
* Start server `npm run watch`

Note that currently this same backend serves both admin panel and mobile app which is unsafe in production as anyone can register as an employee.

## Other

See `PelaryHemmo` React Native project for the mobile app and `hemmo-admin` React project for admin panel.
