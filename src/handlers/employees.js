import Boom from 'boom';

import { resizeImage } from '../utils/image';
import { createToken, hashPassword, generatePassword } from '../utils/auth';
import {
  dbGetEmployees,
  dbGetEmployee,
  dbDelEmployee,
  dbUpdateEmployee,
  dbCreateEmployee,
} from '../models/employees';

import { countAndPaginate } from '../utils/db';

const nonActivedErrorMsg = `ERROR: Employee has not been active!
An admin has to set your account active through hemmo-admin settings before you can log-in.`;

export const getEmployees = (request, reply) =>
  countAndPaginate(
    dbGetEmployees(request.query),
    request.query.limit,
    request.query.offset,
  ).then(reply);

export const getEmployee = (request, reply) =>
  dbGetEmployee(request.params.employeeId).then(reply);

export const delEmployee = (request, reply) => {
  if (
    request.pre.employee.scope !== 'admin' &&
    request.pre.employee.id !== request.params.employeeId
  ) {
    return reply(
      Boom.unauthorized(
        'Unprivileged employees can only delete own employeeId!',
      ),
    );
  }

  return dbDelEmployee(request.params.employeeId).then(reply);
};

export const updateEmployee = async (request, reply) => {
  if (
    request.pre.employee.scope !== 'admin' &&
    request.pre.employee.id !== request.params.employeeId
  ) {
    return reply(
      Boom.unauthorized(
        'Unprivileged employees can only perform updates on own employeeId!',
      ),
    );
  }

  const fields = {
    email: request.payload.email,
    name: request.payload.name,
    image: request.payload.image,
    locale: request.payload.locale,
  };

  const password = request.payload.resetPassword
    ? generatePassword()
    : request.payload.password;
  let hashedPassword = null;

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
  if (password) {
    hashedPassword = await hashPassword(password);
  }

  return dbUpdateEmployee(
    request.params.employeeId,
    fields,
    hashedPassword,
  ).then(result => {
    reply(result);
  });
};

export const authEmployee = async (request, reply) => {
  // Make sure employee is active
  const employee = await dbGetEmployee(request.pre.employee.id);

  if (!employee.active) {
    return reply(Boom.forbidden(nonActivedErrorMsg));
  }

  return reply(
    createToken({
      id: request.pre.employee.id,
      name: request.pre.employee.name,
      email: request.pre.employee.email,
      scope: employee.scope,
    }),
  );
};

export const renewAuth = async (request, reply) => {
  // Make sure employee is active
  const employee = await dbGetEmployee(request.pre.employee.id);

  if (!employee.active) {
    return reply(Boom.forbidden(nonActivedErrorMsg));
  }

  return reply(
    createToken({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      scope: employee.scope,
    }),
  );
};

export const registerEmployee = (request, reply) => {
  const password = generatePassword();

  hashPassword(password)
    .then(passwordHash =>
      dbCreateEmployee({
        ...request.payload,
        email: request.payload.email.toLowerCase().trim(),
        password: passwordHash,
        scope: 'employee',
        active: request.payload.active,
      }).then(reply),
    )
    .catch(err => {
      if (err.constraint === 'employees_email_unique') {
        reply(Boom.conflict('Account already exists'));
      } else {
        reply(Boom.badImplementation(err));
      }
    });
};
