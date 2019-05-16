const sailthruClient = require('sailthru-client');
const Includes = require('../utils/includes');
const AAF = require('async-af');

let Sailthru = {};

Sailthru.getList = (config) => {
  const SRC = sailthruClient.createSailthruClient(config.apiKey, config.secret);

  return new Promise((resolve, reject) => {
    SRC.getTemplates((err, res) => {
      if (err) reject(err);

      // Create list of template names
      const templateList = res.templates.map(template => template.name);
      templateList.length == 0 ? reject({errormsg: 'No templates found!'}) : resolve(templateList);
    })
  })
};


Sailthru.getTemplate = async (name, src) => {
  return new Promise((resolve, reject) => {
    src.getTemplate(name, (err, res) => {
      if (err) throw Error(err.message);
      resolve(res);
    })
  })
};

Sailthru.submitTemplate = (template, src, dest) => {
  return new Promise((resolve, reject) => {
    dest.saveTemplate(template.name, template, (err, res) => {
      if (err) throw Error(err.message);
      if (res.errormsg) resolve(res.errormsg);


      // Copies includes along with template
      Includes.findAllInHTML(template.content_html)
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
