import { UserDB } from "../types"
import { BaseDatabase } from "./BaseDatabase"

export class UserDatabase extends BaseDatabase {
  public static TABLE_USERS = "users"

  public getAllUsers = async () => {
    const usersDB = await BaseDatabase
      .connection(UserDatabase.TABLE_USERS)
      .select()
    return usersDB
  }

  public async insertUser(newUserDB: UserDB) {
    await BaseDatabase
        .connection(UserDatabase.TABLE_USERS)
        .insert(newUserDB)
  }

  public async findUserByEmail(email: string) {
    const [ userDB ]: UserDB[] | undefined[] = await BaseDatabase
        .connection(UserDatabase.TABLE_USERS)
        .where({ email })

    return userDB
}

}