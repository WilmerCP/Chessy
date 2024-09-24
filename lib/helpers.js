const fs = require('fs/promises');
const path = require('path');
let helpers = {}

helpers.convertToJSON = function(text){

    try {
        
        let myJson = JSON.parse(text);

        return myJson;

    } catch (error) {

        return {};
        
    }

}

//Note: lru-cache library can be used to store files in cache and improve performance
helpers.getTemplate = async function(filename){

    let filepath = path.join(__dirname,'..','/public/',filename+'.html');

    try{

        let text = fs.readFile(filepath);

        return text;

    }catch(error){

        return 'There was an error while reading the html file';

    }

}


helpers.getAsset = async function(filename){

    let filepath = path.join(__dirname,'..','/public/',filename);

    try{

        let text = fs.readFile(filepath);

        return text;

    }catch(error){

        return 'There was an error while reading the file';

    }

}

helpers.getImage = async function(filename){

    let filepath = path.join(__dirname,'..','/public/','/img/',filename);

    try{

        let text = fs.readFile(filepath);

        return text;

    }catch(error){

        return 'There was an error while reading the file';

    }

}

module.exports = helpers;