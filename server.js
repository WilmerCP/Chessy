const http = require('http');
const { StringDecoder } = require('string_decoder');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');
const { Server } = require('socket.io');
const socketLogic = require('./lib/sockets');

let server = {}

server.serverHttp = http.createServer((req,res)=>{

    //Parse the url into an object, remove trailing / from pathname and bring to lower case
    let myUrl =  new URL('http://'+req.headers.host+req.url);
    myUrl.pathname = myUrl.pathname.replace(/\/+$/, '');
    myUrl.pathname = myUrl.pathname.toLowerCase();

    let method = req.method.toLowerCase();
    let headers = req.headers;

    let decoder =  new StringDecoder('utf-8');

    let buffer = '';

    req.on('data',(chunk)=>{

        buffer += decoder.write(chunk);

    });

    req.on('end',()=>{

        let datos = {

            'url': myUrl,
            'method': method,
            'headers': headers,
            'payload': helpers.convertToJSON(buffer),

        }

        let selectedHandler = typeof(server.router[myUrl.pathname]) !== 'undefined' ? server.router[myUrl.pathname] : server.router.notFound;

        selectedHandler = datos.url.pathname.includes('public') ? server.router.public : selectedHandler;
        selectedHandler = datos.url.pathname.includes('public/img') ? server.router.img : selectedHandler;
        selectedHandler = datos.url.pathname.includes('public/sound') ? server.router.sound : selectedHandler;

        selectedHandler(datos,(code,payload,type)=>{

            let contentType = typeof(type) == 'string' ? type : 'json';
            let payloadString = '';
            let statuscode = typeof(code) == 'number' ? code : 200;

            if(contentType == 'json'){

                res.setHeader('Content-Type','application/json');
                payload = typeof(payload) == 'object' ? payload : {};
                payloadString = JSON.stringify(payload);

            }

            if(contentType == 'favicon'){

                payloadString = typeof(payload) !== 'undefined' ? payload : '';
                res.setHeader('Content-Type','image/x-icon');

            }

            if(contentType == 'jpg'){

                payloadString = typeof(payload) !== 'undefined' ? payload : '';
                res.setHeader('Content-Type','image/jpeg');

            }

            if(contentType == 'png'){

                payloadString = typeof (payload) !== 'undefined' ? payload : '';
                res.setHeader('Content-Type', 'image/png');         
            }

            if(contentType == 'svg'){

                payloadString = typeof (payload) !== 'undefined' ? payload : '';
                res.setHeader('Content-Type', 'image/svg+xml');         
            }

            if(contentType == 'mp3'){

                payloadString = typeof (payload) !== 'undefined' ? payload : '';
                res.setHeader('Content-Type', 'audio/mpeg');         
            }

            if(contentType == 'html'){

                payloadString = typeof (payload) !== 'undefined' ? payload : '';
                res.setHeader('Content-Type', 'text/html');         
            }

            if(contentType == 'js'){

                payloadString = typeof (payload) !== 'undefined' ? payload : '';
                res.setHeader('Content-Type', 'application/javascript');         
            }

            if(contentType == 'css'){

                payloadString = typeof (payload) !== 'undefined' ? payload : '';
                res.setHeader('Content-Type', 'text/css');         
            }

            res.writeHead(statuscode);
            res.end(payloadString);

        });

    });


});

server.router = {

    '/': handlers.index,
    'notFound': handlers.notFound,
    'public': handlers.public,
    'img': handlers.img,
    'sound': handlers.sound,
    '/favicon.ico':handlers.favicon,
    '/game': handlers.game,
    '/api/newgame': handlers.newGame

}

server.io = new Server(server.serverHttp);

let port = typeof(process.env.PORT) != 'undefined' ? process.env.PORT : 3000; 

server.serverHttp.listen(port,()=>{

    console.log('\x1b[34m%s\x1b[0m','The server is listening on port '+port);

});

socketLogic.init(server.io);