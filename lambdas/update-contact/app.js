// Pulls from Dependency Layer - Declared like normal
const httpStatusCode = require('http-status-codes');

// Pulls from Function Layer - Must pull from 'opt/nodejs/<filename>'
const db = require('/opt/nodejs/database');

const NotFoundMessage = 'A contact with the supplied id count not be found';
const BadRequestMessage = 'Name and Phone Number are required fields';

exports.lambdaHandler = async (event, context) => {
  const contactId = event.pathParameters.contactId;
  const contact = JSON.parse(event.body);
  if (!contact.name || !contact.phoneNumber) {
    return {
      statusCode: httpStatusCode.BAD_REQUEST,
      body: { message: BadRequestMessage }
    };
  }
  contact.phoneNumber = exports.cleanPhoneNumber(contact.phoneNumber);

  const success = await db.updateContact(contactId, contact);
  if (!success) {
    return {
      statusCode: httpStatusCode.NOT_FOUND,
      body: { message: NotFoundMessage }
    };
  }
  else {
    return { statusCode: httpStatusCode.NO_CONTENT };
  }
};

exports.cleanPhoneNumber = (number) => {
  number = number.replace(/-/g, '');

  if (!number.startsWith('1')) {
    number = `1${number}`;
  }

  return `+${number}`;
}