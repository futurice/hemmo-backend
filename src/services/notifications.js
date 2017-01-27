import _ from 'lodash';
import moment from 'moment';
import email from 'emailjs';
import sessions from './sessions';
import { smtp, fallbackEmail } from '../config';

function notifyUnreviewed() {
  const server = email.server.connect(smtp);

  sessions.list({ 'sessions.reviewed': false }, 2000, 0, 'desc')
    .then((unReviewedSessions) => {
      const grouped = _.groupBy(unReviewedSessions,
                                el => el.assigneeEmail ? el.assigneeEmail : fallbackEmail);
      const emails = Object.keys(grouped).map(emailAddress => {
        const mySessions = grouped[emailAddress];

        const subjectUnreadCount = mySessions.length > 1
              ? `${mySessions.length} unreviewed sessions`
              : 'one unreviewed session';

        const makeLine = (session) => {
          const url = `http://base/sessions/${session.id}`;
          const user = session.user.name;
          const date = moment(session.createdAt).format('YYYY-MM-DD');
          return `${user} (${date}) - ${url}`;
        };

        const body = mySessions.map(makeLine).join('\n');

        return {
          subject: `You have ${subjectUnreadCount}`,
          to: emailAddress,
          body
        };
      });
      emails.forEach((emailDetails) => {
        server.send({
          from: `${smtp.username}@${smtp.host}`,
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
}

export default {
  notifyUnreviewed
};
