/*eslint-disable func-names*/
'use strict';

let _ = require('lodash');

let dummyData = {
  contentIds: [
    'f8f8b3d7-cba0-47cf-ab13-d51e77437222',
    'da45ca28-eda6-42e0-af7d-f1cf70a3cc15'
  ],
  sessionIds: [
    'a0af9302-021b-4537-b2f4-7bd37aed43cd'
  ],
  users: [
    {
      name: 'dummy user',
      id: 1
    }
  ]
}

exports.seed = function(knex) {
  // first delete old dummy data
  return knex('content').where('contentId', dummyData.contentIds[0]).del()
  .then(() => {
    return knex('content').where('contentId', dummyData.contentIds[1]).del();
  })
  .then(() => {
    return knex('sessions').where('sessionId', dummyData.sessionIds[0]).del();
  })
  .then(() => {
    return knex('users').where('id', dummyData.users[0].id).del();
  })

  // then insert new dummy data

  /*
   * Users
   */
  .then(() => {
    return knex('users').insert({
      name: dummyData.users[0].name,
      id: dummyData.users[0].id
    });
  })

  /*
   * Sessions
   */
  .then(() => {
    return knex('sessions').insert({
      sessionId: dummyData.sessionIds[0],
      userId: 1
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
};
