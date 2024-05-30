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

    try{
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
                console.log("[CLOUD SERVICE] File uploaded successfully. File ID: ", cloudResponse.data.id);
                break;
            default:
                console.error("[CLOUD SERVICE] Error uploading file: ", cloudResponse.errors);
                databaseResponse.setResponse(SERVICE_RESPONSE_TYPE.ERROR);
                databaseResponse.setMessage(cloudResponse.errors);
                return databaseResponse;
        }
    
        return databaseResponse;
    }
    catch(err){
        console.error('[CLOUD SERVICE] Error uploading file:', err);
        databaseResponse.setResponse(SERVICE_RESPONSE_TYPE.ERROR);
        return databaseResponse;
    }

    
};

const searchFile = async (filename) => {
    const databaseResponse = new DatabaseResponse();

    try{
        const res = await drive.files.list({
            q: `mimeType='audio/mpeg' and name contains '${filename}'`,
        })
        if(res.data.files.length === 0){
            databaseResponse.setResponse(SERVICE_RESPONSE_TYPE.NOT_FOUND);
            console.log("[CLOUD SERVICE] File not found: ", filename);
        }
        if(res.data.files.length !== 1){
            databaseResponse.setResponse(SERVICE_RESPONSE_TYPE.ERROR);
            console.error("[CLOUD SERVICE] Found more than one file while searching a file: ", res.data.files);
        }
        databaseResponse.setData(res.data.files[0]);
        return databaseResponse;
    }
    catch(err){
        console.error("[CLOUD SERVICE] Error while searching file: ", err); 
    }
}

module.exports = {
    createAndUploadFile,
    searchFile
}