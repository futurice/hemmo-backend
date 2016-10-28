import Boom from 'boom';
import Joi from 'joi';
import _ from 'lodash';
import path from 'path';
import Promise from 'bluebird';

import {
  bindEmployeeData
} from '../utils/authUtil';

const knex = require('db');

const uploadPath = path.join(process.env.HOME, 'hemmo', 'uploads');

exports.getIndex = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  pre: [
    {method: bindEmployeeData, assign: 'user'}
  ],
  handler: function(request, reply) {
    reply('Server is up and running');
  }
};

exports.deleteEmployee = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  pre: [
    {method: bindEmployeeData, assign: 'user'}
  ],
  validate: {
    params: {
      employeeId: Joi.number().required()
    }
  },
  handler: function(request, reply) {
    const employeeId = request.params.employeeId;

    knex('employees').where('id', employeeId).del()
    .then(results => {
      return reply({ deletedEmployees: results });
    })
    .catch(err => {
      console.log(err);
      return reply(Boom.badRequest('Failed to delete employee'));
    });
  }
};

exports.deleteSession = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  pre: [
    {method: bindEmployeeData, assign: 'user'}
  ],
  validate: {
    params: {
      sessionId: Joi.string().length(36).required()
    }
  },
  handler: function(request, reply) {
    const sessionId = request.params.sessionId;

    knex('sessions').where('sessionId', sessionId).del()
    .then(results => {
      return reply({ deletedSessions: results });
    })
    .catch(err => {
      console.log(err);
      return reply(Boom.badRequest('Failed to delete session'));
    });
  }
};

exports.updateSessionData = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  pre: [
    {method: bindEmployeeData, assign: 'user'}
  ],
  validate: {
    params: {
      sessionId: Joi.string().length(36).required()
    }
  },
  handler: function(request, reply) {
    const sessionId = request.params.sessionId;
    const reviewed = _.get(request, 'payload.reviewed', undefined);
    const assigneeId = _.get(request, 'payload.assigneeId', undefined);

    const updateDict = {
      reviewed: reviewed,
      assigneeId: assigneeId,
      updatedAt: knex.fn.now()
    };

    // Strip undefined values
    const strippedDict = _.omitBy(updateDict, _.isUndefined);

    const empty = _.isEmpty(strippedDict);
    if (empty) {
      return reply('Success');
    }

    knex('sessions').where('sessionId', sessionId)
    .returning('*')
    .update(strippedDict)
    .then((results) => {
      let session = results[0];

      return reply({
        id: session.sessionId,
        reviewed: session.reviewed,
        assigneeId: session.assigneeId
      })
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to update session'));
    });
  }
};

exports.updateLocale = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  validate: {
    query: {
      locale: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    const { locale } = request.query;
    const { id } = request.auth.credentials;

    knex('employees')
    .where('id', id)
    .update({ locale })
    .then(function(result) {
      return reply({ locale });
    })
    .catch(function(err) {
      return reply(Boom.badRequest('Failed to update locale'));
    });
  }
}

exports.updateUserData = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  validate: {
    params: {
      userId: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    const userId = request.params.userId;
    const assigneeId = request.payload.assigneeId;
    knex('users').where('id', userId).update({assigneeId: assigneeId})
    .then(function() {
      return reply({
        assignee: {
          id: assigneeId
        }
      })
    })
    .catch(function(err) {
      return reply(Boom.badRequest('Failed to update user'));
    });
  }
}

exports.deleteUser = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  pre: [
    {method: bindEmployeeData, assign: 'user'}
  ],
  validate: {
    params: {
      userId: Joi.number().required()
    }
  },
  handler: function(request, reply) {
    const userId = request.params.userId;

    knex('users').where('id', userId).del()
    .then(results => {
      return reply({ deletedUsers: results });
    })
    .catch(err => {
      console.log(err);
      return reply(Boom.badRequest('Failed to delete user'));
    });
  }
};

exports.getAttachment = {
  validate: {
    params: {
      attachmentId: Joi.string().required()
    }
  },
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    let attachmentPath = path.join(uploadPath, request.params.attachmentId);

    return reply.file(path.join(uploadPath, request.params.attachmentId), {
      confine: uploadPath
    });

    reply.file(attachmentPath);
  },
  state: {
    parse: true
  }
};

exports.getEmployeeData = {
  validate: {
    params: {
      employeeId: Joi.string().required()
    }
  },
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    const employeeId = request.params.employeeId;
    knex.first('name', 'email', 'verified').from('employees').where('id', employeeId).bind({})
    .then(function(employee) {
      if (!employee) {
        throw new Error('Employee not found.');
      }
      this.employee = employee;
      return reply({
        name: this.employee.name,
        email: this.employee.email,
        verified: this.employee.verified
      });
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to get employee data'));
    });
  }
};

exports.getAllEmployees = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    knex('employees').select('name', 'id', 'verified').bind({})
    .then(function(employees) {
      const empl = _.map(employees, function(employee) {
        return {
          name: employee.name,
          employeeId: employee.id,
          verified: employee.verified
        };
      });
      return reply({
        employees: empl
      });
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to find employees'));
    });
  }

}

