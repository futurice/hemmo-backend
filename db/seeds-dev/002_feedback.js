const simpleFixtures = require('simple-fixtures');
const faker = require('faker');

exports.seed = async (knex) => {
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
  return knex.batchInsert('feedback', simpleFixtures.generateFixtures(feedbackFields, 100));
};
