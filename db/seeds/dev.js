/*eslint-disable func-names*/
'use strict';

let _ = require('lodash');

let dummyData = {
  contentIds: [
    'f8f8b3d7-cba0-47cf-ab13-d51e77437222',
    'da45ca28-eda6-42e0-af7d-f1cf70a3cc15',
    'da45ca28-eda6-42e0-af7d-f1cf70a3cc16',
    'da45ca28-eda6-42e0-af7d-f1cf70a3cc17'
  ],
  sessionIds: [
    'a0af9302-021b-4537-b2f4-7bd37aed43cd',
    'a0af9302-021b-4537-b2f4-7bd37aed43ce',
    'a0af9302-021b-4537-b2f4-7bd37aed43cf'
  ],
  userIds: [
    1,
    2
  ],
  users: [
    {
      name: 'dummy user',
      id: 1,
      email: 'foo@bar.com',

      // 'foobar'
      password: '$2a$10$jqtfUwulMw6xqGUA.IsjkuAooNkAjPT3FJ9rRiUoSTsUpNTD8McxC'
    },
    {
      name: 'another user',
      id: 2,
      email: 'foo@bar.com',

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
      answer: 'hello world 2 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      question: 'test question 2'
    });
  })

  .then(() => {
    return knex('content').insert({
      contentType: 'text',
      contentId: dummyData.contentIds[2],
      sessionId: dummyData.sessionIds[1],
      answer: 'hello',
      question: 'question from another session'
    });
  })

  .then(() => {
    return knex('content').insert({
      contentType: 'text',
      contentId: dummyData.contentIds[3],
      sessionId: dummyData.sessionIds[2],
      answer: 'hello',
      question: 'question from another user'
    });
  });
};
