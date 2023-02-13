import { BaseDatabase } from "./BaseDatabase"

export class UsersDatabase extends BaseDatabase {
  public static TABLE_USERS = "users"

  public getAllUsers = async () => {
    const usersDB = await BaseDatabase
      .connection(UsersDatabase.TABLE_USERS)
      .select()
    return usersDB
  }

}