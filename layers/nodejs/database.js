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
      contact = result.Item;
      contact.id = contact.pk.split('#')[1];

      delete contact.sk;
      delete contact.pk;
    }
    catch (err) {
      console.log(`An error occurred loading contact details for '${contactId}'`);
      console.log(err, err.stack);
    }

    return contact;
  },

  getCorrespondence: async function (contactId) {
    const params = {
      TableName: enums.dynamoDbTable,
      Key: {
        pk: `${enums.entity.correspondence}#${contactId}`
      }
    };

    let correspondence = [];
    try {
      const result = await documentClient.query(params).promise();
      correspondence = result.Items.map(item => {
        const [contactDate, id] = item.spk.split('#');
        item.id = id;
        item.contactDate = contactDate;

        item.contactId = item.pk.split('#')[1];
        delete item.pk;
        delete item.sk;

        return item;
      });
    }
    catch (err) {
      console.log(`An error occurred loading correspondence for contact '${contactId}'`);
      console.log(err, err.stack);
    }

    return correspondence;
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

  addCorrespondence: async function (contactId, correspondenceId, correspondence) {
    let id;
    try {
      correspondence.pk = `${enums.entity.correspondence}#${contactId}`;
      correspondence.sk = `${new Date().toISOString}#${correspondenceId}`;

      let params = {
        TableName: enums.dynamoDbTable,
        Item: correspondence
      }

      await documentClient.put(params).promise();
      id = correspondenceId;
    }
    catch (err) {
      console.log(`An error occurred saving new correspondence '${correspondenceId}'`);
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
        Item: contact
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
      const allCorrespondence = await this.getCorrespondence(contactId);
      allCorrespondence.map(correspondence => this.deleteCorrespondence(correspondence));
    }

    return success;
  },

  deleteCorrespondence: async function (correspondence) {
    try {
      const params = {
        TableName: enums.dynamoDbTable,
        Key: {
          pk: `${enums.entity.correspondence}#${correspondence.contactId}`,
          sk: `${correspondence.contactDate}#${correspondence.id}`
        }
      };

      await documentClient.delete(params).promise();
    }
    catch (err) {
      console.log(`An error occurred trying to delete correspondence '${correspondence.id}'`);
      console.log(err, err.stack);
    }
  }
}