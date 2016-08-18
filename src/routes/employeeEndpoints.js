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
    const assigneeId = _.get(request, 'payload.assigneeId', null);

    const updateDict = {
      reviewed: reviewed,
      assigneeId: assigneeId,
      updatedAt: knex.fn.now()
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
        reviewed: true,
        assigneeId: assigneeId
      })
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to update session'));
    });
  }
};

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

exports.getAllEmployees = {
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

exports.getAllUsers = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    const offset = _.get(request, 'query.offset', 0);
    const limit = _.get(request, 'query.limit', 100);
    knex.select('name', 'id', 'assigneeId')
      .from('users')
      .limit(limit)
      .offset(offset)
      .orderBy('createdAt', 'desc')
      .bind({})
    .then(function(users) {
      const usrs = _.map(users, function(user) {
        return {
          name: user.name,
          userId: user.id,
          assigneeId: user.assigneeId
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
    knex.first('name', 'assigneeId').from('users').where('id', userId).bind({})
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
          sessionId: row.sessionId
        };
      });
      this.sessions = sessions;
      console.log(this);
      return knex.first('id', 'name').from('employees').where('id', this.user.assigneeId);
    })
    .then(function(employee) {
      this.employee = employee;
      return knex('content').select('questions').innerJoin('sessions', 'content.sessionId', 'sessions.sessionId').where('sessions.userId', userId);
    })
    .then(function(contents) {
      let questions = _.flatten(contents.map(content => content.questions));

      const questionsWithLikes = _.filter(questions, question => !_.isNil(question.like));
      const likes = questionsWithLikes.map(question => question.like);
      const likeMean = _.mean(likes);

      return reply({
        name: this.user.name,
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
    const limit = _.get(request, 'query.limit', 100);
    const order = _.get(request, 'query.order', 'desc')
    const offset = _.get(request, 'query.offset', 0);

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
      return knex.select('*').from('sessions').whereIn('userId', userIds).andWhere(strippedFilters)
      .orderBy('createdAt', order).limit(limit).offset(offset).bind({})
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
          assigneeId: session.assigneeId,
          user: {
            name: user.name,
            userId: user.id,
            assigneeId: user.assigneeId,
          },
          reviewed: session.reviewed,
          createdAt: session.createdAt,
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
        sessionId: this.session.sessionId,
        assigneeId: this.session.assigneeId,
        user: {
          name: user.name,
          userId: user.id,
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
