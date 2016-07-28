/*eslint-disable object-curly-spacing*/

import {
  employeeAuthenticationConfig,
  employeeRegistrationConfig,
  userRegistrationConfig
} from './routeConfigs/authRoutes';

import {
  attachmentUploadConfig,
  getAttachmentConfig,
  updateContentConfig,
  newContentConfig,
  newSessionConfig
} from './routeConfigs/sessionRoutes';

import {
  getIndexConfig
} from './routeConfigs/externalApiRoutes';

const routes = [];

routes.push({
  method: 'GET',
  path: '/',
  config: getIndexConfig
});

routes.push({
  method: 'POST',
  path: '/session',
  config: newSessionConfig
});

routes.push({
  method: 'POST',
  path: '/content',
  config: newContentConfig
});

routes.push({
  method: 'PUT',
  path: '/content/{contentId}',
  config: updateContentConfig
});

routes.push({
  method: 'GET',
  path: '/attachment/{contentId}',
  config: getAttachmentConfig
});

routes.push({
  method: 'PUT',
  path: '/attachment/{contentId}',
  config: attachmentUploadConfig
});

routes.push({
  method: 'POST',
  path: '/register',
  config: userRegistrationConfig
});

routes.push({
  method: 'POST',
  path: '/employees/register',
  config: employeeRegistrationConfig
});

routes.push({
  method: 'POST',
  path: '/employees/authenticate',
  config: employeeAuthenticationConfig
});

export default routes;
