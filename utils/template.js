let Template = {};

/*
  The required data formatting for a POST call to the Template API is different than what's received
  from a GET call. Additionally, certain properties will throw errors if they're transferred between
  accounts. See notes below.
*/

Template.formatTemplate = (template, include_teams) => {
  delete template.from_email;     // Unverified e-mails in new account will throw error in template transfer.
  delete template.link_domain;    // Will cause errors sending from new account.
  delete template.data_feed_url;  // Safety against clients sending with wrong data feed.
  delete template.promotion_id    // Will throw internal exception

  if (!include_teams) {
    delete template.teams;        // Will throw error if team does not exist in both accounts.
  }

  // Labels returned from API as array, must be posted as object: { labelName: 1 }
  let labels = {};
  if (template.labels) template.labels.forEach(label => template.labels[label] = 1);
  template.labels = labels;


  return template;
}

module.exports = Template;
