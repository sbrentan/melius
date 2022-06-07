# Melius

[API documentation](https://app.swaggerhub.com/apis-docs/sbrentan/Melius/1.2.0)

## Application running

### Prerequisites

* Node.js
* NPM
* MongoDB

### Install the modules

Open the command line at the downloaded application root folder and run:
```
npm install package.json
```

### Start the application

In order to run the application locally it is necessary to create the '.env' file in the root folder containing the correct environment variables to use to run the application correctly:
```
SECRET_KEY  = 'my_secret_key'
SESSION_KEY = 'my_session_key'
DB_URL      = 'mongodb://localhost:27017/melius'
PORT        = 80
```

Now start the application locally with
```
npm run dev
```
