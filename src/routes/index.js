/*eslint-disable object-curly-spacing*/

import {
  employeeAuthentication,
  employeeRenewAuthentication,
  employeeRegistration,
  employeeChangePassword,
  employeeVerification,
  userRegistration
} from './authEndpoints';

import {
  attachmentUpload,
  updateContent,
  newContent,
  newSession
} from './userEndpoints';

import {
  getIndex,
  deleteSession,
  deleteUser,
  deleteEmployee,
  updateSessionData,
  updateLocale,
  getAttachment,
  getEmployeeData,
  getUserData,
  getSessionData,
  getAllUsers,
  getAllEmployees,
  getSessionsData,
  updateUserData
} from './employeeEndpoints';

const routes = [];

/*
-------------------------------------------------------
  Mobile user endpoints for the Hemmo mobile app.
*/


routes.push({
  method: 'POST',
  path: '/session',
  config: newSession
});

routes.push({
  method: 'POST',
  path: '/content',
  config: newContent
});

routes.push({
  method: 'PUT',
  path: '/content/{contentId}',
  config: updateContent
});

routes.push({
  method: 'PUT',
  path: '/attachment/{contentId}',
  config: attachmentUpload
});

routes.push({
  method: 'POST',
  path: '/register',
  config: userRegistration
});

/*
---------------------------------------------------------
  External api endpoints
  These require 'employee' scope in JWT (except registration
  and authentication of course)
*/
routes.push({
  method: 'GET',
  path: '/',
  config: getIndex
});

routes.push({
  method: 'POST',
  path: '/employees/register',
  config: employeeRegistration
});

routes.push({
  method: 'DELETE',
  path: '/employees/{employeeId}',
  config: deleteEmployee
});

routes.push({
  method: 'POST',
  path: '/employees/password',
  config: employeeChangePassword
});

routes.push({
  method: 'POST',
  path: '/employees/verify/{employeeId}',
  config: employeeVerification
});

routes.push({
  method: 'POST',
  path: '/employees/authenticate',
  config: employeeAuthentication
});

routes.push({
  method: 'POST',
  path: '/employees/renewauth',
  config: employeeRenewAuthentication
});

routes.push({
  method: 'GET',
  path: '/employees',
  config: getAllEmployees
});

routes.push({
  method: 'GET',
  path: '/users',
  config: getAllUsers
});

routes.push({
  method: 'GET',
  path: '/attachment/{attachmentId}',
  config: getAttachment
});

routes.push({
  method: 'GET',
  path: '/sessions',
  config: getSessionsData
});

routes.push({
  method: 'DELETE',
  path: '/sessions/{sessionId}',
  config: deleteSession
});

routes.push({
  method: 'POST',
  path: '/locale',
  config: updateLocale
});

routes.push({
  method: 'PUT',
  path: '/sessions/{sessionId}',
  config: updateSessionData
});

routes.push({
  method: 'GET',
  path: '/employees/{employeeId}',
  config: getEmployeeData
});

routes.push({
  method: 'GET',
  path: '/users/{userId}',
  config: getUserData
});

routes.push({
  method: 'DELETE',
  path: '/users/{userId}',
  config: deleteUser
});

routes.push({
  method: 'PUT',
  path: '/users/{userId}',
  config: updateUserData
});

routes.push({
  method: 'GET',
  path: '/sessions/{sessionId}',
  config: getSessionData
});

export default routes;
