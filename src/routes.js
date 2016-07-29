/*eslint-disable object-curly-spacing*/

import {
  employeeAuthenticationConfig,
  employeeRegistrationConfig,
  userRegistrationConfig
} from './routeConfigs/authRoutes';

import {
  attachmentUploadConfig,
  updateContentConfig,
  newContentConfig,
  newSessionConfig
} from './routeConfigs/sessionRoutes';

import {
  getIndexConfig,
  updateSessionData,
  getAttachmentConfig,
  getEmployeeDataConfig,
  getUserDataConfig,
  getSessionDataConfig,
  getAllUsersConfig,
  getAllEmployeesConfig

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

/*
---------------------------------------------------------
  External api endpoints
*/
routes.push({
  method: 'POST',
  path: '/employees/authenticate',
  config: employeeAuthenticationConfig
});

routes.push({
  method: 'GET',
  path: '/employees',
  config: getAllEmployeesConfig
});

routes.push({
  method: 'GET',
  path: '/users',
  config: getAllUsersConfig
});

routes.push({
  method: 'GET',
  path: '/attachment/{contentId}',
  config: getAttachmentConfig
});

routes.push({
  method: 'PUT',
  path: '/session/{sessionId}',
  config: updateSessionData
});

routes.push({
  method: 'GET',
  path: '/employees/{employeeId}',
  config: getEmployeeDataConfig
});

routes.push({
  method: 'GET',
  path: '/users/{userId}',
  config: getUserDataConfig
});

routes.push({
  method: 'GET',
  path: '/sessions/{sessionId}',
  config: getSessionDataConfig
});

export default routes;
