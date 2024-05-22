const databaseService = require('../services/databaseService');
const {ResponseType} = require('../services/databaseService');

const postEndPoints = {
    '/signin': async (req, res) => {
        const { email, password } = req.body;
      
        const databaseResponse = await databaseService.signin(email, password);
        if(databaseResponse.responseType === ResponseType.Success){
            res.status(200).json({ message: 'User signed in successfully', user: databaseResponse.data });
            console.log(databaseResponse.data.username + ' signed in successfully');
        } 
        else if(databaseResponse.responseType === ResponseType.AccessDenied){
            return res.status(401).send('Incorrect password');
        }
        else if(databaseResponse.responseType === ResponseType.MissingFields){
            return res.status(400).send('Missing required fields');
        }
        else if(databaseResponse.responseType === ResponseType.Error){
            return res.status(500).send('Server error');
        }
      },
    '/signup': async (req, res) => {
        const { email, password, username } = req.body;

        const databaseResponse = await databaseService.signup(email, password, username);
        if(databaseResponse.responseType === ResponseType.Success){
            return res.status(201).json({ message: 'User registered successfully', user: { email, username } });
        }
        else if(databaseResponse.responseType === ResponseType.MissingFields){
            return res.status(400).send('Missing required fields');
        }
        else if(databaseResponse.responseType === ResponseType.AlreadyExists){
            return res.status(400).send('User already exists');
        }
        else if(databaseResponse.responseType === ResponseType.Error){
            console.error('Error creating user:', err);
            return res.status(500).send('Server error');
        }
    }
}

const getEndPoints = {

}

module.exports = {getEndPoints, postEndPoints};