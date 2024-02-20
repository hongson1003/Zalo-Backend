import bcrypt from 'bcrypt';
const saltRounds = 10;
const rejectKeyUserRegister = ['id', 'phoneNumber', 'userName', 'avatar']

const hashPassword = (myPlaintextPassword) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(myPlaintextPassword, salt);
}

const checkPassword = (myPlaintextPassword, hashedPassword) => {
    return bcrypt.compareSync(myPlaintextPassword, hashedPassword); // true
}

const standardUser = (user) => {
    let myUser = { ...user };
    for (let key in myUser)
        if (!rejectKeyUserRegister.includes(key))
            delete myUser[key];
    return myUser;
}









module.exports = {
    standardUser,
    hashPassword,
    checkPassword
}