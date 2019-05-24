# Sailthru Template Transfer Tool

This is a Node/React app designed to transfer email templates and their associate includes between Sailthru accounts. 

### How It Works

In order to transfer templates you need the API key and secret from both the source and destination accounts in the transfer. Entering credentials for the source account will send a GET request to [Sailthru's Template API endpoint](https://getstarted.sailthru.com/developers/api/template/) and retrieve a list of all templates in that account. A user can then select which templates they want and submit it. When a listed is submitted, the following happens:

1. Templates are retrieved individually from Sailthru.
2. The response from a GET call and requirements for a POST call to the Template API are different (please see utils/sailthru.js for notes). As such, template data is reformatted prior to POST.
3. Template data is posted to the destination account. The response is a the new template object created in the destination account.
4. The body and "Advanced Setup" of the new template object are scraped for instances of Zephyr's "include" command. The same process then happens with includes- they're fetched from the source account one by one and posted to the destination account.
5. An array of success/error messages is then sent back to the UI.
