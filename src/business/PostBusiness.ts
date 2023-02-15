import { PostDatabase } from "../database/PostDatabase";
import { Post } from "../models/Post";
import { CreatePostInput, CreatePostOutput } from "../dtos/postDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { IdGenerator } from "../services/IdGenerator";
import { HashManager } from "../services/HashManager";
import { TokenManager } from "../services/TokenManager";

export class PostBusiness {
  constructor(
    private postDatabase: PostDatabase,
    private idGenerator: IdGenerator,
    private tokenManager: TokenManager,
    private hashManager: HashManager
  ) {}

  public getPosts = async (q: string | undefined) => {
    const {postsDB, usersDB} = await this.postDatabase.getPostsAndUsers(q);

    const posts = postsDB.map((postDB) => {
      const post = new Post (
        postDB.id,
        postDB.content,
        postDB.likes,
        postDB.dislikes,
        postDB.created_at,
        postDB.updated_at,
        getCreator(postDB.creator_id)
      )

      return post.toBusinessModel()
    })


    function getCreator(creatorId: string) {
      const creator = usersDB.find((userDB) => {
        return userDB.id === creatorId
      })

      return {
        id: creator.id,
        name: creator.name
      }
    }

    return posts
  }

  public createPost = async (
    input : CreatePostInput
  ): Promise<CreatePostOutput> => {
    const { content, token } = input
    const payload = this.tokenManager.getPayload(token as string)

    if (payload === null) {
      throw new BadRequestError("Usuário não logado!")
    }

    if (typeof content !== "string") {
      throw new BadRequestError("'post' deve ser string")
    }

    if (content.length === 0) {
      throw new BadRequestError("'post' não pode ser vazio")
    }

    const id = this.idGenerator.generate()

    const post = new Post (
      id,
      content,
      0,
      0,
      new Date().toISOString(),
      new Date().toISOString(),
      payload
    )

    const postDB = post.toDBModel()

    await this.postDatabase.createPost(postDB)

    const output: CreatePostOutput = {
      message: "Post enviado com sucesso!"
    }

    return output
  }
}