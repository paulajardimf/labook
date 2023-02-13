import { PostDatabase } from "../database/PostDatabase";

export class PostBusiness {
  constructor(private postDatabase: PostDatabase) {}

  public getPosts = async () => {
    const postsDB = await this.postDatabase.getAllPosts();

    return postsDB
  }
}