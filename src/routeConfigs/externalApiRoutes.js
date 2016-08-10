import knex from '../db';
import Boom from 'boom';
import Joi from 'joi';
import _ from 'lodash';
import path from 'path';
import Promise from 'bluebird';

import {
  bindEmployeeData
} from '../utils/authUtil';

const uploadPath = path.join(process.env.HOME, 'hemmo', 'uploads');

exports.getIndexConfig = {
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
    const reviewed = _.get(request, 'payload.reviewed', null);

    const updateDict = {
      reviewed: reviewed
    };
    // Strip null values
    const strippedDict = _.omitBy(updateDict, _.isNil);
    const empty = _.isEmpty(strippedDict);
    if (empty) {
      return reply('Success');
    }

    knex('sessions').where('sessionId', sessionId)
    .returning('*')
    .update(strippedDict)
    .then((session) => {
      return reply({
        sessionId: session.sessionId,
        reviewed: true
      })
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to update session'));
    });
  }
};

exports.getAttachmentConfig = {
  validate: {
    params: {
      contentId: Joi.string().length(36).required()
    }
  },
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    knex('content').where({
      contentId: request.params.contentId
    }).select('contentPath')
    .then((results) => {
      if (!results.length) {
        throw new Error('Attachment not found');
      }

      return reply.file(results[0].contentPath, {
        confine: uploadPath
      });
    })
    .catch((err) => {
      return reply(Boom.badRequest('Failed to get attachment'));
    });
  }
};

exports.getEmployeeDataConfig = {
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
    knex.first('name', 'email').from('employees').where('id', employeeId).bind({})
    .then(function(employee) {
      if (!employee) {
        throw new Error('Employee not found.');
      }
      this.employee = employee;
      return reply({
        name: this.employee.name,
        email: this.employee.email,
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest('Failed to get employee data'));
    });
  }
};

exports.getAllEmployeesConfig = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    knex.select('name', 'id').from('employees').bind({})
    .then(function(employees) {
      const empl = _.map(employees, function(employee) {
        return {
          name: employee.name,
          employeeId: employee.id
        };
      });
      return reply({
        employees: empl
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest('Failed to find employees'));
    });
  }

}

exports.getAllUsersConfig = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    knex.select('name', 'id').from('users').bind({})
    .then(function(users) {
      const usrs = _.map(users, function(user) {
        return {
          name: user.name,
          userId: user.id
        };
      });
      return reply({
        users: usrs
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest('Failed to find users'));
    });
  }
};

exports.getUserDataConfig = {
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
    knex.first('name').from('users').where('id', userId).bind({})
    .then(function(user) {
      if (!user) {
        throw new Error('User not found.');
      }
      this.user = user;
      return knex.select('startedAt', 'reviewed', 'sessionId').from('sessions').where('userId', userId);
    })
    .then(function(rows) {
      const sessions = _.map(rows, function(row) {
        return {
          startedAt: row.startedAt,
          reviewed: row.reviewed,
          sessionId: row.sessionId
        };
      });
      return reply({
        name: this.user.name,
        sessions: sessions
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest('Failed to get user data'));
    });
  }
};

exports.getSessionsDataConfig = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    const assigneeId = _.get(request, 'query.assignee', null);
    const reviewed = _.get(request, 'query.reviewed', null);
    const userId = _.get(request, 'query.user', null);

    const filters = {
      reviewed: reviewed,
      userId: userId
    };

    const userFilter = {
      assigneeId: assigneeId
    }
    // Strip null values
    const strippedFilters = _.omitBy(filters, _.isNil);
    const strippedUserFilter = _.omitBy(userFilter, _.isNil);

    var sessionsArray = [];
    knex.select('id').from('users').where(strippedUserFilter).map(function(row) {
      return row.id
    })
    .then(function(userIds) {
      console.log(userIds);
      return knex.select('*').from('sessions').whereIn('userId', userIds).andWhere(strippedFilters).bind({})
    })
    .then(function(sessions) {
      return sessions;
    })
    .each(function(session) {
      return knex.first('name', 'id', 'assigneeId').from('users').where('id' , session.userId)
      .then(function(user) {
        if (!user) {
          user = {
            name: "Unknown",
            id: -1
          }
        }
        const sessDict = {
          sessionId: session.sessionId,
          user: {
            name: user.name,
            userId: user.id,
            assigneeId: user.assigneeId,
          },
          reviewed: session.reviewed,
          startedAt: session.startedAt,
        };
        sessionsArray.push(sessDict);
      });
    })
    .then(function(array) {
      return reply({
        sessions: sessionsArray
      });
    })
    .catch((err) => {
      return reply(Boom.badRequest('Failed to get session data'));
    });
  }

};

// Note that this is different from the previous endpoint config! This fetches _one_ session.
exports.getSessionDataConfig = {
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
          like: content.like,
          answer: content.answer,
          question: content.question,
          contentType: content.contentType,
          createdAt: content.createdAt,
          hasAttachment: content.hasAttachment
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
        sessionId: this.session.sessionId,
        user: {
          name: user.name,
          userId: user.id,
          assigneeId: user.assigneeId,
        },
        reviewed: this.session.reviewed,
        startedAt: this.session.startedAt,
        content: this.content
      });
    })
    .catch((err) => {
      return reply(Boom.badRequest('Failed to get sessions data'));
    });
  }
};
