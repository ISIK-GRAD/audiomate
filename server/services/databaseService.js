const User = require('../models/user');
const bcrypt = require('bcrypt');


class DatabaseResponse {
    constructor(responseType=DATABASE_RESPONSE_TYPE.SUCCESS, data=null, message=null){
        this.responseType = responseType;
        this.data = data;
        this.message = message;
    }

    setResponse(responseType){
        this.responseType = responseType;
    }

    setData(data){
        this.data = data;
    }

    setMessage(message){
        this.message = message;
    }
}

const DATABASE_RESPONSE_TYPE = {
    SUCCESS: "Success",
    ACCESS_DENIED: "AccessDenied",
    NOT_FOUND: "NotFound",
    MISSING_FIELDS: "MissingFields",
    ALREADY_EXISTS: "AlreadyExists",
    ERROR: "Error",
}


const signin = async (email, password) => {
    const response = new DatabaseResponse();
    if (!email || !password) {
        response.setResponse(DATABASE_RESPONSE_TYPE.MISSING_FIELDS);
    }
    
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          response.setResponse(DATABASE_RESPONSE_TYPE.ACCESS_DENIED);
          return response;
        }
    
        // Compare the hashed password with the provided password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            response.setResponse(DATABASE_RESPONSE_TYPE.ACCESS_DENIED);
        }

        response.setData({ email: user.email, username: user.username });
      } catch (err) {
        console.error('Error signing in user:', err);
        response.setResponse(DATABASE_RESPONSE_TYPE.ERROR);
    }
    console.log("response: ", response);
    return response;
}

const signup = async(email, password, username) => {
    const response = new DatabaseResponse();
    if (!email || !password || !username) {
        response.setResponse(DATABASE_RESPONSE_TYPE.MISSING_FIELDS);
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword, username });
        if(!newUser){
            response.setResponse(DATABASE_RESPONSE_TYPE.ALREADY_EXISTS);
        }
    } catch (err) {
        console.error('Error creating user:', err);
        response.setResponse(DATABASE_RESPONSE_TYPE.ERROR);
    }
    return response;
}

module.exports = {
    signin,
    signup,
    ResponseType: DATABASE_RESPONSE_TYPE
}