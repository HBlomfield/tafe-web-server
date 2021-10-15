    import the .sql database
    change the const configSQL to values for your sql database (line 151)
    change the acceptedhost const to only allow requests from the server specified (e.g. localhost:3000) (line 67)
    change the serverhost const to change where the server is listening on (line 68)
    run node api.js (make sure sql is running)
    pray that it will run without errors
    open the site at https://{serverhost} -> default https://localhost:3000

The ssl certificate is a mess at the moment so its not likely to work but its just there to enable https in nodejs, so you might have the page blocked when you access on a browser, but chrome and firefox give you ways to ignore warnings and keep going