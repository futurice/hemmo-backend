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

  // then insert new dummy data

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
      question: 'test question 1'
    });
  })

  .then(() => {
    return knex('content').insert({
      contentType: 'text',
      contentId: dummyData.contentIds[1],
      sessionId: dummyData.sessionIds[0],
      question: 'test question 2'
    });
  })
};
