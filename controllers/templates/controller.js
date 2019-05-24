const client = require('sailthru-client');
const Sailthru = require('../../services/sailthru');
const Template = require('../../utils/template');
const AAF = require('async-af');

let controller = {};


/*
  Gets a list of all templates in Sailthru source account.
*/
controller.getListFromSailthru = (req, res) => {
  const SailthruConfig = {
    apiKey: req.query.apiKey,
    secret: req.query.secret
  }

  if (!SailthruConfig.apiKey || !SailthruConfig.secret) {
    throw Error('Please provide API valid key and secret.');
  };

  Sailthru.getList(SailthruConfig)
  .then(list => {
    res.status(200).send(list)
  })
  // TO DO: Update error handling in UI.
  .catch(err => {
    console.log("ERROR: ", err)
    res.status(200).send(err);
  });
}

/*
  Function receives list of templates from UI, fetches them from source account and posts
  them to destintation account.
*/
controller.importFromSailthru = (req, res) => {
  const src = client.createSailthruClient(req.body.src.apiKey, req.body.src.secret);
  const dest = client.createSailthruClient(req.body.dest.apiKey, req.body.dest.secret);
  const templatesToTransfer = req.body.list;
  const includeTeams = req.body.include_teams;

  AAF(templatesToTransfer)
  // Make individual Template API calls for each template to get data.
  .mapAF(async template => {
    console.log("Getting " + template + " from source.");
    const templateData = await Sailthru.getTemplate(template,src);
    return templateData;
  })
  // Formats template data so API will accept it in a post call.
  .mapAF(templateData => {
    console.log("Formatting ", templateData);
    return Template.formatTemplate(templateData, includeTeams);
  })
  /*
    Post formatted Template to Sailthru. POST call returns complete Template object from
    Sailthru system. This tool only uses the contentHTML from that response.
  */
  .mapAF(async formattedTemplate => {
    console.log("submitting ", formattedTemplate);
    const msg = await Sailthru.submitTemplate(formattedTemplate, src, dest)
    console.log("MESSAGE: ", msg)
    return msg;
  })
  // Passes all success/error messages back to UI
  .then(allMessages => res.send(allMessages))
  .catch(err => {

    console.log("ERROR CATCH: ", err.message)
    res.status(200).send(err.message ? err.message : err);
  })
};

module.exports = controller;
