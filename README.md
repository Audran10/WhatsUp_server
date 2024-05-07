# What's Up API

## Installation

```bash
$ npm install
```

## DotEnv

Create a .env file in the root of the project with the following content:
 - Take the url of the server for CDN_URL

```bash
JWT_SECRET=your_secret_key # This is the secret key used to sign the JWT tokens
URL=mongodb://localhost:27017 # This is the URL to the MongoDB database
CDN_URL=http://localhost:3000 # This is the URL to the CDN server
KEY_ID=keyID # This is the key ID for the Apple Push Notification Service
TEAM_ID=teamID # This is the team ID for the Apple Push Notification Service
```

## Running the app

```bash
$ npm run start
```
The app will be running at `http://YourURL:3000`