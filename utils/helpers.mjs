import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
    const saltRounds = 10;
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        return bcrypt.hash(password, salt);
    } catch (err) {
        throw new Error(err);
    }
}

export const comparePassword = async (plain, hash) => {
    try {
        return await bcrypt.compare(plain, hash);
    } catch (err) {
        throw err;
    }
}