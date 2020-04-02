// Pulls from Dependency Layer - Declared like normal
const httpStatusCode = require('http-status-codes');

// Pulls from Function Layer - Must pull from 'opt/nodejs/<filename>'
const db = require('/opt/nodejs/database');

const ErrorMessage = 'An error occurred getting the contact';
const NotFoundMessage = 'A contact with the supplied id count not be found';

exports.lambdaHandler = async (event, context) => {
  try {
    const contactId = event.pathParameters.contactId;

    const contact = await db.getContact(contactId);
    if (!contact) {
      return {
        statusCode: httpStatusCode.NOT_FOUND,
        body: { message: NotFoundMessage }
      };
    }
    else {
      return contact;
    }
  }
  catch (err) {
    console.log('An error occurred retrieving the contact.');
    console.log(err);
    return {
      statusCode: httpStatusCode.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ message: ErrorMessage })
    }
  }
};
