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
    for (let key in user)
        if (!rejectKeyUserRegister.includes(key))
            delete user[key];
    return user;
}









module.exports = {
    standardUser,
    hashPassword,
    checkPassword
}