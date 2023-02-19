-- Active: 1676296562892@@127.0.0.1@3306
DROP TABLE users;

DROP TABLE posts;

DROP TABLE likes_dislikes;

CREATE TABLE users(
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT DEFAULT(DATETIME())
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY UNIQUE NOT NULL,
  creator_id TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT(0),
  dislikes INTEGER DEFAULT(0),
  created_at TEXT DEFAULT(DATETIME()),
  updated_at TEXT DEFAULT(DATETIME()),
  FOREIGN KEY (creator_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE likes_dislikes (
  user_id TEXT NOT NULL,
  post_id TEXT NOT NULL,
  like INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  UNIQUE (user_id, post_id)
);

INSERT INTO users (id, name, email, password, role) VALUES
  ("u001", "Paula", "paula@gmail.com", "123", "admin"),
  ("u002", "Bárbara", "barbara@gmail.com", "456", "author"),
  ("u003", "Aline", "aline@gmail.com", "789", "author"),
  ("u004", "Lana", "lana@gmail.com", "321", "author");

INSERT INTO posts (id, creator_id, content) VALUES
  ("p001", "u002", "Oie!"),
  ("p002", "u003", "Bom dia!"),
  ("p003", "u004", "Au auuu!!!");

INSERT INTO likes_dislikes (user_id, post_id, like) VALUES 
  ("u002", "p002", 1),
  ("u003", "p001", 1),
  ("u002", "p003", 1),
  ("u003", "p003", 1);

SELECT * FROM users;

SELECT * FROM posts;

SELECT * FROM likes_dislikes;


