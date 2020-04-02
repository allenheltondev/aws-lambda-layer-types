// Pulls from Dependency Layer - Declared like normal
const httpStatusCode = require('http-status-codes');

// Pulls from Function Layer - Must pull from 'opt/nodejs/<filename>'
const db = require('/opt/nodejs/database');

exports.lambdaHandler = async (event, context) => {
  const contactId = event.pathParameters.contactId;

  await db.deleteContact(contactId);

  return { statusCode: httpStatusCode.NO_CONTENT };
};
