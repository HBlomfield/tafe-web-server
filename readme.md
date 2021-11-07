## To run API and single page app
* Import the .sql database
* Change the const configSQL to values for your sql database (line 151)
* Change the acceptedhost const to only allow requests from the server specified (default localhost:2000) (line 67)
* Change the serverhost const to change where the server is listening on (line 68)
* Run `node api.js` (make sure sql is running)
* Pray that it will run without errors
* In /public/main.js/ set the hostURL variable to the name of the domain your server will run on, eg https://localhost:3000
* Open the site at http://{serverhost} -> default http://localhost:2000
* Access the API at http://{serverhost}/api/{action} -> default http://localhost:2000/api/{action}

## To run test script
* Run `node test.js`
* If the status codes dont match the target codes, there is an issue.