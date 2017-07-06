const simpleFixtures = require('simple-fixtures');
const faker = require('faker');
const sampleSize = require('lodash/sampleSize');

const attachmentFilename = 'f8f8b3d7-cba0-47cf-ab13-d51e77437222.mp4';

const moods = [
  'Iloinen',
  'Innostunut',
  'Riehakas',
  'Rauhallinen',
  'Jännittynyt',
  'Surullinen',
  'Yksinäinen',
];

const questions = [{
  question: 'Mitä teitte?',
  answer: 'Leikimme, pelasimme',
},
{
  question: 'Mitä teitte (tarkemmin)?',
  answer: 'Liikunta',
},
{
  question: 'Kertoisitko lisää?',
  attachmentId: attachmentFilename,
},
{
  like: 1,
  question: 'Millainen olo?',
},
{
  question: 'Mitä teitte?',
  answer: 'Ulkoilimme, retkeilimme',
},
{
  question: 'Mitä teitte (tarkemmin)?',
  answer: 'Ulkoilu',
},
{
  question: 'Kertoisitko lisää?',
  answer: 'Ohitettu',
},
{
  like: 0,
  question: 'Millainen olo?',
},
{
  question: 'Mitä teitte?',
  answer: 'Vietimme aikaa yhdessä',
},
{
  question: 'Mitä teitte (tarkemmin)?',
  answer: 'Kyläily',
},
{
  question: 'Kertoisitko lisää?',
  answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
},
{
  like: 1,
  question: 'Millainen olo?',
},
{
  question: 'Mitä teitte?',
  answer: 'Leikimme, pelasimme',
},
{
  question: 'Mitä teitte (tarkemmin)?',
  answer: 'Leikkiminen',
},
{
  question: 'Kertoisitko lisää?',
  attachmentId: attachmentFilename,
},
{
  like: -1,
  question: 'Millainen olo?',
},
{
  question: 'Mitä teitte?',
  answer: 'Leikimme, pelasimme',
},
{
  question: 'Mitä teitte (tarkemmin)?',
  answer: 'Lautapelit',
},
{
  question: 'Kertoisitko lisää?',
  answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
},
{
  like: 1,
  question: 'Millainen olo?',
},
{
  question: 'Mitä teitte?',
  answer: 'Ulkoilimme, retkeilimme',
},
{
  question: 'Mitä teitte (tarkemmin)?',
  answer: 'Pihahommat',
},
{
  question: 'Kertoisitko lisää?',
  answer: 'Lorem ipsum dolor sit amet',
},
{
  like: 0,
  question: 'Millainen olo?',
}];

exports.seed = async (knex) => {
  const feedback = await knex('feedback').select('id');

  const contentFields = {
    id: faker.random.uuid,
    feedbackId: () => (
      // randomly select child
      feedback[Math.floor(Math.random() * feedback.length)].id
    ),
    moods: () => (
      JSON.stringify(sampleSize(moods, Math.floor(Math.random() * moods.length)))
    ),
    questions: () => (
      JSON.stringify(sampleSize(questions, Math.floor(Math.random() * questions.length)))
    ),
  };

  // Generate several test children
  return knex.batchInsert('content', simpleFixtures.generateFixtures(contentFields, 100));
};
