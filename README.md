# hemmo-backend

## Overview

This is the backend for Pelastakaa Lapset ry's Hemmo mobile app. It provides authentication functionality as well as various API endpoints for both employees and users. See API documentation in docs folder.

## Running the server

* Install npm dependencies `npm install`
* Start server `npm run watch`

Note that currently this same backend serves both admin panel and mobile app which is unsafe in production as anyone can register as an employee.

## Nginx

This server should run behind a nginx-proxy that is configured with the supplied nginx.conf-file
located in the root of this project. First, install nginx if it's not already installed on the host
and then replace the configuration file with the supplied one. You also need to configure the
SSL-certificate for nginx to use. Put server.crt and server.key files to /etc/ssl/ directory
and start nginx. Mobile frontend is served from port 443 (SSL) and the admin panel from port 8003.
Note that the admin API is only accessible from the same LAN as this server is running on.

It is important not to skip installing and configuring nginx as without it the server is basically
accessible to anyone who has time to do even little digging around. Without the proxy, the server
is not secure.

## Other

See `PelaryHemmo` React Native project for the mobile app and `hemmo-admin` React project for admin panel.
