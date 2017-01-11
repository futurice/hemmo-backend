/*eslint-disable func-names*/
'use strict';

let _ = require('lodash');
let path = require('path');
let mkdirp = require('mkdirp');
let attachmentFilename = 'f8f8b3d7-cba0-47cf-ab13-d51e77437222.mp4';
let contentPath = path.join(process.env.HOME, 'hemmo', 'uploads', attachmentFilename);
let fs = require('fs-sync');
let uuid = require('node-uuid');
let prompt = require('prompt');
let config = require('../../src/config');

mkdirp.sync(path.dirname(contentPath));
fs.copy(path.join(__dirname, attachmentFilename), contentPath);

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
  return new Promise((resolve, reject) => {
    console.log(`\nAbout to insert development seed data into database.\n`);
    console.log(`WARNING: this will effectively WIPE the database at ${JSON.stringify(config.db)}!`);
    console.log(`Are you REALLY sure you want to continue? (type 'yes' to confirm)`);

    prompt.start();

    prompt.get(['answer'], (err, result) => {
      if (err || result.answer !== 'yes') {
        console.log('aborting.');
        process.exit(0);
      }
      resolve();
    });
  })
  .then(() => {
    let dummyData = {
      content: [
        {
          moods: ['Iloinen', 'Riehakas'],
          questions: [{
            question: 'Mitä teitte?',
            answer: 'Leikimme, pelasimme'
          },
          {
            question: 'Mitä teitte (tarkemmin)?',
            answer: 'Liikunta'
          },
          {
            question: 'Kertoisitko lisää?',
            attachmentId: attachmentFilename
          },
          {
            like: 1,
            question: 'Millainen olo?'
          }]
        },
        {
          moods: ['Innostunut', 'Iloinen', 'Jännittynyt'],
          questions: [{
            question: 'Mitä teitte?',
            answer: 'Ulkoilimme, retkeilimme'
          },
          {
            question: 'Mitä teitte (tarkemmin)?',
            answer: 'Ulkoilu',
          },
          {
            question: 'Kertoisitko lisää?',
            answer: 'Ohitettu'
          },
          {
            like: 0,
            question: 'Millainen olo?'
          }]
        },
        {
          moods: ['Innostunut', 'Rauhallinen'],
          questions: [{
            question: 'Mitä teitte?',
            answer: 'Vietimme aikaa yhdessä'
          },
          {
            question: 'Mitä teitte (tarkemmin)?',
            answer: 'Kyläily',
          },
          {
            question: 'Kertoisitko lisää?',
            answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
          },
          {
            like: 1,
            question: 'Millainen olo?'
          }]
        },
        {
          moods: ['Surullinen', 'Yksinäinen', 'Jännittynyt'],
          questions: [{
            question: 'Mitä teitte?',
            answer: 'Leikimme, pelasimme'
          },
          {
            question: 'Mitä teitte (tarkemmin)?',
            answer: 'Leikkiminen',
          },
          {
            question: 'Kertoisitko lisää?',
            attachmentId: attachmentFilename
          },
          {
            like: -1,
            question: 'Millainen olo?'
          }]
        },
        {
          moods: ['Iloinen', 'Innostunut'],
          questions: [{
            question: 'Mitä teitte?',
            answer: 'Leikimme, pelasimme'
          },
          {
            question: 'Mitä teitte (tarkemmin)?',
            answer: 'Lautapelit',
          },
          {
            question: 'Kertoisitko lisää?',
            answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
          },
          {
            like: 1,
            question: 'Millainen olo?'
          }]
        },
        {
          moods: ['Iloinen', 'Innostunut'],
          questions: [{
            question: 'Mitä teitte?',
            answer: 'Ulkoilimme, retkeilimme'
          },
          {
            question: 'Mitä teitte (tarkemmin)?',
            answer: 'Pihahommat',
          },
          {
            question: 'Kertoisitko lisää?',
            answer: 'Lorem ipsum dolor sit amet'
          },
          {
            like: 0,
            question: 'Millainen olo?'
          }]
        }
      ],
      sessions: [
        {
          userId: 1,
          assigneeId: 1
        },
        {
          userId: 1,
          assigneeId: 1
        },
        {
          userId: 2,
          assigneeId: 1
        },
        {
          userId: 3,
          assigneeId: 1
        },
        {
          userId: 4,
          assigneeId: 2
        },
        {
          userId: 5,
          assigneeId: 1
        },
        {
          userId: 6,
          assigneeId: 1
        },
        {
          userId: 6,
          assigneeId: 3
        },
        {
          userId: 8,
        },
        {
          userId: 9,
          assigneeId: 2
        },
        {
          userId: 10,
          assigneeId: 1
        },
        {
          userId: 11,
          assigneeId: 3
        }
      ],

      // randomly generated
      users: [
        { name: 'Urho Järvinen', assigneeId: 1 },
        { name: 'Jani Kivelä', assigneeId: 1 },
        { name: 'Ismo Nikkonen', assigneeId: 2 },
        { name: 'Linda Sormunen' },
        { name: 'Kai Hietanen' },
        { name: 'Kosti Pulkkinen', assigneeId: 3 },
        { name: 'Kaija Peltola' },
        { name: 'Annikki Aura' },
        { name: 'Aila Laiho' },
        { name: 'Kalevi Tiainen', assigneeId: 3 },
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

    /*
     * Set sessionIds & contentIds
     */

    const sessionIds = new Array(100).fill(undefined).map(() => {
      return getUuid();
    });

    const contentIds = new Array(100).fill(undefined).map(() => {
      return getUuid();
    });

    dummyData.sessions.forEach((session, index) => {
      session.sessionId = sessionIds[index];
    });

    /*
     * Randomize createdAt / updatedAt times
     */

    dummyData.users.forEach((user, index) => {
      user.createdAt = new Date(Date.now() - index * 1000000000 * Math.random());
    });
    dummyData.sessions.forEach((session, index) => {
      let randDate = new Date(Date.now() - index * 1000000000 * Math.random())
      session.createdAt = randDate;
      session.updatedAt = randDate;

      if (Math.random() < 0.25) {
        session.updatedAt = new Date(randDate.getTime() + 100000000 * Math.random());
      }
    });
    dummyData.content.forEach((content, index) => {
      let randDate = new Date(Date.now() - index * 1000000000 * Math.random())
      content.createdAt = randDate;
      content.updatedAt = randDate;

      if (Math.random() < 0.25) {
        content.updatedAt = new Date(randDate.getTime() + 100000000 * Math.random());
      }
    });

    /*
     * Randomize session contents
     */
    dummyData.sessions.forEach((session, index) => {
      session.reviewed = Math.random() > 0.5 ? true : false;
    });
    dummyData.sessions.forEach((session, index) => {
      let contents = [];

      dummyData.content.forEach((content, index) => {
        if (Math.random() > 0.65) {
          contents.push(index);
        }
      });

      // Make sure there's at least one content in session
      if (!contents.length) {
        contents.push(Math.floor(Math.random() * dummyData.content.length));
      }

      session.content = contents;
    });

    // first delete old dummy data
    let wipeTables = [];

    ['content', 'employees', 'sessions', 'users'].forEach(table => {
      wipeTables.push(knex.raw(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE;`));
    });

    return Promise.all(wipeTables)

    // then insert new dummy data (order is important)

    /*
     * Employees
     */
    .then(() => {
      return knex.batchInsert('employees', dummyData.employees);
    })

    /*
     * Users
     */
    .then(() => {
      return knex.batchInsert('users', dummyData.users);
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
  });
};
