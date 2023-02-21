import { PostDatabase } from "../database/PostDatabase";
import { Post } from "../models/Post";
import { CreatePostInput, CreatePostOutput, DeletePostInput, EditPostInput, GetPostsInput, LikeOrDislikePostInput } from "../dtos/postDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { IdGenerator } from "../services/IdGenerator";
import { HashManager } from "../services/HashManager";
import { TokenManager } from "../services/TokenManager";
import { ForbiddenError } from "../errors/ForbiddenError";
import { LikeDislikeDB, PostDB, PostModel, POST_LIKE, USER_ROLES } from "../types";
import { NotFoundError } from "../errors/NotFoundError";

export class PostBusiness {
  constructor(
    private postDatabase: PostDatabase,
    private idGenerator: IdGenerator,
    private tokenManager: TokenManager,
    private hashManager: HashManager
  ) {}

  public getPosts = async (input: GetPostsInput) => {
    const {q, token} = input

    if(!token) {
      throw new BadRequestError("Token não enviado!")
    }

    const payload = this.tokenManager.getPayload(token as string)

    if(payload === null) {
      throw new BadRequestError("Token inválido!")
    }

    if (typeof q !== "string" && q !== undefined) {
      throw new BadRequestError("'q' deve ser string ou undefined")
    }
    
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

    if (token === undefined) {
      throw new BadRequestError("Token ausente!")
    }

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

  public editPost = async (
    input : EditPostInput
  ): Promise<void> => {
    const { idToEdit, content, token } = input

    if (token === undefined) {
      throw new BadRequestError("Token ausente!")
    }

    const payload = this.tokenManager.getPayload(token as string)

    if (payload === null) {
      throw new BadRequestError("Usuário não logado!")
    }

    if (typeof content !== "string") {
      throw new BadRequestError("'name' deve ser string")
    }

    const postDB : PostDB | undefined = await this.postDatabase.findById(idToEdit)

    if (!postDB) {
      throw new NotFoundError("'id' não encontrado")
    }

    if (postDB.creator_id !== payload.id) {
      throw new BadRequestError("Somente o criador do post pode editar.")
    }

    const post = new Post (
      postDB.id,
      postDB.content,
      postDB.likes,
      postDB.dislikes,
      postDB.created_at,
      postDB.updated_at,
      payload
    )

    post.setContent(content)
    post.setUpdatedAt(new Date().toISOString())

    const updatedPost = post.toDBModel()

    await this.postDatabase.update(idToEdit, updatedPost)

  }

  public deletePost = async (
    input : DeletePostInput
  ): Promise<void> => {
    const { idToDelete, token } = input

    if (token === undefined) {
      throw new BadRequestError("Token ausente!")
    }

    const payload = this.tokenManager.getPayload(token as string)

    if (payload === null) {
      throw new BadRequestError("Usuário não logado!")
    }

    const postDB : PostDB | undefined = await this.postDatabase.findById(idToDelete)

    if (!postDB) {
      throw new NotFoundError("'id' não encontrado")
    }

    if (payload.role !== USER_ROLES.ADMIN && postDB.creator_id !== payload.id) {
      throw new BadRequestError("Somente o criador do post pode deletar.")
    }

    await this.postDatabase.deleteById(idToDelete)

  }

  public likeOrDislikePost = async (input: LikeOrDislikePostInput): Promise<void> => {
    const {idToLikeOrDislike, token, like} = input

    if (token === undefined) {
      throw new BadRequestError("Token ausente!")
    }

    const payload = this.tokenManager.getPayload(token as string)

    if (payload === null) {
      throw new BadRequestError("Usuário não logado!")
    }

    if (typeof like !== "boolean") {
      throw new BadRequestError("'like' deve ser boolean!")
    }

    const postDB : PostDB | undefined = await this.postDatabase.findPostWithCreatorById(idToLikeOrDislike)

    if (!postDB) {
      throw new NotFoundError("'id' não encontrado")
    }

    const likeSQLite = like ? 1 : 0

    if (postDB.creator_id === payload.id) {
      throw new BadRequestError("O criador não pode curtir seu próprio post.")
    }

    const likeDislikeDB: LikeDislikeDB = {
      user_id: payload.id,
      post_id: postDB.id,
      like: likeSQLite
    }

    const usersDB = await this.postDatabase.getAllUsers()

    function getCreator(creatorId: string) {
      const creator = usersDB.find((userDB) => {
        return userDB.id === creatorId
      })

      return {
        id: creator.id,
        name: creator.name
      }
    }

    const post = new Post (
      postDB.id,
      postDB.content,
      postDB.likes,
      postDB.dislikes,
      postDB.created_at,
      postDB.updated_at,
      getCreator(postDB.creator_id)
    )

    const likeDislikeExists = await this.postDatabase.findLikeDislike(likeDislikeDB)

    if (likeDislikeExists === POST_LIKE.ALREADY_LIKED) {
      if (like) {
        await this.postDatabase.removeLikeDislike(likeDislikeDB)
        post.removeLike()
      } else {
        await this.postDatabase.updateLikeDislike(likeDislikeDB)
        post.removeLike()
        post.addDislike()
      }
    } else if (likeDislikeExists === POST_LIKE.ALREADY_DISLIKED) {
      if (like) {
        await this.postDatabase.updateLikeDislike(likeDislikeDB)
        post.removeDislike()
        post.addLike()
      } else {
        await this.postDatabase.removeLikeDislike(likeDislikeDB)
        post.removeDislike()
      }
    } else {
      await this.postDatabase.likeOrDislikePost(likeDislikeDB)
  
      like ? post.addLike() : post.addDislike()
    }

    const updatedPost = post.toDBModel()
  
    await this.postDatabase.update(idToLikeOrDislike, updatedPost)
  }
}