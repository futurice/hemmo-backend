import _ from 'lodash';
import moment from 'moment';
import email from 'emailjs';
import knex from 'db';
import sessions from './sessions';
import { smtp } from '../config';

export function notifyUnreviewed() {
  const server = email.server.connect(smtp);

  allEmails().then((allUsersEmailsList) => {

    const allUsersEmails = allUsersEmailsList.join(',');

    sessions.list({ 'sessions.reviewed': false }, 2000, 0, 'desc')
      .then((unReviewedSessions) => {
        const grouped = _.groupBy(unReviewedSessions,
                                  el => el.assigneeEmail ? el.assigneeEmail : allUsersEmails);
        const emails = Object.keys(grouped).map(emailAddress => {
          const mySessions = grouped[emailAddress];

          const subjectUnreadCount = mySessions.length > 1
            ? `${mySessions.length} unreviewed sessions`
            : 'one unreviewed session';

          const makeLine = (session) => {
            const url = `http://hemmo.pelastakaalapset.fi/sessions/${session.id}`;
            const user = session.user.name;
            const date = moment(session.createdAt).format('YYYY-MM-DD');
            return `${user} (${date}) - ${url}`;
          };

          const body = mySessions.map(makeLine).join('\n');

          const forOnePerson = emailAddress.indexOf(',') === -1;

          const subject = forOnePerson
                ? `You have ${subjectUnreadCount}`
                : `Nobody is assigned for ${subjectUnreadCount}`;

          return {
            subject,
            to: emailAddress,
            body
          };
        });
        emails.forEach((emailDetails) => {
          server.send({
            from: smtp.user, // This assumes smtp.user is a full email address
            text: emailDetails.body,
            to: emailDetails.to,
            subject: emailDetails.subject
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

function allEmails() {
  return knex.select('email').from('employees').distinct().pluck('email');
}
