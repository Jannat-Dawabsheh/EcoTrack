
    module.exports= async (con,userId, scoreIncrement)=> {

    const [user] = await getUserById(userId,con);
    if (!user) {
      return;
    }
    const currentScore = user.score || 0;
    const newScore = currentScore + scoreIncrement;
    await updateScore(userId, newScore,con);
  }
  
  function getUserById(userId, con) {
    return new Promise((resolve, reject) => {
      con.query('SELECT * FROM user WHERE userID = ?', [userId], (err, results) => {
        if (err) {
          console.error('MySQL query error:', err);
          reject(err);
        }
  
        resolve(results);
      });
    });
  }
  
  function updateScore(userId, newScore,con) {
    return new Promise((resolve, reject) => {
      con.query('UPDATE user SET score = ? WHERE userID = ?', [newScore, userId], (err, results) => {
        if (err) {
          console.error('MySQL query error:', err);
          reject(err);
        }
  
        resolve(results);
      });
    });
  }

