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

import employeeEndpoints from './employees';

let routes = [];

routes = routes.concat(employeeEndpoints);

/*
-------------------------------------------------------
  Mobile user endpoints for the Hemmo mobile app.
*/

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
  method: 'POST',
  path: '/locale',
  config: updateLocale
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

export default routes;
