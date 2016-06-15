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

  const compileTemplate = (accumulator, current) => {
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
  const formData = req.body.formData;
  const template = req.body.templateContents;
  const pdfUrl = generateDocument(compileData(formData, `./templates/${template}`));
  res.json({
    url: `http://localhost:8080/${pdfUrl.slice(1)}`
  });
};

const downloadDocument = (req, res) => {
  const RESOURCE_PATH = `${__dirname}/../downloads/${req.params.document}`;
  fs.stat(RESOURCE_PATH, (error) => {
    if (error) {
      throw error;
    }

    res.download(RESOURCE_PATH);
  })
};

const app = express();
app.engine('pug', pug.__express);
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(logger('combined'));
app.post('/generate', generatePdf);
app.get('/download/:document', downloadDocument);
app.listen(process.env.PORT || 8080, 'localhost', () => {
  console.log('Server started');
});
