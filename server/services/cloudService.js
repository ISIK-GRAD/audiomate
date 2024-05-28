const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const {DatabaseResponse, DATABASE_RESPONSE_TYPE} = require('./databaseService');

const KEYFILEPATH = require("../keys/user-service-key.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});


const createAndUploadFile = async (fileName, fileContent) => {

    const drive = google.drive({version: "v3", auth});
    let databaseResponse = new DatabaseResponse();

    const fileMetaData = {
        'name': fileName,
        'parents': []
    };

    const media = {
        mimeType: 'audio/mpeg',
        body: fileContent
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
            databaseResponse.setResponse(DATABASE_RESPONSE_TYPE.ERROR);
            databaseResponse.setMessage(cloudResponse.errors);
            return databaseResponse;
    }

    drive.close();
    return databaseResponse;
};

module.exports = {
    createAndUploadFile
}