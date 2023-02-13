import { BaseDatabase } from "./BaseDatabase";

export class PostDatabase extends BaseDatabase {
  public static TABLE_POSTS = "posts"

  public getAllPosts = async () => {
    const postsDB = await BaseDatabase
      .connection(PostDatabase.TABLE_POSTS)
      .select()
    return postsDB
  }

}