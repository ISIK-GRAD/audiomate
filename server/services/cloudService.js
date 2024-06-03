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
        }
    
    }
    catch(err){
        console.error('[CLOUD SERVICE] Error uploading file:', err);
        databaseResponse.setResponse(SERVICE_RESPONSE_TYPE.ERROR);
    }
    
    return databaseResponse;
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
    }
    catch(err){
        console.error("[CLOUD SERVICE] Error while searching file: ", err);
        databaseResponse.setResponse(SERVICE_RESPONSE_TYPE.ERROR);
    }
    return databaseResponse;

}

const fetchAudioForAnimations = async (animationNames) => {
    const databaseResponse = new DatabaseResponse();

    try {
        const query = animationNames.map(name => `name = '${name}'`).join(' or ');
        
        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        if (res.data.files.length === 0) {
            databaseResponse.setResponse(SERVICE_RESPONSE_TYPE.NOT_FOUND);
            console.log("[CLOUD SERVICE] No animations found for the given names");
        } else {
            const filesData = await Promise.all(res.data.files.map(async (file) => {
                const response = await drive.files.get({
                    fileId: file.id,
                    alt: 'media' 
                }, {
                    responseType: 'stream'
                });

                const chunks = [];
                for await (const chunk of response.data) {
                    chunks.push(chunk);
                }
                const content = Buffer.concat(chunks);

                return {
                    id: file.id,
                    name: file.name,
                    content: content.toString('base64') 
                };
            }));

            databaseResponse.setResponse(SERVICE_RESPONSE_TYPE.SUCCESS);
            databaseResponse.setData(filesData);
            console.log("[CLOUD SERVICE] Animations and associated audio fetched successfully");
        }
    } catch (err) {
        console.error("[CLOUD SERVICE] Error while fetching animations: ", err);
        databaseResponse.setResponse(SERVICE_RESPONSE_TYPE.ERROR);
    }

    return databaseResponse;
}



module.exports = {
    createAndUploadFile,
    searchFile,
    fetchAudioForAnimations
}