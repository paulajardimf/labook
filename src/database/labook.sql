-- Active: 1676296562892@@127.0.0.1@3306
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
);

INSERT INTO users (id, name, email, password, role) VALUES
  ("u001", "Paula", "paula@gmail.com", "123", "admin"),
  ("u002", "Bárbara", "barbara@gmail.com", "456", "author"),
  ("u003", "Aline", "aline@gmail.com", "789", "author"),
  ("u004", "Lana", "lana@gmail.com", "321", "author");

SELECT * FROM users;

DROP TABLE users;
