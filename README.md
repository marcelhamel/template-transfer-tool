# Sailthru Template Transfer Tool

This tool is designed to transfer email templates and their associated includes between Sailthru accounts.

# DISCLAIMER

**This code is intended as an example of how client developers can re-create their own hosted version of a template-copying app. It is not intended to be used as-is, but can easily be replicated on customer servers. As such, Sailthru is not responsible for maintaining any instances of this hosted by users outside of the CM Group organization.**

Please be advised that certain template attributes are not transferred by this tool and will need to be configured in the target account. See **utils/template.js** for details.

### How It Works

In order to transfer templates you'll need the API key and secret from both the source and destination accounts in the transfer. Credentials entered for the source account are used to send a GET request to [Sailthru's Template API endpoint](https://getstarted.sailthru.com/developers/api/template/) and retrieve a list of all templates in that account. A user can then select which templates they want and submit it. When a list of templates is submitted, the following happens:

1. Templates are retrieved individually from Sailthru.
2. The response from a GET call and requirements for a POST call to the Template API are different (please see **utils/template.js** for notes). As such, template data is reformatted prior to POST.
3. Template data is posted to the destination account. The response is a copy of the new template object created in the destination account.
4. The body and "Advanced Setup" of the new template object are scraped for instances of Zephyr's "include" command. The same process then happens with includes- they're fetched from the source account one by one and posted to the destination account.
5. An array of success/error messages is then sent back to the UI.
