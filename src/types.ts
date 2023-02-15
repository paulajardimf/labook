export enum USER_ROLES {
  NORMAL = "NORMAL",
  ADMIN = "ADMIN"
}

export interface TokenPayload {
  id: string,
  name: string,
  role: USER_ROLES
}
export interface PostDB {
  id: string,
  creator_id: string,
  content: string,
  likes: number,
  dislikes: number,
  created_at: string,
  updated_at: string
}

export interface PostModel {
  id: string,
  content: string,
  likes: number,
  dislikes: number,
  createdAt: string,
  updatedAt: string,
  creator: {
    id: string,
    name: string
  }
}
