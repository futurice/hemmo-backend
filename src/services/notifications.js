import _ from 'lodash';
import moment from 'moment';
import sessions from './sessions';

const fallbackEmail = 'admin@example.org';

function notifyUnreviewed() {
  sessions.list({ 'sessions.reviewed': false }, 2000, 0, 'desc')
    .then((unReviewedSessions) => {
      const grouped = _.groupBy(unReviewedSessions,
                                el => el.assigneeEmail ? el.assigneeEmail : fallbackEmail);
      const emails = Object.keys(grouped).map(email => {
        const mySessions = grouped[email];

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
          body
        };
      });
      console.log('results', emails);
    });
}

export default {
  notifyUnreviewed
};
