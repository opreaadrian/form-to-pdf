import wkhtmltopdf from 'wkhtmltopdf';
import fs from 'fs';
import express from 'express';
import querystring from 'querystring';
import pug from 'pug';
import bodyParser from 'body-parser';
import uuid from 'uuid';

const logger = require('morgan');

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
  const documentPath = `./downloads/${uuid.v4()}.pdf`;
  wkhtmltopdf(contents, { viewportSize: '1980x1600', pageSize: 'letter' })
  .pipe(fs.createWriteStream(documentPath));
  return documentPath;
};

const generatePdf = (req, res) => {
  const body = req.body;
  const template = TEMPLATES.document;
  const pdfUrl = generateDocument(compileData(body, `./templates/${template}`));
  res.json({
    url : `http://localhost:8080/${pdfUrl.slice(1)}`
  });
};

const app = express();
app.engine('pug', pug.__express);
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(logger('combined'));
app.post('/generate', generatePdf);
app.get('/download/:document', (req, res) => {
  res.download(`${__dirname}/../downloads/${req.params.document}`);
});
app.listen(process.env.PORT || 8080, 'localhost', () => {
  console.log('Server started');
});
