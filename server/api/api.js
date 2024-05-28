const databaseService = require('../services/databaseService');
const cloudService = require('../services/cloudService');
const {ResponseType} = require('../services/databaseService');

const postEndPoints = {
    '/signin': async (req, res) => {
        const { email, password } = req.body;
      
        const databaseResponse = await databaseService.signin(email, password);
        if(databaseResponse.responseType === ResponseType.SUCCESS){
            res.status(200).json({ message: 'User signed in successfully', user: databaseResponse.data });
            console.log(databaseResponse.data.username + ' signed in successfully');
        } 
        else if(databaseResponse.responseType === ResponseType.ACCESS_DENIED){
            return res.status(401).send('Incorrect password');
        }
        else if(databaseResponse.responseType === ResponseType.MISSING_FIELDS){
            return res.status(400).send('Missing required fields');
        }
        else if(databaseResponse.responseType === ResponseType.ERROR){
            return res.status(500).send('Server error');
        }
      },
    '/signup': async (req, res) => {
        const { email, password, username } = req.body;

        const databaseResponse = await databaseService.signup(email, password, username);
        if(databaseResponse.responseType === ResponseType.SUCCESS){
            return res.status(201).json({ message: 'User registered successfully', user: { email, username } });
        }
        else if(databaseResponse.responseType === ResponseType.MISSING_FIELDS){
            return res.status(400).send('Missing required fields');
        }
        else if(databaseResponse.responseType === ResponseType.ALREADY_EXISTS){
            return res.status(400).send('User already exists');
        }
        else if(databaseResponse.responseType === ResponseType.ERROR){
            console.error('Error creating user:', err);
            return res.status(500).send('Server error');
        }
    },

    '/upload-file': async(req, res) => {
        const { fileName, fileContent } = req.body;
        const cloudResponse = await cloudService.createAndUploadFile(fileName, fileContent);
        if(cloudResponse.responseType === ResponseType.SUCCESS){
            return res.status(200).json({ message: 'File uploaded successfully' });
        }
        else if(cloudResponse.responseType === ResponseType.ERROR){
            console.error('Error uploading file:', err);
            return res.status(500).json({message: `Server error:${cloudResponse.message}`});
        }
    
    }
}

const getEndPoints = {

}

module.exports = {getEndPoints, postEndPoints};