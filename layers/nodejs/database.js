var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
const short = require('short-uuid');
const enums = require("./enums");
const documentClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
  getContact: async function (contactId) {
    const params = {
      TableName: enums.dynamoDbTable,
      Key: {
        pk: `${enums.entity.contact}#${contactId}`,
        sk: 'details'
      }
    };

    let contact;
    try {
      const result = await documentClient.get(params).promise();
      if (result.Item) {
        contact = result.Item;
        contact.id = contact.pk.split('#')[1];

        delete contact.sk;
        delete contact.pk;
      }
    }
    catch (err) {
      console.log(`An error occurred loading contact details for '${contactId}'`);
      console.log(err, err.stack);
    }

    return contact;
  },

  getMessages: async function (contactId) {
    const params = {
      TableName: enums.dynamoDbTable,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': `${enums.entity.message}#${contactId}`
      }
    };

    let messages;
    try {
      const result = await documentClient.query(params).promise();
      messages = result.Items.map(item => {
        const [contactDate, id] = item.sk.split('#');
        item.id = id;
        item.contactDate = contactDate;

        item.contactId = item.pk.split('#')[1];
        delete item.pk;
        delete item.sk;

        return item;
      });
    }
    catch (err) {
      console.log(`An error occurred loading message for contact '${contactId}'`);
      console.log(err, err.stack);
    }

    return messages;
  },

  addContact: async function (contact) {
    let id;
    try {
      id = short.generate();
      contact.pk = `${enums.entity.contact}#${id}`;
      contact.sk = 'details';

      let params = {
        TableName: enums.dynamoDbTable,
        Item: contact
      }

      await documentClient.put(params).promise();
      return id;
    }
    catch (err) {
      console.log('An error occurred saving new contact');
      console.log(err, err.stack);
    }

    return id;
  },

  addMessage: async function (contactId, messageId, message) {
    let id;
    try {
      const dbMessage = {
        pk: `${enums.entity.message}#${contactId}`,
        sk: `${new Date().toISOString()}#${messageId}`,
        message: message
      };

      let params = {
        TableName: enums.dynamoDbTable,
        Item: dbMessage
      }

      await documentClient.put(params).promise();
      id = messageId;
    }
    catch (err) {
      console.log(`An error occurred saving new message '${messageId}'`);
      console.log(err, err.stack);
    }

    return id;
  },

  updateContact: async function (contactId, contact) {
    let success = false;
    try {
      contact.pk = `${enums.entity.contact}#${contactId}`;
      contact.sk = 'details';

      let params = {
        TableName: enums.dynamoDbTable,
        Item: contact,
        ConditionExpression: 'attribute_exists(pk)'
      }

      await documentClient.put(params).promise();
      success = true;
    }
    catch (err) {
      console.log(`An error occurred updating contact '{contactId}'`);
      console.log(err, err.stack);
    }

    return success;
  },

  deleteContact: async function (contactId) {
    let success = false;
    try {
      const params = {
        TableName: enums.dynamoDbTable,
        Key: {
          pk: `${enums.entity.contact}#${contactId}`,
          sk: 'details'
        }
      };

      await documentClient.delete(params).promise();
      success = true;
    }
    catch (err) {
      console.log(`An error occurred trying to delete contact '${contactId}'`);
      console.log(err, err.stack);
    }

    if (success) {
      const allMessage = await this.getMessages(contactId);
      allMessage.map(message => this.deleteMessage(message));
    }

    return success;
  },

  deleteMessage: async function (message) {
    try {
      const params = {
        TableName: enums.dynamoDbTable,
        Key: {
          pk: `${enums.entity.message}#${message.contactId}`,
          sk: `${message.contactDate}#${message.id}`
        }
      };

      await documentClient.delete(params).promise();
    }
    catch (err) {
      console.log(`An error occurred trying to delete message '${message.id}'`);
      console.log(err, err.stack);
    }
  }
}