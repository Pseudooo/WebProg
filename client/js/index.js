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
        headers: { 'Authorization' : `Bearer ${token}` } 
    });

    // TODO: Remove debug print
    console.log(res.ok ? 'Sent!' : 'Error!');
    await loadRecents(); // Update recents board

    el.selectfile.value = null;

}

async function loadRecents() {

    const res = await fetch('/api/recents');

    let recents;
    if(res.ok) {
        recents = await res.json();
    }else return;

    const ol = document.querySelector('#recents');
    ol.innerHTML = ''; // Clear list
    for(const q of recents) {

        const li = document.createElement('li');
        li.innerHTML = `<button href='/answer/${q.id}'>${q.name}</button>`;
        ol.append(li);

    }

    if(recents === []) {

        const li = document.createElement('li');
        li.textContent = "There are no questionnaires yet!";
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
