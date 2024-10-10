let logo = document.getElementById('apptitle');

logo.addEventListener('click',(e)=>{

    window.location.href = '/';

});


let playButton = document.getElementById('random_match_button');

playButton.addEventListener('click',(e)=>{

    e.preventDefault();

    let name = document.getElementById('name').value;

    localStorage.setItem('username',name)

    if(name.length > 2){

        window.location.href = '/game'

    }

});