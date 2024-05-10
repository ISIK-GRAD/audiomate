const express = require('express');
const app = express();
const envConfig = require('./config/envConfig.json');
const corsConfig = require("./config/corsConfig.json");
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');


const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../clientbuild')));

app.use(cors(corsConfig.settings)); // Enable CORS
app.use(bodyParser.json());

var httpPort = process.env.NODE_ENV == "development" ?
envConfig.environments.development.httpPort :
envConfig.environments.production.httpPort;

console.log("ENV: ", process.env.NODE_ENV);


app.listen(httpPort, () => {
    console.log('Server running on http://localhost:', httpPort)
});