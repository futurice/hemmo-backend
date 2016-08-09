/*eslint-disable func-names*/
'use strict';

let _ = require('lodash');

let dummyData = {
  contentIds: [
    'f8f8b3d7-cba0-47cf-ab13-d51e77437222',
    'da45ca28-eda6-42e0-af7d-f1cf70a3cc15',
    'da45ca28-eda6-42e0-af7d-f1cf70a3cc16',
    'da45ca28-eda6-42e0-af7d-f1cf70a3cc17',
    'da45ca28-eda6-42e0-af7d-f1cf70a3cc18'
  ],
  sessionIds: [
    'a0af9302-021b-4537-b2f4-7bd37aed43cd',
    'a0af9302-021b-4537-b2f4-7bd37aed43ce',
    'a0af9302-021b-4537-b2f4-7bd37aed43cf',
    'a0af9302-021b-4537-b2f4-7bd37aed43df'
  ],
  userIds: [
    1,
    2
  ],
  users: [
    {
      name: 'dummy user'
    },
    {
      name: 'another user'
    }
  ],
  employeeIds: [
    1,
    2
  ],
  employees: [
    {
      name: 'foo',
      email: 'foo@bar.com',

      // 'foobar'
      password: '$2a$10$jqtfUwulMw6xqGUA.IsjkuAooNkAjPT3FJ9rRiUoSTsUpNTD8McxC'
    },
    {
      name: 'another employee',
      email: 'foo@baz.com',

      // 'foobar'
      password: '$2a$10$jqtfUwulMw6xqGUA.IsjkuAooNkAjPT3FJ9rRiUoSTsUpNTD8McxC'
    }
  ]
}

exports.seed = function(knex) {
  // first delete old dummy data
  return knex('content').whereIn('contentId', dummyData.contentIds).del()
  .then(() => {
    return knex('content').whereIn('contentId', dummyData.contentIds).del();
  })
  .then(() => {
    return knex('sessions').whereIn('sessionId', dummyData.sessionIds).del();
  })
  .then(() => {
    return knex('users').whereIn('id', dummyData.userIds).del();
  })
  .then(() => {
    return knex('employees').whereIn('id', dummyData.employeeIds).del();
  })

  // then insert new dummy data

  /*
   * Users
   */
  .then(() => {
    return knex('users').insert({
      name: dummyData.users[0].name,
      id: dummyData.userIds[0]
    });
  })

  .then(() => {
    return knex('users').insert({
      name: dummyData.users[1].name,
      id: dummyData.userIds[1]
    });
  })

  /*
   * Employees
   */
  .then(() => {
    return knex('employees').insert({
      name: dummyData.employees[0].name,
      id: dummyData.employeeIds[0],
      password: dummyData.employees[0].password,
      email: dummyData.employees[0].email
    });
  })

  .then(() => {
    return knex('employees').insert({
      name: dummyData.employees[1].name,
      id: dummyData.employeeIds[1],
      password: dummyData.employees[1].password,
      email: dummyData.employees[1].email
    });
  })

  /*
   * Sessions
   */
  .then(() => {
    return knex('sessions').insert({
      sessionId: dummyData.sessionIds[0],
      userId: dummyData.userIds[0]
    });
  })
  .then(() => {
    return knex('sessions').insert({
      sessionId: dummyData.sessionIds[1],
      userId: dummyData.userIds[0]
    });
  })
  .then(() => {
    return knex('sessions').insert({
      sessionId: dummyData.sessionIds[2],
      userId: dummyData.userIds[1]
    });
  })

  /*
   * Content
   */
  .then(() => {
    return knex('content').insert({
      contentType: 'audio',
      contentPath: __dirname + '/test.mp3',
      hasAttachment: true,
      contentId: dummyData.contentIds[0],
      sessionId: dummyData.sessionIds[0],
      createdAt: knex.fn.now(),
      like: 1,
      question: 'test question 1',
      answer: 'hello world'
    });
  })

  .then(() => {
    return knex('content').insert({
      contentType: 'text',
      contentId: dummyData.contentIds[1],
      sessionId: dummyData.sessionIds[0],
      like: 0,
      answer: 'Long answer test, lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      question: 'test question 2'
    });
  })

  .then(() => {
    return knex('content').insert({
      contentType: 'text',
      contentId: dummyData.contentIds[2],
      sessionId: dummyData.sessionIds[0],
      like: -1,
      answer: 'third answer, very bad!',
      question: 'lorem ipsum'
    });
  })

  .then(() => {
    return knex('content').insert({
      contentType: 'text',
      contentId: dummyData.contentIds[3],
      sessionId: dummyData.sessionIds[1],
      like: 1,
      answer: 'hello',
      question: 'question from another session'
    });
  })

  .then(() => {
    return knex('content').insert({
      contentType: 'text',
      contentId: dummyData.contentIds[4],
      sessionId: dummyData.sessionIds[2],
      answer: 'hello',
      like: -1,
      question: 'question from another user'
    });
  });
};
