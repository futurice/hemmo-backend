import _ from 'lodash';
import moment from 'moment';
import email from 'emailjs';
import knex from './db';
import { dbGetFeedback } from '../models/feedback';
import { smtp } from './config';

function allEmails() {
  return knex.select('email').from('employees').distinct().pluck('email');
}

export function notifyUnreviewed() {
  const server = email.server.connect(smtp);

  allEmails().then((allUsersEmailsList) => {
    const allUsersEmails = allUsersEmailsList.join(',');

    dbGetFeedback({ reviewed: false })
      .then((unReviewedFeedback) => {
        const grouped = _.groupBy(unReviewedFeedback,
                                  el => (el.assigneeEmail ? el.assigneeEmail : allUsersEmails));
        const emails = Object.keys(grouped).map((emailAddress) => {
          const myFeedback = grouped[emailAddress];

          const subjectUnreadCount = myFeedback.length > 1
            ? `${myFeedback.length} unreviewed feedback sessions`
            : 'one unreviewed feedback session';

          const makeLine = (feedback) => {
            const url = `http://hemmo.pelastakaalapset.fi/feedback/${feedback.id}`;
            const child = feedback.childName;
            const date = moment(feedback.createdAt).format('YYYY-MM-DD');
            return `${child} (${date}) - ${url}`;
          };

          const body = myFeedback.map(makeLine).join('\n');

          const forOnePerson = emailAddress.indexOf(',') === -1;

          const subject = forOnePerson
                ? `You have ${subjectUnreadCount}`
                : `Nobody is assigned for ${subjectUnreadCount}`;

          return {
            subject,
            to: emailAddress,
            body,
          };
        });
        emails.forEach((emailDetails) => {
          server.send({
            from: smtp.user, // This assumes smtp.user is a full email address
            text: emailDetails.body,
            to: emailDetails.to,
            subject: emailDetails.subject,
          }, (err, message) => {
            if (err) {
              console.log('Failed sending message, got error:', err);
            } else {
              console.log(`Sent message ${message.header['message-id']}`);
            }
          });
        });
      });
  });
}
