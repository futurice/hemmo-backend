import Joi from 'joi';

import { getAuthWithScope, doAuth } from '../../utils/auth';
import {
  getUsers,
  getUser,
  updateUser,
  delUser,
  authUser,
  registerUser,
  verifyUser,
} from '../../handlers/users';

const userId = {
  params: {
    userId: Joi.string().required(),
  },
};

const registrationFields = {
  payload: {
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
  },
};

const editProfileFields = {
  payload: {
    email: Joi.string().email(),
    name: Joi.string(),
    image: Joi.string(),
    locale: Joi.string(),
    password: Joi.string(),
  },
};


const users = [
  // Get a list of all users
  {
    method: 'GET',
    path: '/admin/users',
    handler: getUsers,
    config: getAuthWithScope('user'),
  },

  // Get info about a specific user
  {
    method: 'GET',
    path: '/admin/users/{userId}',
    handler: getUser,
    config: {
      validate: userId,
      ...getAuthWithScope('user'),
    },
  },

  // Update user profile
  {
    method: 'PATCH',
    path: '/admin/users/{userId}',
    handler: updateUser,
    config: {
      validate: {
        ...userId,
        ...editProfileFields,
      },
      ...getAuthWithScope('user'),
    },
  },

  // Verify newly registered user
  {
    method: 'PUT',
    path: '/admin/users/verify/{userId}',
    handler: verifyUser,
    config: {
      validate: userId,
      ...getAuthWithScope('user'),
    },
  },

  // Delete a user, admin only
  {
    method: 'DELETE',
    path: '/admin/users/{userId}',
    handler: delUser,
    config: {
      validate: userId,
      ...getAuthWithScope('user'),
    },
  },

  // Authenticate as user
  {
    method: 'POST',
    path: '/admin/users/authenticate',
    handler: authUser,
    config: doAuth,
  },

  // Register new user
  {
    method: 'POST',
    path: '/admin/users',
    handler: registerUser,
    config: { validate: registrationFields },
  },
];

export default users;

// Here we register the routes
export const routes = server => server.route(users);
