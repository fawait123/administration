
import * as bcrypt from 'bcrypt';


export const hash = async (password: string): Promise<string> => {
    const hash = await bcrypt.hash(password, 10);
    return hash
}

export const compare = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
}