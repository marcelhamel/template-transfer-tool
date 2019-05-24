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


// Gets single template from source account.
Sailthru.getTemplate = async (name, src) => {
  return new Promise((resolve, reject) => {
    src.getTemplate(name, (err, res) => {
      if (err) throw Error(err);

      resolve(res);
    })
  })
};

// POST's template to destination account.
Sailthru.submitTemplate = (template, src, dest) => {
  return new Promise((resolve, reject) => {
    dest.saveTemplate(template.name, template, (err, res) => {
      if (res.errormsg)  console.log("RES.ERRORMSG: ", res.errormsg);
      if (err) reject({ message: 'There has been an error uploading templates to Sailthru. Please check your API key and secret and try again.'});
      console.log("Submission response: ", res.name);

      // Copies includes along with template
      Includes.findAllInHTML(template.content_html + " " + template.setup)
      .then(async includes => {
        return (
          AAF(includes)
          .mapAF(include => Includes.duplicateCheck(include, dest))
          .mapAF(name => Includes.getInclude(name, src))
          .mapAF(incData => Includes.postInclude(incData, dest))
          .then(() => resolve(`Successfully posted \"${template.name}\" to Sailthru.`))
          .catch(err => err.message)
        )
      })
    })
  })
};

module.exports = Sailthru;
