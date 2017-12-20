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
import { sendMail } from '../utils/email';

const nonActivedErrorMsg = `ERROR: Employee has not been active!
An admin has to set your account active through hemmo-admin settings before you can log-in.`;

export const getEmployees = (request, reply) =>
  countAndPaginate(
    dbGetEmployees(
      request.query,
      request.pre.employee.id,
      request.pre.employee.scope,
    ),
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

  let password = null;
  let hashedPassword = null;
  const isAdmin = request.pre.employee.scope === 'admin';
  const fields = {
    email: request.payload.email,
    name: request.payload.name,
    image: request.payload.image,
    locale: request.payload.locale,
    active: request.payload.active,
  };

  if (request.payload.resetPassword && isAdmin) {
    password = generatePassword();
  } else if (request.payload.password) {
    password = request.payload.password;
  }

  // Only admins are allowed to modify employee scope
  if (isAdmin) {
    fields.scope = request.payload.scope;
  }

  // Only admins are allowed to modify organisationId
  if (isAdmin) {
    fields.organisationId = request.payload.organisationId;

    // Enforce that non-admin users belong to an organisation
    if (fields.scope !== 'admin' && fields.organisationId === null) {
      return reply(
        Boom.forbidden('Non-admin users must belong to an organisation.'),
      );
    }
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
    if (request.payload.resetPassword && isAdmin && hashedPassword) {
      sendMail({
        to: result.email,
        subject: 'New password for Hemmo Admin',
        body: `An administrator has reset your password. Your new password is: ${password}\n\n
              It's recommended to change this after you have logged in.`,
      });
    }

    reply(result);
  });
};

export const authEmployee = async (request, reply) => {
  // Make sure employee is active
  const employee = await dbGetEmployee(request.pre.employee.id);

  if (!employee.active) {
    return reply(Boom.forbidden(nonActivedErrorMsg));
  }

  const token = createToken({
    id: request.pre.employee.id,
    name: request.pre.employee.name,
    email: request.pre.employee.email,
    scope: employee.scope,
  });

  return reply(token);
};

export const renewAuth = async (request, reply) => {
  // Make sure employee is active
  const employee = await dbGetEmployee(request.pre.employee.id);

  if (!employee.active) {
    return reply(Boom.forbidden(nonActivedErrorMsg));
  }

  const token = createToken({
    id: employee.id,
    name: employee.name,
    email: employee.email,
    scope: employee.scope,
  });

  return reply(token);
};

export const registerEmployee = (request, reply) => {
  const isAdmin = request.pre.employee.scope === 'admin';

  let employeeScope = 'employee';
  if (isAdmin && request.payload.scope === 'admin') {
    // Only admins can create admin users
    employeeScope = 'admin';
  }

  // Enforce that non-admin users belong to an organisation
  if (employeeScope !== 'admin' && request.payload.organisationId === null) {
    return reply(
      Boom.forbidden('Non-admin users must belong to an organisation.'),
    );
  }

  const password = generatePassword();

  hashPassword(password)
    .then(passwordHash =>
      dbCreateEmployee({
        ...request.payload,
        email: request.payload.email.toLowerCase().trim(),
        password: passwordHash,
        scope: employeeScope,
        active: request.payload.active,
      }).then(result => {
        sendMail({
          to: result.email,
          subject: 'Credentials for Hemmo Admin',
          body: `An account has been created for you at Hemmo Admin. You can login with following details\n\n
                User name: ${result.email}\n
                Password: ${password}\n\n
                It's recommended to change this password after you have logged in.`,
        });

        reply(result);
      }),
    )
    .catch(err => {
      if (err.constraint === 'employees_email_unique') {
        reply(Boom.conflict('Account already exists'));
      } else {
        reply(Boom.badImplementation(err));
      }
    });
};
