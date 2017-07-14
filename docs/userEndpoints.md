## Hemmo Mobile API

This is documentation for the mobile-facing API.

Children are required to register before accessing API endpoints. However, after registration, the received token can be used indefinitely and should be stored client side. If the token is lost, re-registration is required.

## Child registration

Registers a new child to the service.

```
POST /app/children

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
PATCH /app/children/{childId}

payload {
  name: (String)
}
```

## Data Endpoints

* Creating feedback

```
POST /app/feedback

Create a new feedback session.

request payload {
  activities: [
    {
        main: (String),
        sub: (String),
        like: (Number),
    }
  ] OPTIONAL
  moods: Array(String) OPTIONAL
}

returns {
  feedbackId: (String) id for the newly created feedback session,
  activities: [...],
  moods: [...],
}
```

* Modify feedback

```
PATCH /app/feedback/{feedbackId}

Updates an existing feedback session.

request payload {
  activities: [
    {
        main: (String),
        sub: (String),
        like: (Number),
    }
  ] OPTIONAL
  moods: Array(String) OPTIONAL
}

returns {
  feedbackId: (String) id for the newly created feedback session,
  activities: [...],
  moods: [...],
}
```

* Add attachment to feedback

```
POST /app/feedback/{feedbackId}/attachments

Upload a new attachment to feedback session with id feedbackId.
File should be uploaded as type `multipart/form` inside the `data` field.

request headers {
  Authorization: token (String),
}

returns {
  attachmentId
}
```
