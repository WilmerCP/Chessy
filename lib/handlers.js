const helpers = require('./helpers');

let handlers = {}

//Serving the Main page
handlers.index = function(datos,callback){

    helpers.getTemplate('index')
    .then((file)=>{

        callback(200,file,'html');

    }).catch((error)=>{

        callback(500,{'error':error});

    });

}

//Serving the Game page
handlers.game = function(datos,callback){

    helpers.getTemplate('game')
    .then((file)=>{

        callback(200,file,'html');

    }).catch((error)=>{

        callback(500,{'error':error});

    });

}

//Serving static files
handlers.public = function(datos,callback){

    let filename = datos.url.pathname.replace('/public/','');
    
    let type = null;

    if(filename.includes('css')){

        type = 'css';

    }else if(filename.includes('js')){

        type = 'js';

    }

    if(typeof(type) == 'null'){

        callback(404);

    }

    helpers.getAsset(filename)
    .then((file)=>{

        callback(200,file,type);

    }).catch((error)=>{

        callback(500,{'error':error});

    });

}

//Serving images
handlers.img = function(datos,callback){

    let filename = datos.url.pathname.replace('/public/img/','');
    
    let type = null;

    if(filename.includes('svg')){

        type = 'svg';

    }else if(filename.includes('jpg')){

        type = 'jpg';

    }else if(filename.includes('png')){

        type = 'png';

    }

    if(typeof(type) == 'null'){

        callback(404);

    }

    helpers.getImage(filename)
    .then((file)=>{

        callback(200,file,type);

    }).catch((error)=>{

        callback(500,{'error':error});

    });

}

//Serving favicon
handlers.favicon = function(datos,callback){

    let filename = 'favicon.ico';

    helpers.getImage(filename)
    .then((file)=>{

        callback(200,file,'favicon');

    }).catch((error)=>{

        callback(500,{'error':error});

    });

}

//404 Handler
handlers.notFound = function(datos,callback){

    callback(404,{'error': 'The url you requested does not exist'});

}


module.exports = handlers;