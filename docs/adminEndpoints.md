# Hemmo Admin API

This document describes the Hemmo Admin API. Employees of Pelary can
register to the service as employees and see data from the mobile frontend.

## Authentication

* Register new employee

Registers the employee with provided credentials.

```
POST /employees/register

payload
{
  email: (String),
  name: (String),
  password: (String)
}

returns
{
  token: (String),
  employeeId: (Integer)
}
```
Use the returned token in `Authorization` header in format
`Bearer $token`


* Renew JSON Web token

Authenticate employee with credentials.

```
POST /employees/authenticate

payload
{
  email: (String),
  password: (String)
}

returns
{
  token: (String),
  employeeId: (Integer)
}
```

Use the returned token in `Authorization` header in format
`Bearer $token`

* Update mobile user's session

Update some session that was created by the mobile user. Update consists of optional values of `employeeId` that will be assigned to that session and boolean `review` that indicates the session review status.

```
PUT /sessions/{sessionId}

payload
{
  employeeId: (Integer, optional) id of employee who will be assigned,
  reviewed: (Boolean, optional)
}

returns status code (200, 400) representing the outcome.
```


* Get data about employees

Fetches all employees.

```
GET /employees

returns {
  employees: [
    {
      name: (String),
      employeeId (Integer)
    },
    ...
  ]
}
```

* Get detailed employee data

Get more detailed data about one employee.

```
GET /employees/{employeeId}

returns
{
  name: (String), employee name,
  email: (String), employee email,
  sessions: {
    startedAt (Timestamp),
    reviewed (Boolean),
    sessionId (String)
  }
}
```

* Get all users

Fetches data about all mobile client users.

```
GET /users

returns
{
  users :
    [
      {
        name: (String),
        userId: (Integer)
      }
    ]
}
```

* Get detailed user data

Fetches data about one user, including sessions.

```
GET /users/{userId}

returns
{
  name: (String),
  sessions: [
    startedAt: (Timestamp),
    reviewed: (Boolean),
    sessionId: (String)
  ]
}
```

* Get all sessions

Fetch all sessions

```
GET /sessions

returns {
  sessions:
  [
    {
      sessionId: (String),
      assigneeId: (String),
      user: {
        userId: (Integer),
        name: (String)
      }
      reviewed: (Boolean),
      startedAt: (Timestamp),
    },
    ...
  ]
}
```

* Get session data

Fetch data about a session

```
GET /sessions/{sessionId}

returns
{
  sessionId: (String),
  assigneeId: (Integer),
  user: {
    userId: (Integer),
    name: (String)
  }
  reviewed: (Boolean),
  startedAt: (Timestamp),
  content:
  {
    contentId: (String),
    question: (String),
    contentType: (String, 'file' or 'text'),
    createdAt: (Timestamp),
    hasAttachment: (Boolean)
  }
}
```

* Get content attachment

Fetches attachment with contentId
```
GET /attachment/{contentId}

returns the file or 404
```
