# resto-admin
Administration Web client for RESTo server (http://github.com/jjrom/resto)

# Sources
Sources are available under dev folder 

# Installation
Copy dist folder content to your web directory

# Configuration
## Resto url
In app/components/app.constant.js, set 
        restoServerUrl as the Url to your RESTo server instance
        
## Statistics
Administration client can work without statistics module. If statistics module is not installed on your resto instance, delete following lines :
        'statistics': {
            /*
             * Stats end point - accessible from :
             *      restoServerUrl + statsEndPoint
             */
            'statsEndpoint': '/stats',
            'displayMapDensity': true
        }