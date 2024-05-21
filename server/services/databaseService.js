const User = require('../models/user');
const bcrypt = require('bcrypt');
const databaseConfig = require('../config/databaseConfig.json');

class DatabaseResponse {
    constructor(responseType=ResponseType.Success, data=null){
        this.responseType = responseType;
        this.data = data;
    }

    setResponse(responseType){
        this.responseType = responseType;
    }
}

const ResponseType = {
    Success: "Success",
    AccessDenied: "AccessDenied",
    NotFound: "NotFound",
    MissingFields: "MissingFields",
    AlreadyExists: "AlreadyExists",
    Error: "Error",
}


const signin = async (email, password) => {
    const response = new DatabaseResponse();
    if (!email || !password) {
        response.setResponse(ResponseType.MissingFields);
    }
    
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return res.status(401).send('User not found');
        }
    
        // Compare the hashed password with the provided password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            response.setResponse(ResponseType.AccessDenied);
        }
      } catch (err) {
        console.error('Error signing in user:', err);
        response.setResponse(ResponseType.Error);
    }
    return response;
}

const signup = async(email, password, username) => {
    const response = new DatabaseResponse();
    if (!email || !password || !username) {
        response.setResponse(ResponseType.MissingFields);
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword, username });
        if(!newUser){
            response.setResponse(ResponseType.AlreadyExists);
        }
    } catch (err) {
        console.error('Error creating user:', err);
        response.setResponse(ResponseType.Error);
    }
    return response;
}

module.exports = {
    signin,
    signup
}