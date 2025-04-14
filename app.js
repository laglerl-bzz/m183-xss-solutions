const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Security middleware
const helmet = require('helmet'); // Helmet is used to set various HTTP headers to secure the app

// Setup security headers
app.use(helmet()); // Adds security headers to prevent common attacks, including XSS

// Setup body parser
app.use(bodyParser.urlencoded({ extended: false })); // Parses incoming request bodies

let comments = [];

// XSS filter function
function escapeHtml(unsafe) {
  // Escapes special characters to prevent XSS attacks
  return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

app.get('/', (req, res) => {
  // No user input is displayed here, so no XSS risk
  res.send(`
    <h1>XSS Demo - Secured Version</h1>
    <ul>
      <li><a href="/stored">Stored XSS</a> (Comments)</li>
      <li><a href="/search">Reflected XSS</a> (Search)</li>
      <li><a href="/dom">DOM-Based XSS</a></li>
    </ul>
  `);
});

app.get('/stored', (req, res) => {
  // Escapes all comments before displaying them to prevent stored XSS
  let commentsList = comments.map(comment =>
      `<li>${escapeHtml(comment.content)}</li>`
  ).join('');

  res.send(`
    <h1>Comments</h1>
    <form method="POST" action="/stored">
      <input type="text" name="comment">
      <button>Post</button>
    </form>
    <ul>${commentsList}</ul>
    <a href="/">Back to home</a>
  `);
});

app.post('/stored', (req, res) => {
  // Sanitizes user input before storing it to prevent stored XSS
  const sanitizedComment = escapeHtml(req.body.comment);
  comments.push({ content: sanitizedComment });
  res.redirect('/stored');
});

app.get('/search', (req, res) => {
  const query = req.query.q || '';

  // Escapes the search query before displaying it to prevent reflected XSS
  res.send(`
    <h1>Search</h1>
    <form>
      <input type="text" name="q">
      <button>Search</button>
    </form>
    ${query ? `<p>Results for: ${escapeHtml(query)}</p>` : ''}
    <a href="/">Back to home</a>
  `);
});

app.get('/dom', (req, res) => {
  res.send(`
    <h1>DOM-Based XSS - Secured Version</h1>
    <p id="output"></p>
    <input id="inputField" type="text">
    <button id="submitBU" type="submit">Submit</button>
    </br>
    <a href="/">Back to home</a>

    <script>
        document.getElementById("submitBU").addEventListener("click", function() {
            // Uses textContent instead of innerHTML to prevent DOM-based XSS
            const userInput = document.getElementById("inputField").value;
            document.getElementById("output").textContent = userInput;
            
            // Alternative: If you must use HTML, sanitize it first
            // const sanitizedInput = userInput.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            // document.getElementById("output").innerHTML = sanitizedInput;
        });
    </script>
    `);
});

app.listen(port, () => {
  console.log(`Secure server running at http://localhost:${port}`);
});