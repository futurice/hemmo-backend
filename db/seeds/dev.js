/*eslint-disable func-names*/
'use strict';

let _ = require('lodash');
let path = require('path');
let mkdirp = require('mkdirp');
let contentPath = path.join(process.env.HOME, 'hemmo', 'uploads', 'test.mp4');
let fs = require('fs-sync');
let uuid = require('node-uuid');

mkdirp.sync(path.dirname(contentPath));
fs.copy(__dirname + '/test.mp4', contentPath);

// 'foobar'
let dummyPassword = '$2a$10$jqtfUwulMw6xqGUA.IsjkuAooNkAjPT3FJ9rRiUoSTsUpNTD8McxC';

let rng = 0;
let getUuid = function() {
  rng++;

  let rngStr = rng.toString(16);

  // zero pad
  let width = 32;
  rngStr = rngStr.length >= width ? rngStr : new Array(width - rngStr.length + 1).join('0') + rngStr;

  let arr = rngStr.match(/.{2}/g);
  arr = arr.map(i => {
    return parseInt(i, 16);
  });

  return uuid.v4({
    random: arr
  });
}

exports.seed = function(knex) {
  let dummyData = {
    content: [
      {
        moods: ['Iloinen', 'Riehakas'],
        questions: [{
          question: 'Mitä teitte?',
          like: 1,
          answer: 'Leikittiin yhdessä.'
        },
        {
          question: 'Millaista se oli?',
          like: 1,
          attachmentId: 'test.mp4'
        },
        {
          question: 'Kerro tarkemmin!',
          like: -1,
          answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
        },
        {
          like: 0,
          question: 'Millainen olo?'
        }]
      },
      {
        moods: ['Iloinen', 'Riehakas'],
        questions: [{
          question: 'Mitä teitte?',
          like: 0,
          answer: 'Leikittiin yhdessä.'
        },
        {
          question: 'Millaista se oli?',
          like: 1,
          answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
        },
        {
          question: 'Kerro tarkemmin!',
          like: 0,
          answer: 'Lorem ipsum dolor sit amet'
        },
        {
          like: 1,
          question: 'Millainen olo?'
        }]
      }
    ],
    sessions: [
      {
        userId: 1,
        reviewed: true,
        content: [0]
      },
      {
        userId: 1,
        reviewed: true,
        content: [0, 1]
      },
      {
        userId: 1,
        reviewed: false,
        content: [0, 1]
      },
      {
        userId: 2,
        reviewed: true,
        content: [0]
      },
      {
        userId: 3,
        reviewed: true,
        content: [0]
      },
      {
        userId: 4,
        reviewed: false,
        content: [0]
      },
      {
        userId: 5,
        reviewed: true,
        content: [1]
      },
      {
        userId: 6,
        reviewed: true,
        content: [1]
      },
      {
        userId: 6,
        reviewed: false,
        content: [1]
      },
      {
        userId: 6,
        reviewed: false,
        content: [0]
      },
      {
        userId: 6,
        reviewed: false,
        content: [1]
      },
      {
        userId: 6,
        reviewed: false,
        content: [0, 1]
      },
      {
        userId: 6,
        reviewed: false,
        content: [0]
      },
      {
        userId: 8,
        reviewed: false,
        content: [0]
      },
      {
        userId: 9,
        reviewed: false,
        content: [0]
      },
      {
        userId: 10,
        reviewed: false,
        content: [0]
      },
      {
        userId: 11,
        reviewed: false,
        content: [0]
      }
    ],

    // randomly generated
    users: [
      { name: 'Urho Järvinen' },
      { name: 'Jani Kivelä' },
      { name: 'Ismo Nikkonen' },
      { name: 'Linda Sormunen' },
      { name: 'Kai Hietanen' },
      { name: 'Kosti Pulkkinen' },
      { name: 'Kaija Peltola' },
      { name: 'Annikki Aura' },
      { name: 'Aila Laiho' },
      { name: 'Kalevi Tiainen' },
      { name: 'Anita Rantanen' }
    ],
    employees: [
      {
        name: 'Test Employee',
        email: 'foo@bar.com',
        password: dummyPassword
      },
      {
        name: 'Into Eerola',
        email: 'into@example.com',
        password: dummyPassword
      },
      {
        name: 'Jenni Reinikainen',
        email: 'jenni@example.com',
        password: dummyPassword
      },
      {
        name: 'Hilppa Yrjänäinen',
        email: 'hilppa@example.com',
        password: dummyPassword
      },
      {
        name: 'Seppo Asunmaa',
        email: 'seppo@example.com',
        password: dummyPassword
      }
    ]
  }

  const sessionIds = new Array(100).fill(undefined).map(() => {
    return getUuid();
  });

  const contentIds = new Array(100).fill(undefined).map(() => {
    return getUuid();
  });

  dummyData.sessions.forEach((session, index) => {
    session.sessionId = sessionIds[index];
  });

  dummyData.userIds = dummyData.users.map((user, index) => {
    return index + 1;
  });
  dummyData.employeeIds = dummyData.employees.map((employee, index) => {
    return index + 1;
  });

  // first delete old dummy data
  return knex('content').whereIn('contentId', contentIds).del()

  .then(() => {
    return knex('sessions').whereIn('sessionId', sessionIds).del()
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
    return knex.batchInsert('users', dummyData.users);
  })

  /*
   * Employees
   */
  .then(() => {
    return knex.batchInsert('employees', dummyData.employees);
  })

  /*
   * Sessions
   */
  .then(() => {
    return knex.batchInsert('sessions', dummyData.sessions.map(session => {
      let copy = Object.assign({}, session);
      delete copy.content;

      return copy;
    }));
  })

  /*
   * Content
   */
  .then(() => {
    let i = 0;

    let contents = [];

    dummyData.sessions.forEach(session => {
      let newContent = session.content.map(index => {
        return {
          moods: JSON.stringify(dummyData.content[index].moods),
          questions: JSON.stringify(dummyData.content[index].questions),
          sessionId: session.sessionId,
          contentId: contentIds[i++]
        };
      });

      contents = contents.concat(newContent);
    });

    return knex.batchInsert('content', contents);
  });
};
