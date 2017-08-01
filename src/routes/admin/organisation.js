import Joi from 'joi';

import { getAuthWithScope } from '../../utils/auth';
import {
  getOrganisations,
  getSingleOrganisation,
  updateOrganisation,
  delOrganisation,
  createOrganisation
} from '../../handlers/organisation';

const organisationId = {
  params: {
    organisationId: Joi.number().integer().required(),
  },
};

const createOrganisationFields = {
  payload: {
    position: Joi.string().required(),
    parent: Joi.number().integer().required(),
    name: Joi.string().required(),
  },
};

const editOrganisationFields = {
  payload: {
    name: Joi.string().required(),
  },
};

const routeConfigs = [
  // Get list of all organisation units
  {
    method: 'GET',
    path: '/admin/organisations',
    handler: getOrganisations,
    config: {
      ...getAuthWithScope('admin'),
    },
  },

  // Get single organisation unit
  {
    method: 'GET',
    path: '/admin/organisations/{organisationId}',
    handler: getSingleOrganisation,
    config: {
      validate: {
        ...organisationId,
      },
      ...getAuthWithScope('admin'),
    },
  },

  // Create a new organisation unit
  {
    method: 'POST',
    path: '/admin/organisations',
    handler: createOrganisation,
    config: {
      validate: {
        ...createOrganisationFields,
      },
      ...getAuthWithScope('admin'),
    },
  },

  // Update an existing organiosation unit
  {
    method: 'PUT',
    path: '/admin/organisations/{organisationId}',
    handler: updateOrganisation,
    config: {
      validate: {
        ...organisationId,
        ...editOrganisationFields,
      },
      ...getAuthWithScope('admin'),
    },
  },

  // Delete an organisation unit
  {
    method: 'DELETE',
    path: '/admin/organisations/{organisationId}',
    handler: delOrganisation,
    config: {
      validate: organisationId,
      ...getAuthWithScope('admin'),
    },
  },
];

export default routeConfigs;

// Here we register the routes
export const routes = server => server.route(routeConfigs);
