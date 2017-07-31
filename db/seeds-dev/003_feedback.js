const simpleFixtures = require('simple-fixtures');
const faker = require('faker');
const sampleSize = require('lodash/sampleSize');

const moods = [
  'Iloinen',
  'Innostunut',
  'Riehakas',
  'Rauhallinen',
  'Jännittynyt',
  'Surullinen',
  'Yksinäinen',
];

const activities = [
  {
    main: 'Puuhasimme',
    sub: 'Lukeminen',
  },
  {
    main: 'Puuhasimme',
    sub: 'Kokkailu',
  },
  {
    main: 'Lemmikit',
    sub: 'Kotieläimet',
  },
];

exports.seed = async knex => {
  const children = await knex('children').select(['id', 'assigneeId']);
  let child = {};

  const feedbackFields = {
    id: faker.random.uuid,
    createdAt: faker.date.past,
    childId: () => {
      // randomly select child
      child = children[Math.floor(Math.random() * children.length)];
      return child.id;
    },

    /*givenMood: () => {
      const int=  Math.random();

      return int < 0.3 ? -1 : (int > 0.6 ? 1 : 0); 
    },*/

    activities: () =>
      // choose a random sample of activities, each activity has a 50% chance of
      // having `like` set to -1, 0 or 1
      JSON.stringify(
        sampleSize(
          activities,
          Math.floor(Math.random() * activities.length),
        ).map(
          activity =>
            Math.random() < 0.5
              ? activity
              : { ...activity, like: Math.floor(Math.random() * 3 - 1) },
        ),
      ),

    moods: () =>
      JSON.stringify(
        sampleSize(moods, Math.floor(Math.random() * moods.length)),
      ),

    reviewed: () => Math.random() < 0.5,

    assigneeId: () => {
      // 20% chance of not having any assignee
      if (Math.random() < 0.2) {
        return undefined;
      }

      // Otherwise return child's assignee
      return child.assigneeId;
    },
  };

  // Generate several test children
  return knex.batchInsert(
    'feedback',
    simpleFixtures.generateFixtures(feedbackFields, 100),
  );
};
