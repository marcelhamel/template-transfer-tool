/*
  Contains all API calls made to Sailthru.
*/
const sailthruClient = require('sailthru-client');
const Includes = require('../utils/includes');
const AAF = require('async-af');

let Sailthru = {};

/*
  Gets complete list of templates in source account.
*/
Sailthru.getList = (config) => {
  const SRC = sailthruClient.createSailthruClient(config.apiKey, config.secret);

  return new Promise((resolve, reject) => {
    SRC.getTemplates((err, res) => {
      if (res.errormsg) reject(res.errormsg);

      // Create list of template names
      let templateList;
      if (Array.isArray(res.templates)) {
        templateList = res.templates.map(template => template.name);
      }

      templateList && templateList.length == 0 ? reject({errormsg: 'No templates found!'})
                                               : resolve(templateList);
    })
  })
};


/*
 Gets single template from source account.
*/
Sailthru.getTemplate = (name, src) => {
  return new Promise((resolve, reject) => {
    src.getTemplate(name, (err, res) => {
      if (res.errormsg) reject(res.errormsg);

      resolve(res);
    })
  })
};

/*
  Posts template to destination account. Also runs through scraping process for includes associated with template.
  For includes see utils/includes.js
*/
Sailthru.submitTemplate = (template, src, dest) => {
  return new Promise((resolve, reject) => {
    dest.saveTemplate(template.name, template, (err, res) => {
      if (err) reject({ message: 'There has been an error uploading templates to Sailthru. Please check your API key and secret and try again.'});

      // Copies includes along with template
      Includes.findAllInHTML(template.content_html + " " + template.setup)
      .then(includes => {
        return (
          AAF(includes)
          .mapAF(name => Includes.getInclude(name, src))
          .mapAF(include => Includes.duplicateCheck(include, dest))
          .mapAF(incData => Includes.postInclude(incData, dest))
          .then(() => resolve(`Successfully posted \"${template.name}\" to Sailthru.`))
          .catch(err => {
            resolve(`Unable to post \"${template.name}\" to Sailthru.`)
          })
        )
      })
    })
  })
};

module.exports = Sailthru;
