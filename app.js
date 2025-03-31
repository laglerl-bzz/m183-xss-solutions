const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  const name = req.query.name || 'Guest';
  res.send(`
    <h1>Welcome, ${name}!</h1>
    <form method="POST" action="/comment">
      <textarea name="comment" placeholder="Leave a comment"></textarea>
      <br><button type="submit">Post Comment</button>
    </form>
  `);
});

let comments = [];

app.post('/comment', (req, res) => {
  comments.push(req.body.comment);
  res.redirect('/comments');
});

app.get('/comments', (req, res) => {
  const commentHtml = comments.map(c => `<p>${c}</p>`).join('');
  res.send(`
    <h1>Comments</h1>
    ${commentHtml}
    <a href="/">Back</a>
  `);
});

app.listen(port, () => {
  console.log(`XSS demo app running at http://localhost:${port}`);
});
