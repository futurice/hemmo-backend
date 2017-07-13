const simpleFixtures = require('simple-fixtures');
const faker = require('faker');

exports.seed = async knex => {
  const employees = await knex('employees').select('id');

  const childrenFields = {
    id: faker.random.uuid,
    name: faker.name.findName,
    birthYear: () => Math.floor(2013 - Math.random() * 10),
    assigneeId: () => {
      // 20% chance of not having any assignee
      if (Math.random() < 0.2) {
        return undefined;
      }

      // Otherwise return random employee id
      return employees[Math.floor(Math.random() * employees.length)].id;
    },
    showAlerts: () => Math.random() < 0.5,
    alertDismissedAt: faker.date.past,
  };

  // Generate several test children
  return knex.batchInsert(
    'children',
    simpleFixtures.generateFixtures(childrenFields, 100),
  );
};
