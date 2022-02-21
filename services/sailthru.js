/*
  Contains all API calls made to Sailthru.
*/
const sailthruClient = require('sailthru-client');

let Sailthru = {

  // Gets complete list of templates in source account.
  getTemplateList: (config) => {
    const Client = sailthruClient.createSailthruClient(config.apiKey, config.secret);

    return new Promise((resolve, reject) => {
      Client.getTemplates((err, res) => {
        if (err || res.errormsg) reject(err || res.errormsg);
        try{
          const templateList = res.templates.map(template => template.name);
          resolve(templateList);
        } catch(e) {
          reject('Unable to retrieve templates');
        }
      });
    });
  },

  /*
   Gets single template from source account.
  */
  getTemplate: (name, client) => {
    return new Promise((resolve, reject) => {
      client.getTemplate(name, (err, res) => {
        if (res.errormsg) reject(res.errormsg);
        resolve(res);
      })
    })
  },

  /*
    Posts template to destination account. Also runs through scraping process for includes associated with template.
    For includes see utils/includes.js
  */
  submitTemplate: (template, client) => {
    return new Promise((resolve, reject) => {
      client.saveTemplate(template.name, template, (err, res) => {
        if (err) {
          reject({ message: 'There has been an error uploading templates to Sailthru. Please check your API key and secret and try again.'});
        } else {
          resolve(res);
        }
      })
    })
  },

  // Get include body from specified account
  getInclude: (str, client) => {
    return new Promise((resolve, reject) => {
      client.apiGet('include', {include: str}, (err, res) => {
        err ? reject(err) : resolve(res.content_html ? res : '');
      })
    })
  },

  // Get include body from specified account
  listIncludes: (client) => {
    return new Promise((resolve, reject) => {
      client.apiGet('include', {}, (err, res) => {
        err ? reject(err) : resolve(res);
      })
    })
  },

  // Posts include to destination account.
  postInclude: (data, client) => {
    const include = data.name;
    const content_html = data.content_html;

    return new Promise((resolve, reject) => {
      client.apiPost('include', { include, content_html }, (post_err, post_res) => resolve(post_res));
    });
  }

};








module.exports = Sailthru;
