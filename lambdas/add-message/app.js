// Pulls from Dependency Layer - Declared like normal
const Twilio = require('twilio');
const short = require('short-uuid');
const httpStatusCode = require('http-status-codes');

// Pulls from Function Layer - Must pull from 'opt/nodejs/<filename>'
const db = require('/opt/nodejs/database');

const ErrorTextMessage = 'An error occurred sending the text message';
const ErrorSaveMessage = 'An error occurred saving the message';
const NotFoundMessage = 'A contact with the supplied id count not be found';
const BadRequest = 'Message is a required field';
const DefaultParam = 'REPLACEME';

exports.lambdaHandler = async (event, context) => {
  const body = JSON.parse(event.body);

  if (!body.message) {
    return {
      statusCode: httpStatusCode.BAD_REQUEST,
      body: { message: BadRequest }
    };
  }

  const contactId = event.pathParameters.contactId;
  const contact = await db.getContact(contactId);
  if (!contact) {
    return {
      statusCode: httpStatusCode.NOT_FOUND,
      body: { message: NotFoundMessage }
    };
  }

  const messageId = await exports.sendText(contact.phoneNumber, body.message);
  if (!messageId) {
    return {
      statusCode: httpStatusCode.INTERNAL_SERVER_ERROR,
      body: { message: ErrorTextMessage }
    };
  }

  const id = await db.addMessage(contactId, messageId, body.message);
  if (!id) {
    return {
      statusCode: httpStatusCode.INTERNAL_SERVER_ERROR,
      body: { message: ErrorSaveMessage }
    };
  }
  else {
    return {
      statusCode: httpStatusCode.CREATED,
      body: { id: id }
    };
  }
};

exports.sendText = async (contactNumber, message) => {
  if (!process.env.TwilioSid || process.env.TwilioSid === DefaultParam ||
    !process.env.TwilioAuthToken || process.env.TwilioAuthToken === DefaultParam ||
    !process.env.TWilioFromNumber || process.env.TwilioFromNumber === DefaultParam) {
    console.log('Twilio is not configured. A text message will not be sent.');
    return short.generate();
  }

  try {
    const client = new Twilio(process.env.TwilioSid, process.env.TwilioAuthToken);
    const response = await client.messages.create({
      body: message,
      to: contactNumber,
      from: process.env.TwilioFromNumber
    });

    return response.sid;
  }
  catch (err) {
    console.log('An error occurred sending the message in Twilio');
    console.log(err);
  }
}
