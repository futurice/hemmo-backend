# Setup

[yarn](https://github.com/yarnpkg/yarn) 0.18+ must be present on your machine.

## Install project dependencies
```
$ yarn
```
Note that if you don't have the node version specified in `package.json`, you can use Node Version Manager to install and use it instead. So, for a `6.2.0` engine specified, you can use `nvm`:
```
nvm install 6.2.0
nvm use 6.2.0
```

## Install PostgreSQL

Look up instructions for your specific OS/distribution.

## Initialize DB
To create a `database` within the Postgres instance installed on your machine, owned by user `postgres` which by default is a `Superuser`, run the following:
```
$ createdb hemmo --user postgres
```

NOTE: If you get errors when running the above command:
[Troubleshooting PostgreSQL connection errors](/docs/POSTGRESQL.md)

```
$ yarn db:migrate
```

## Insert seed data
```
$ yarn db:seed
```

## Register admin user (production environments)
```
# Get URL from e.g. Heroku dashboard
$ DATABASE_URL=postgres://user:pass@hostname/dbname yarn register:admin
```

## Environment variables (production environments)
### Environments
#### Heroku

Set environment variables using:

```
$ heroku config.set ENV_VAR=[value]
```

#### Others

We recommend creating a [.env](https://www.npmjs.com/package/dotenv) file in
the root of the repository. Change directory to the repository root and simply:

```
$ cat ENV_VAR=[value] >> .env
```

### JWT token generation secret
Backend will refuse to run if NODE_ENV=production and this is not set:
```
SECRET=[secret-string]
```

Recommendation for generating `[secret-string]`:
```
$ node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
```

## Run backend
### Run in development, watching for changes
```
$ yarn watch
```

### Run in production
```
$ yarn start
```

Backend is now listening on port 3888 (or `$PORT` if set)
