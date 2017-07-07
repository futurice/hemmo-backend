import Boom from 'boom';

import { resizeImage } from '../utils/image';
import { createToken, hashPassword } from '../utils/auth';
import {
  dbGetEmployees,
  dbGetEmployee,
  dbDelEmployee,
  dbUpdateEmployee,
  dbCreateEmployee,
  dbVerifyEmployee,
} from '../models/employees';

const unverifiedErrorMsg = `ERROR: Employee has not been verified!
Another employee has to verify you as an admin employee through hemmo-admin settings before you can log-in.`;

export const getEmployees = (request, reply) => dbGetEmployees(request.query).then(reply);
export const getEmployee = (request, reply) => dbGetEmployee(request.params.employeeId).then(reply);

export const delEmployee = (request, reply) => {
  if (request.pre.employee.scope !== 'admin' && request.pre.employee.id !== request.params.employeeId) {
    return reply(Boom.unauthorized('Unprivileged employees can only delete own employeeId!'));
  }

  return dbDelEmployee(request.params.employeeId).then(reply);
};

export const updateEmployee = async (request, reply) => {
  if (request.pre.employee.scope !== 'admin' && request.pre.employee.id !== request.params.employeeId) {
    return reply(Boom.unauthorized('Unprivileged employees can only perform updates on own employeeId!'));
  }

  const fields = {
    email: request.payload.email,
    name: request.payload.name,
    image: request.payload.image,
    locale: request.payload.locale,
    password: request.payload.password,
  };

  // Only admins are allowed to modify employee scope
  if (request.pre.employee.scope === 'admin') {
    fields.scope = request.payload.scope;
  }

  // If request contains an image, resize it to max 512x512 pixels
  if (fields.image) {
    const buf = Buffer.from(fields.image, 'base64');
    await resizeImage(buf).then(resized => (fields.image = resized));
  }

  // Hash password if present
  if (fields.password) {
    fields.password = await hashPassword(request.payload.password);
  }

  return dbUpdateEmployee(request.params.employeeId, fields).then(reply);
};

export const verifyEmployee = (request, reply) => (
  dbVerifyEmployee(request.params.employeeId).then(reply)
);

export const authEmployee = async (request, reply) => {
  // Make sure employee is verified
  const employee = await dbGetEmployee(request.pre.employee.id);

  if (!employee.verified) {
    return reply(Boom.forbidden(unverifiedErrorMsg));
  }

  return reply(createToken({
    id: request.pre.employee.id,
    email: request.pre.employee.email,
    scope: 'employee',
  }));
};

export const registerEmployee = (request, reply) => (
  hashPassword(request.payload.password)
    .then(passwordHash => dbCreateEmployee({
      ...request.payload,
      email: request.payload.email.toLowerCase().trim(),
      password: passwordHash,
      scope: 'employee',
      verified: false,
    })
    .then(reply))
    .catch((err) => {
      if (err.constraint === 'employees_email_unique') {
        reply(Boom.conflict('Account already exists'));
      } else {
        reply(Boom.badImplementation(err));
      }
    })
);
