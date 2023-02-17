import { Request, Response } from "express";
import { PostBusiness } from "../business/PostBusiness";
import { CreatePostInput, EditPostInput, GetPostsInput } from "../dtos/postDTO";
import { BaseError } from "../errors/BaseError";

export class PostController {
  constructor(
    private postBusiness : PostBusiness
  ){}

  public getPosts = async (req: Request, res: Response) => {
    try {
      const input: GetPostsInput = {
        q: req.query.q as string | undefined,
        token: req.headers.authorization
      }
      
      const output = await this.postBusiness.getPosts(input)

      res.status(200).send(output)

    } catch (error) {
      console.log(error);
  
      if(error instanceof Error) {
        res.status(500).send(error.message)
      } else {
        res.status(500).send("Erro inesperado")
      }
    }
  }

  public createPost = async (req: Request, res: Response) => {
    try {
      const input: CreatePostInput ={
        content: req.body.content,
        token: req.headers.authorization
      }

      const output = await this.postBusiness.createPost(input)

      res.status(201).send(output)

    } catch (error) {
      console.log(error)

      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message)
      } else {
        res.status(500).send("Erro inesperado")
      }
    }
  }

  public editPost = async (req: Request, res: Response) => {
    try {
      const input : EditPostInput = {
        idToEdit: req.params.id,
        content: req.body.content,
        token: req.headers.authorization
      }

      await this.postBusiness.editPost(input)

      res.status(200).end()
    } catch (error) {
      console.log(error)

      if (error instanceof BaseError) {
        res.status(error.statusCode).send(error.message)
      } else {
        res.status(500).send("Erro inesperado")
      }
    }
  }
}