const client = require('sailthru-client');
const { getTemplateList, getTemplate, submitTemplate } = require('../services/sailthru');
const { formatTemplate } = require('../utils/template');
const { findIncludes, processIncludes } = require('../utils/includes');
const AAF = require('async-af');

let controller = {};


/*
  Gets a list of all templates in Sailthru source account.
*/
controller.getListFromSailthru = (req, res) => {
  const apiKey = req.query.apiKey;
  const secret = req.query.secret;

  if (!apiKey || !secret) throw Error('Please provide API valid key and secret.');

  getTemplateList({ apiKey, secret })
  .then(list => res.status(200).send(list))
  .catch(err => res.status(200).send(err.errormsg));
}

/*
  Function receives list of templates from UI, fetches them from source account and posts
  them to destintation account.
*/
controller.importFromSailthru = (req, res) => {
  const src = client.createSailthruClient(req.body.src.apiKey, req.body.src.secret);
  const dest = client.createSailthruClient(req.body.dest.apiKey, req.body.dest.secret);
  const templatesToTransfer = req.body.list;
  const keepFromEmails = req.body.keep_from_emails === "true" ? true : false;

  let includes, responseMessages;

  Promise.all(templatesToTransfer.map(x => getTemplate(x,src)))
  .then(templateData => {
    const formattedTemplates = templateData.map(x => formatTemplate(x, keepFromEmails));
    // Scrape out includes here and assign to includes array...
    const allIncludes = formattedTemplates.map(x => findIncludes(x.content_html)).flat(2);
    includes = [...new Set(allIncludes)];

    return Promise.all(formattedTemplates.map(x => submitTemplate(x, dest)));
  })
  .then(async (templateMessages) => {
    responseMessages = templateMessages.map(x => {
      console.log("response: ", x);
      return x.errormsg ? `Error posting to Sailthru: ${x.errormsg}` : `Sucessfully posted ${x.name} to Sailthru.`
    });
    // Go find and diff all includes here. Tomorrow. You can fix this tomorrow.
    const includeResponses = await processIncludes(includes, src, dest);
    responseMessages = responseMessages.concat(includeResponses);
    res.status(200).send(responseMessages);
  })
  .catch(err => {
    console.log("ERROR IN CONTROLLER: ", err);
    res.status(200).send(err.message ? err.message : err)
  })
};

module.exports = controller;
