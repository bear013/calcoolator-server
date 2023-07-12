const {sequelize , DataTypes} = require('./db')

/*
db.run(`CREATE TABLE IF NOT EXISTS operations (
id INT PRIMARY KEY,
type VARCHAR(64) NOT NULL,
cost INT NOT NULL
)`,[], err => {
	db.run(`INSERT OR IGNORE INTO operations(id, type,cost) 
	VALUES(1, 'addition',1),
		(2, 'subtraction',2),
		(3, 'multiplication', 3),
		(4, 'division', 4),
		(5, 'square_root', 10),
		(6, 'random_string', 30)`)
})

operation.create({type:'addition',cost:1}))

*/

const Operation = sequelize.define('Operation', {
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cost: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  
});


module.exports = Operation