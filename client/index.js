const el = {};

async function submit() {

    // Construct a new form to be submitted
    const payload = new FormData();
    
    // Attach selected file
    const f = el.selectfile.files;
    if(f)
        payload.append('questionnaire', f[0]);

    // Send payload as POST
    const token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
    const res = await fetch('/api/questionnaires', {
        method: 'POST',
        body: payload,
        headers: { 'Authorization': 'Bearer ' + token} 
    });

    // TODO: Remove debug print
    console.log(res.ok ? 'Sent!' : 'Error!');
    await loadRecents(); // Update recents board

}

async function loadRecents() {

    const res = await fetch('/api/recents');

    let recents;
    if(res.ok) {
        recents = await res.json();
    }else return;

    const ol = document.querySelector('#recents');
    ol.innerHTML = ''; // Clear list
    console.log(recents);
    for(const q of recents) {

        const li = document.createElement('li');
        li.innerHTML = `<a href='/answer/${q.id}'>${q.name}</a>`;
        ol.append(li);

    }

}

window.addEventListener('load', async () => {

    // Convenient shorthand
    el.selectfile = document.querySelector("#select-file");
    el.submit = document.querySelector('#submit');
    el.submit.addEventListener('click', submit);
    await loadRecents();

});
