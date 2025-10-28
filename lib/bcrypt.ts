import * as bcrypt from "bcryptjs";

export const hash = (password: string) => bcrypt.hash(password, 10);
export const compare = (input: string, hashed: string) => bcrypt.compare(input, hashed);
