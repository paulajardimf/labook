import { BaseDatabase } from "./BaseDatabase"

export class UserDatabase extends BaseDatabase {
  public static TABLE_USERS = "users"

  public getAllUsers = async () => {
    const usersDB = await BaseDatabase
      .connection(UserDatabase.TABLE_USERS)
      .select()
    return usersDB
  }

}