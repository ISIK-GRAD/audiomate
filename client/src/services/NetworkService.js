const networkConfig = require("../config/NetworkConfig.json");
const remoteAddress = `${networkConfig.protocol}://${networkConfig.host}:${networkConfig.port}`;

class NetworkResponse {
    constructor(responseType=NETWORK_RESPONSE_TYPE.SUCCESS, data=null, message=null){
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

    isError(){
        return this.responseType === NETWORK_RESPONSE_TYPE.ERROR;
    }
}

const NETWORK_RESPONSE_TYPE = {
    SUCCESS: "Success",
    ERROR: "Error",
    MISSING_FIELDS: "MissingFields",
    ACCESS_DENIED: "AccessDenied",
    ALREADY_EXISTS: "AlreadyExists",
    NOT_FOUND: "NotFound"
}

const signin = async(email, password) => {
    const networkResponse = new NetworkResponse();
    const response = await fetch(`${remoteAddress}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      networkResponse.setData(data);
    } else {
        networkResponse.setResponse(NETWORK_RESPONSE_TYPE.ERROR);
        networkResponse.setMessage(data.message);
    }
    return networkResponse;
}

const signup = async(email, password, username) => {
    const networkResponse = new NetworkResponse();
    const response = await fetch(`${remoteAddress}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, username })
    });

    const data = await response.text();

    if (response.ok) {
        networkResponse.setData(data);
    } else {
        networkResponse.setResponse(NETWORK_RESPONSE_TYPE.ERROR);
        networkResponse.setMessage(data.message);
    }
    return networkResponse;
}


const uploadFile = async(email, file, props) => {
    const networkResponse = new NetworkResponse();
    const formData = new FormData();
    const animationName = createRandomName(32);

    console.log(`FILE: ${file} | PROPS: ${props} | EMAIL: ${email}`);

    formData.append('file', file, animationName);
    formData.append('props', JSON.stringify(props));
    formData.append('email', email);

    const response = await fetch(`${remoteAddress}/upload-file`, {
      method: 'POST',
      ContentType: 'multipart/form-data',
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
        networkResponse.setData(data);
    } else {
        networkResponse.setResponse(NETWORK_RESPONSE_TYPE.ERROR);
        networkResponse.setMessage(data.message);
    }
    return networkResponse;
}

const createRandomName = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

module.exports = {
    NetworkResponse,
    NETWORK_RESPONSE_TYPE,
    signin,
    signup,
    uploadFile
}