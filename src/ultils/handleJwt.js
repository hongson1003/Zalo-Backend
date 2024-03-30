import jwt from 'jsonwebtoken';

const signJwt = (data, secret, expiresIn) => {
    let token = jwt.sign({
        data: data
    }, secret, { expiresIn: expiresIn });
    return token;
}

const verify = (token, secret) => {
    try {
        let myDecoded = null;
        jwt.verify(token, secret, (err, decoded) => {
            myDecoded = decoded;
            if (err) {
                throw err;
            }
        });
        return myDecoded;
    } catch (error) {
        console.log('verify')
        throw error
    }
}

const extractToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }
    return null;
}

module.exports = {
    signJwt,
    verify,
    extractToken
}
