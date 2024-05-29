const { google } = require("googleapis");
const { Readable } = require('stream');
const {DatabaseResponse, SERVICE_RESPONSE_TYPE} = require('./databaseService');

const KEYFILEPATH = "./keys/user-service-key.json";
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

const drive = google.drive({version: "v3", auth});


const createAndUploadFile = async (file) => {

    let databaseResponse = new DatabaseResponse();

    console.log("auth", auth);

    const fileMetaData = {
        'name': file.originalname,
        'parents': ['1sZyzbnWNugfIIYpn0feOWEwJsFjZpLb1']
    };

    const bufferStream = new Readable({
        read() {
            this.push(file.buffer);
            this.push(null);
        }
    });

    const media = {
        mimeType: 'audio/mpeg',
        body: bufferStream
    }
    
    const cloudResponse = await drive.files.create({
        resource: fileMetaData,
        media: media,
        fields: 'id'
    });

    switch(cloudResponse.status){
        case 200:
            console.log("File uploaded successfully. File ID: ", cloudResponse.data.id);
            break;
        default:
            console.error("Error uploading file: ", cloudResponse.errors);
            databaseResponse.setResponse(SERVICE_RESPONSE_TYPE.ERROR);
            databaseResponse.setMessage(cloudResponse.errors);
            return databaseResponse;
    }

    return databaseResponse;
};

module.exports = {
    createAndUploadFile
}