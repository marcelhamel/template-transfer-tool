/*
  The required data formatting for a POST call to the Template API is different
  than what's received from a GET call. Additionally, certain properties will
  throw errors if they're transferred between accounts. See notes below.
*/

module.exports = {
  formatTemplate: (template, keepFromEmails) => {
    // Unverified e-mails in new account will throw error in template transfer.
    console.log('keepFromEmails ', keepFromEmails);
    if (keepFromEmails !== true) {
      console.log('Deleting from email!');
      delete template.from_email;
    }
    // Will cause errors sending from new account.
    delete template.link_domain;
    // Safety against clients sending with wrong data feed.
    delete template.data_feed_url;
    // Will throw internal exception
    delete template.promotion_id

    // Will throw error if team does not exist in both accounts.
    // if (!include_teams) {
      delete template.teams;
    // }

    // Labels returned from API as array, must be posted as object: { labelName: 1 }
    let labels = {};
    if (template.labels) template.labels.forEach(label => template.labels[label] = 1);
    template.labels = labels;

    return template;
  }
};
