import bcrypt from 'bcrypt';
const saltRounds = 10;
const keyUserRegister = ['id', 'phoneNumber', 'userName', 'avatar', 'lastedOnline'];
const keyProfile = ['birthdate', 'gender', 'soundTrack', 'coverImage', 'description'];

const hashPassword = (myPlaintextPassword) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(myPlaintextPassword, salt);
}

const checkPassword = (myPlaintextPassword, hashedPassword) => {
    return bcrypt.compareSync(myPlaintextPassword, hashedPassword); // true
}

const standardUser = (user) => {
    let myUser = { ...user };
    if (myUser.avatar) {
        const avatar = myUser.avatar;
        const base64 = Buffer.from(avatar, 'base64');
        myUser.avatar = base64.toString();
    }
    for (let key in myUser)
        if (!keyUserRegister.includes(key))
            delete myUser[key];
    return myUser;
}

const standardProfile = (profile) => {
    let myProfile = { ...profile };
    for (let key in myProfile)
        if (!keyProfile.includes(key))
            delete myProfile[key];
    return myProfile;
}



module.exports = {
    standardUser,
    hashPassword,
    checkPassword,
    standardProfile
}