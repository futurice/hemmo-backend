## Hemmo Mobile API

This is documentation for the mobile-facing API.

Users are required to register before accessing API endpoints. However, after registration, the received token can be used indefinitely and should be stored client side. If the token is lost, re-registration is required.

## User registration

Registers a new user to the service.

```
POST /register => POST /app/children

payload {
  name: (String)
}

returns {
  token: (String)
}
```

Use the returned token in all subsequent requests in `Authorization` header in format
`Bearer $token`.

## Update child profile

```
PUT /users/{childId} => PATCH /app/children/{childId}

payload {
  name: (String)
}
```

## Data Endpoints

* Creating session

```
POST /session => POST /app/feedback

Create a new feedback session.

returns {
  sessionId: (String) id for the newly created session
}
```

* Create new content

```
POST /content => POST /app/content

Create a new content (audio file, text answer...)

Required headers: {
  Authorization: token,
}

request payload {
  feedbackId: (String),
  questions: [
    {
        question: (String),
        like: (Number),
        answer: (String),
        attachmentId: (String)
    }
  ] OPTIONAL
  moods: Array(String) OPTIONAL
}

returns {
  contentId: (String) Content id of the created content
}
```

* Update content

```
PUT /content/{contentId} => PATCH /app/content/{contentId}

Update content question, answer or contentType

request headers {
  Authorization: token (String),
}

request payload {
  feedbackId: (String),
  questions: (String) OPTIONAL,
  moods: Array(String) OPTIONAL
}

returns {
  contentId: (String)
}
```

* Add/Replace attachment

```
PUT /attachment/{contentId} => POST /app/content/{contentId}/attachments

Upload a new attachment to content with id contentId.
File should be uploaded as multipart/form data.

request headers {
  Authorization: token (String),
}

returns {
  contentId
}
```
