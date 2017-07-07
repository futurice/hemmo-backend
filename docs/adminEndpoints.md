# Hemmo Admin API

This document describes the Hemmo Admin API. Employees of Pelary can
register to the service as employees and see data from the mobile frontend.

# Employee users

## Authentication

* Register new employee user

Registers the employee with provided credentials.

```
POST /admin/users

payload
{
  email: (String),
  name: (String),
  password: (String)
}

returns
{
  token: (String),
}
```

* Authenticate employee user

Authenticate the employee with provided credentials.

```
POST /admin/users/authenticate

payload
{
  email: (String),
  password: (String)
}

returns
{
  token: (String),
}
```

All below requests require authentication.
Use the returned token in the `Authorization` header like so: `Bearer $TOKEN`

## Employee user management

* Modify employee user profile

```
PATCH /admin/users/{userId}

payload
{
  email: (String),
  name: (String),
  password: (String)
}

```

* Get a list of employees

Fetches all employees. Supports filtering

query parameters {
  assignedChildName: (String) Child name,
  email: (String) Employee e-mail,
  order: asc/desc,
  limit: (Integer),
  offset: (Integer),
}

```
GET /admin/users

returns {
  employees: [
    {
      email: (String),
      name: (String),
      id (Integer),
      verified: (Boolean),
    },
    ...
  ]
}
```

* Get detailed employee data

Get more detailed data about one employee.

```
GET /admin/users/{userId}

returns
{
  name: (String), employee name,
  email: (String), employee email,
  id (Integer),
  verified: (Boolean), tells if employee is verified
}
```

* Verify employee user

Mark a new employee as verified (ie. allow newly registered employee user to log-in)

```
PUT /admin/users/verify/{userId}

returns
{
  id: (Integer)
}
```

## Child user management

* Get list of children

Fetches data about all children. Supports filtering.

```
GET /admin/children

query parameters {
  childName: (String) Child name,
  assigneeName: (String) Assignee name,
  order: asc/desc,
  limit: (Integer),
  offset: (Integer),
}

returns
{
  users : [
    {
      name: (String),
      id: (Integer),
      assigneeId: (Integer)
    }
  ]
}
```

* Get child data

Fetches detailed child data, including feedback sessions.

```
GET /admin/children/{childId}

returns
{
  name: (String),
  assignee: {
    name: (String),
    id: (Integer)
  }
  sessions: [
    startedAt: (Timestamp),
    reviewed: (Boolean),
    id: (String)
  ]
}
```

* Update child data

```
PATCH /admin/children/{userId}

payload {
  assigneeId: (Integer) id of employee to be assigned to this user
}

returns 200/40x
```

# Feedback sessions

* Get all feedback sessions

Fetch all feedback sessions. Supports filtering.

```
GET /admin/feedback

query parameters {
  childName: (String) Child name,
  assigneeName: (String) Assignee name,
  reviewed: false/true,
  order: asc/desc,
  limit: (Integer),
  offset: (Integer),
}

returns {
  feedback:
  [
    {
      id: (String),
      user: {
        id: (Integer),
        name: (String),
        assigneeId: (String),
      }
      reviewed: (Boolean),
      startedAt: (Timestamp),
    },
    ...
  ]
}
```

* Get feedback session data

Fetch data about a feedback session

```
GET /admin/feedback/{feedbackId}

returns
{
  id: (String),
  user: {
    id: (Integer),
    name: (String),
    assigneeId: (Integer),
  }
  reviewed: (Boolean),
  startedAt: (Timestamp),
  content: [{
    id: (String),
    createdAt: (Timestamp),
    moods: [(String)],
    questions: [{
        question: (String),
        like: (Number),
        answer: (String),
        attachmentId: (String)
    }]
  }]
}
```

* Modify a feedback session's status.

```
PATCH /admin/feedback/{sessionId}

payload
{
  reviewed: (Boolean, optional),
  assigneeId: (Integer, optional)
}

returns {
  reviewed: (Boolean, optional),
  assigneeId: (Integer, optional)
}
```

* Get content attachment

Fetches attachment with contentId
```
GET /admin/content/{contentId}/attachments

returns the file or 404
```
