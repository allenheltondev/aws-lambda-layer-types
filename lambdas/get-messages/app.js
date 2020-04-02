// Pulls from Dependency Layer - Declared like normal
const httpStatusCode = require('http-status-codes');

// Pulls from Function Layer - Must pull from 'opt/nodejs/<filename>'
const db = require('/opt/nodejs/database');

const NotFoundMessage = 'A contact with the supplied id count not be found';

exports.lambdaHandler = async (event, context) => {
  const contactId = event.pathParameters.contactId;

  const messages = await db.getMessages(contactId);
  if (!messages) {
    return {
      statusCode: httpStatusCode.NOT_FOUND,
      body: { message: NotFoundMessage }
    };
  }
  else {
    return messages;
  }
};
