const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');

//! FILES

// Блокирующий синхронный способ
// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${new Date(Date.now()).toLocaleString('RU-ru')}`;

// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File written');

// АССИНХРОННО через Коллбэки

/* fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
  if (err) return console.log('ERROR!', err.message);

  fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
    console.log(data2);
    fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
      console.log(data3);

      fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
        console.log('Your file has been written 🎯🎯');
        });
    });
  });
});

console.log('will read file'); */

//! SERVER

// Прочитать один раз, потому можно синхронно один раз, а не при каждом запросе на сервер
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

dataObj.forEach(el => {
  el.slug = slugify(el.productName, { lower: true });
});
// console.log(dataObj);
const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));

// console.log(slugs);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);
  console.log(pathname);
  // Overview Page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(output);

    // Product Page
  } else if (pathname.startsWith('/product')) {
    res.writeHead(200, { 'Content-type': 'text/html' });
    console.log(query);
    console.log(pathname);

    // const product = dataObj[query.id];
    const product = dataObj.find(el => el.slug === pathname.split('/')[2]);
    console.log(product);
    const output = replaceTemplate(tempProduct, product);

    res.end(output);

    // API
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);

    // Not Found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world',
    });

    res.end('<h1>Page not found!</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
