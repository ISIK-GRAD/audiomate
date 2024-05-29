const databaseService = require('../services/databaseService');
const cloudService = require('../services/cloudService');
const {SERVICE_RESPONSE_TYPE} = require('../services/databaseService');
const multer = require("multer");
const storage = multer.memoryStorage(); // Stores files in memory
const upload = multer({ storage: storage });

const postEndPoints = {
    '/signin': 
    {
        func: async (req, res) => {
            const { email, password } = req.body;
        
            const databaseResponse = await databaseService.signin(email, password);
            if(databaseResponse.responseType === SERVICE_RESPONSE_TYPE.SUCCESS){
                res.status(200).json({ message: 'User signed in successfully', user: databaseResponse.data });
                console.log(databaseResponse.data.username + ' signed in successfully');
            } 
            else if(databaseResponse.responseType === SERVICE_RESPONSE_TYPE.ACCESS_DENIED){
                return res.status(401).send('Incorrect password');
            }
            else if(databaseResponse.responseType === SERVICE_RESPONSE_TYPE.MISSING_FIELDS){
                return res.status(400).send('Missing required fields');
            }
            else if(databaseResponse.responseType === SERVICE_RESPONSE_TYPE.ERROR){
                return res.status(500).send('Server error');
            }
        },
        middleware: null,
    },
    '/signup': 
    {
        func: async (req, res) => {
            const { email, password, username } = req.body;

            const databaseResponse = await databaseService.signup(email, password, username);
            if(databaseResponse.responseType === SERVICE_RESPONSE_TYPE.SUCCESS){
                return res.status(201).json({ message: 'User registered successfully', user: { email, username } });
            }
            else if(databaseResponse.responseType === SERVICE_RESPONSE_TYPE.MISSING_FIELDS){
                return res.status(400).send('Missing required fields');
            }
            else if(databaseResponse.responseType === SERVICE_RESPONSE_TYPE.ALREADY_EXISTS){
                return res.status(400).send('User already exists');
            }
            else if(databaseResponse.responseType === SERVICE_RESPONSE_TYPE.ERROR){
                console.error('Error creating user:', err);
                return res.status(500).send('Server error');
            }
        },
        middleware: null,
    },

    '/upload-file': 
    {
        func: async(req, res) => {
            const { email, props } = req.body;
            const file = req.file;

            console.log("REQ:", req);
            console.log(`EMAIL: ${email} | PROPS: ${props} | FILE: ${JSON.stringify(file)}`); 

            try {
                const cloudResponse = await cloudService.createAndUploadFile(file);
                if (cloudResponse.responseType === SERVICE_RESPONSE_TYPE.SUCCESS) {
                    return res.status(200).json({ message: 'File uploaded successfully' });
                } else {
                    return res.status(500).json({ message: `Server error: ${cloudResponse.message}` });
                }
            } catch (err) {
                console.error('Error uploading file:', err);
                return res.status(500).json({ message: `Server error: ${err.message}` });
            }
        },
        middleware: [upload.single('file')]
    }
}

const getEndPoints = {

}

module.exports = {getEndPoints, postEndPoints};