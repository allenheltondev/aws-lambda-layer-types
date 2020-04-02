// Pulls from Dependency Layer - Declared like normal
const short = require('short-uuid');
const httpStatusCode = require('http-status-codes');

// Pulls from Function Layer - Must pull from 'opt/nodejs/<filename>'
const db = require('/opt/nodejs/database');

const ErrorMessage = 'An error occurred saving the contact.';
const BadRequestMessage = 'Name and Phone Number are required fields';

exports.lambdaHandler = async (event, context) => {
  const contact = JSON.parse(event.body);

  if (!contact.name || !contact.phoneNumber) {
    return {
      statusCode: httpStatusCode.BAD_REQUEST,
      body: { message: BadRequestMessage }
    };
  }
  contact.phoneNumber = exports.cleanPhoneNumber(contact.phoneNumber);
  const id = await db.addContact(contact);
  if (!id) {
    return {
      statusCode: httpStatusCode.INTERNAL_SERVER_ERROR,
      body: { message: ErrorMessage }
    };
  }
  else {
    return {
      statusCode: httpStatusCode.CREATED,
      body: { id: id }
    };
  }
};

exports.cleanPhoneNumber = (number) => {
  number = number.replace(/-/g, '');

  if (!number.startsWith('1')) {
    number = `1${number}`;
  }

  return `+${number}`;
}
