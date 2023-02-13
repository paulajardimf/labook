import { PostDB } from "../types";
import { BaseDatabase } from "./BaseDatabase";
import { UsersDatabase } from "./UserDatabase";

export class PostDatabase extends BaseDatabase {
  public static TABLE_POSTS = "posts"

  public getAllPosts = async () => {
    const postsDB = await BaseDatabase
      .connection(PostDatabase.TABLE_POSTS)
      .select()
    return postsDB
  }

  public getPostsAndCreators = async (q: string | undefined) => {
    let postsDB : PostDB[]

    postsDB = await this.getAllPosts()

    const usersDB = await BaseDatabase.connection(UsersDatabase.TABLE_USERS)
    .select()

    return {
      postsDB,
      usersDB
    }
  }

}