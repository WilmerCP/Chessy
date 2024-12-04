let logo = document.getElementById('apptitle');

logo.addEventListener('click',(e)=>{

    window.location.href = '/';

});


let playButton = document.getElementById('random_match_button');

let textField = document.getElementById('name');

playButton.addEventListener('click',(e)=>{

    e.preventDefault();

    let name = textField.value;

    localStorage.setItem('username',name)

    if(name.length > 2){

        window.location.href = '/game'

    }

});

textField.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); 
      playButton.click();         // Trigger the button click programmatically
    }
  });