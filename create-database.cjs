const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db/calculator.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Created and connected to the calculator database.');
  
  db.run(`CREATE TABLE IF NOT EXISTS users (
	id INT PRIMARY KEY,
   	username VARCHAR(256) NOT NULL,
	password VARCHAR(256) NOT NULL,
	status int NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS operations (
	id INT PRIMARY KEY,
   	type VARCHAR(64) NOT NULL,
	cost INT NOT NULL
  )`);
  
  db.run(`INSERT OR IGNORE INTO operations(id, type,cost) 
			VALUES(1, 'addition',1),
				(2, 'subtraction',2),
				(3, 'multiplication', 3),
				(4, 'division', 4),
				(5, 'square_root', 10),
				(6, 'random_string', 30)`);  

  db.run(`CREATE TABLE IF NOT EXISTS records (
	id INT PRIMARY KEY,
   	operation_id INT NOT NULL,
	user_id INT NOT NULL,
	amount INT NOT NULL,
	user_balance INT NOT NULL,
	operation_response VARCHAR(256) NOT NULL,
	operation_date DATETIME NOT NULL
  )`);

  console.log('All OK.');
  
});

