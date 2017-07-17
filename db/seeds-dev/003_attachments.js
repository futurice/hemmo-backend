const simpleFixtures = require('simple-fixtures');
const faker = require('faker');
const fs = require('fs');
const path = require('path');

const data = fs.readFileSync(path.join(__dirname, './data.mp3'));

exports.seed = async knex => {
  const feedback = await knex('feedback').select(['id']);

  const attachmentFields = {
    id: faker.random.uuid,
    createdAt: faker.date.past,
    mime: 'audio/mpeg',
    data,
    feedbackId: () => feedback[Math.floor(Math.random() * feedback.length)].id,
  };

  // Generate several test children
  return knex.batchInsert(
    'attachments',
    simpleFixtures.generateFixtures(attachmentFields, 100),
  );
};
