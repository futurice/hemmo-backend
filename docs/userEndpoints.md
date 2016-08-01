## Hemmo Mobile API

This is documentation for the mobile-facing API.

Users are required to register before accessing API endpoints. However, after registration, the received token can be used indefinitely and should be stored client side. If the token is lost, re-registration is required.

## User registration

Registers a new user to the service.

```
POST /register

payload {
  name: (String)
}

returns {
  token: (String)
}
```

Use the returned token in all subsequent requests in `Authorization` header in format
`Bearer $token`.


## Data Endpoints

* Creating session

```
POST /session

Create a new session.

returns {
  sessionId: (String) id for the newly created session
}
```

* Create new content

```
POST /content

Create a new content (audio file, text answer...)

Required headers: {
  Authorization: token,
  session: sessionId
}

request payload {
  contentType: ('file', 'text') REQUIRED,
  question: (String) OPTIONAL,
  answer: (String) OPTIONAL
}

returns {
  contentId: (String) Content id of the created content
}
```

* Update content

```
PUT /content/{contentId}

Update content question, answer or contentType

request headers {
  Authorization: token (String),
  session: sessionId (String)
}

request payload {
  question: (String) OPTIONAL,
  answer: (String) OPTIONAL,
  contentType: ('file', 'text') OPTIONAL
}

returns {
  contentId: (String)
}
```

* Add/Replace attachment

```
PUT /attachment/{contentId}

Upload a new attachment to content with id contentId.
File should be uploaded as multipart/form data.

request headers {
  Authorization: token (String),
  session: sessionId (String)
}

returns {
  contentId
}
```
