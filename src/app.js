import wkhtmltopdf from 'wkhtmltopdf';
import fs from 'fs';
import http from 'http';
import querystring from 'querystring';

const TEMPLATES = {
  'document': 'document.html'
};

const compileData = (data, template) => {
  let templateContents = fs.readFileSync(template, 'utf-8');

  const compileTemplate = (accumulator, current, index, array) => {
    return accumulator.replace(`{{ ${current} }}`, data[current]);
  };

  return Object.keys(data)
    .reduce(compileTemplate, templateContents);
};

const generateDocument = (contents) => {
  wkhtmltopdf(contents, { viewportSize: '1980x1600', pageSize: 'letter' })
  .pipe(fs.createWriteStream('some-pdf-document.pdf'));
};

let server = http.createServer((req, res) => {
  switch(req.url) {
    case '/':
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.write(`
      <form action="/generate" method="POST">
        <p>
          <input type="text" id="url" name="url" placeholder="https://example.com">
        </p>
        <p>
          <input type="text" id="other" name="other" placeholder="Other">
        </p>
        <button type="submit">Generate</button>
      </form>
      `);
      res.end();
      break;
    case '/generate':
      req.on('data', (chunk) => {
        res.writeHead(200);
        const body = chunk.toString();
        const data = querystring.parse(body);
        const template = TEMPLATES.document;
        generateDocument(compileData(data, `./templates/${template}`));
        res.end();
      })
      break;
  }
});

server.listen(process.env.PORT || 8080, 'localhost', () => {
  console.log('Server started');
});
