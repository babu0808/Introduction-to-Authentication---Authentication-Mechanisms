const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bycrypt = require("bycrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const authHeader = request.headers["authorisation"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }

  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Create User API
app.post("/users", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bycrypt.hash(password, 10);
  // SelectUserQuery

  const selectUserQuery = `
  SELECT 
    * 
  FROM 
    user 
  WHERE 
    username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    //Register User API

    // CreateUserQuery

    const createUserQuery = `
  INSERT INTO
    user (username, name, password, gender, location)
  VALUES
    (
      '${username}',
      '${name}',
      '${hashedPassword}',
      '${gender}',
      '${location}'  
    );`;
    await db.run(createUserQuery);

    response.send("User added successfully");
  } else {
    //send invalid response
    response.status(4000);
    response.send("User already Exists");
  }
});
//user login API
app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `
  SELECT 
    * 
  FROM 
    user 
  WHERE 
    username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(4000);
    response.send("Invalid User");
  } else {
    const isPasswordmatched = await bcrypt.compare(password, dbUser.password);

    if (isPasswordmatched === true) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "rabdomOptional");
      respond.send({ jwtToken });
      response.send("Login Success");
    } else {
      response.status(400);
      respond.send("invalid Password");
    }
  }
});
