import Boom from 'boom';
import Joi from 'joi';
import path from 'path';

const knex = require('db');

const uploadPath = path.join(process.env.HOME, 'hemmo', 'uploads');

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
    return reply.file(path.join(uploadPath, request.params.attachmentId), {
      confine: uploadPath
    });
  },
  state: {
    parse: true
  }
};
