'use strict';

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mimeTypes = {
  "html": "text/html",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "png": "image/png",
  "js": "text/javascript",
  "css": "text/css"
};

http.createServer((req, res) => {
  const uri = url.parse(req.url).pathname;
  let fileName = path.join(process.cwd(), 'client', uri);

  function pageNotFound() {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('404 Not Found\n');
    res.end();
  }

  fs.stat(fileName, (err, stats) => {
    if (err) {
      return pageNotFound();
    }

    if (stats.isDirectory()) {
      fileName += 'index.html';
    }

    fs.access(fileName, fs.R_OK, (err) => {
      if (err) {
        return pageNotFound();
      }

      const mimeType = mimeTypes[path.extname(fileName).split('.')[1]];
      const fileStream = fs.createReadStream(fileName);

      res.writeHead(200, {'Content-Type': mimeType});
      fileStream.pipe(res);
    });
  });
}).listen(8081);