exports.getAllUsers = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    const offset = _.get(request, 'query.offset', 0);
    const limit = _.get(request, 'query.limit', 20);
    knex('users').select('users.name', 'employees.name as assignee', 'users.id', 'assigneeId', 'users.createdAt')
      .leftJoin('employees', 'users.assigneeId', 'employees.id')
      .limit(limit)
      .offset(offset)
      .orderBy('users.createdAt', 'desc')
      .bind({})
    .then(function(users) {
      this.users = _.map(users, user => ({
        name: user.name,
        assignee: user.assignee,
        id: user.id,
        createdAt: user.createdAt
      }));

      return knex('users').count('id');
    })
    .then(function(results) {
      return reply({
        count: parseInt(results[0].count),
        users: this.users
      });
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to find users'));
    });
  }
};

exports.getUserData = {
  validate: {
    params: {
      userId: Joi.string().required()
    }
  },
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    const userId = request.params.userId;
    knex.first('name', 'assigneeId', 'createdAt').from('users').where('id', userId).bind({})
    .then(function(user) {
      if (!user) {
        throw new Error('User not found.');
      }
      this.user = user;
      return knex.select('createdAt', 'reviewed', 'sessionId').from('sessions').where('userId', userId);
    })
    .then(function(rows) {
      const sessions = _.map(rows, function(row) {
        return {
          createdAt: row.createdAt,
          reviewed: row.reviewed,
          id: row.sessionId
        };
      });
      this.sessions = sessions;
      return knex.first('id', 'name').from('employees').where('id', this.user.assigneeId);
    })
    .then(function(employee) {
      this.employee = employee || null;
      return knex('content').select('questions').innerJoin('sessions', 'content.sessionId', 'sessions.sessionId').where('sessions.userId', userId);
    })
    .then(function(contents) {
      let questions = _.flatten(contents.map(content => content.questions));

      const questionsWithLikes = _.filter(questions, question => !_.isNil(question.like));
      const likes = questionsWithLikes.map(question => question.like);
      const likeMean = _.mean(likes);

      return reply({
        name: this.user.name,
        createdAt: this.user.createdAt,
        sessions: this.sessions,
        assignee: this.employee,
        likes: likeMean
      });
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to get user data'));
    });
  }
};

exports.getSessionsData = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    const assigneeId = _.get(request, 'query.assignee', null);
    const reviewed = _.get(request, 'query.reviewed', null);
    const userId = _.get(request, 'query.user', null);
    const limit = _.get(request, 'query.limit', 20);
    const order = _.get(request, 'query.order', 'desc')
    const offset = _.get(request, 'query.offset', 0);

    const filters = {
      'sessions.reviewed': reviewed,
      'sessions.userId': userId,
      'sessions.assigneeId': assigneeId
    };

    // Strip null values
    const strippedFilters = _.omitBy(filters, _.isNil);

    var sessionsArray = [];
    knex.select(
        'sessionId',
        'userId',
        'reviewed',
        'sessions.createdAt',
        'employees.name as assignee',
        'users.name as userName',
        'sessions.updatedAt')

        .from('sessions').where(strippedFilters)
        .leftJoin('employees', 'sessions.assigneeId', 'employees.id')
        .leftJoin('users', 'sessions.userId', 'users.id')
        .orderBy('sessions.createdAt', order)
        .limit(limit)
        .offset(offset)
        .bind({})
    .each(function(session) {
      const sessDict = {
        id: session.sessionId,
        assignee: session.assignee,
        user: {
          name: session.userName,
          id: session.userId
        },
        reviewed: session.reviewed,
        createdAt: session.createdAt,
      };

      sessionsArray.push(sessDict);
    })
    .then(function() {
      return knex('sessions').where(strippedFilters).count('sessionId');
    })
    .then(function(results) {
      return reply({
        count: parseInt(results[0].count),
        sessions: sessionsArray
      });
    })
    .catch((err) => {
      console.log(err);
      return reply(Boom.badRequest('Failed to get session data'));
    });
  }

};

// Note that this is different from the previous endpoint config! This fetches _one_ session.
exports.getSessionData = {
  validate: {
    params: {
      sessionId: Joi.string().length(36).required()
    }
  },
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    knex('sessions').where({
      sessionId: request.params.sessionId
    }).first('*').bind({})
    .then(function(session) {
      if (!session) {
        throw new Error('Session not found');
      }

      this.session = session;

      return knex.select('*').from('content').where('sessionId', session.sessionId);
    })
    .then(function(contents) {
      const contentArray = _.map(contents, function(content) {
        return {
          contentId: content.contentId,
          questions: content.questions,
          moods: content.moods,
          createdAt: content.createdAt
        };
      });
      this.content = contentArray;
      return knex.first('name', 'id', 'assigneeId').from('users').where('id' ,this.session.userId);
    })
    .then(function(user) {
      if (!user) {
        throw new Error('No user was found for the session');
      }
      return reply({
        id: this.session.sessionId,
        assigneeId: this.session.assigneeId,
        user: {
          name: user.name,
          id: user.id,
          assigneeId: user.assigneeId,
        },
        reviewed: this.session.reviewed,
        createdAt: this.session.createdAt,
        content: this.content
      });
    })
    .catch((err) => {
      return reply(Boom.badRequest('Failed to get sessions data'));
    });
  }
};
