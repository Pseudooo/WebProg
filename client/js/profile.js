let auth2;

async function loadQuestionnaires() {

    const list = document.querySelector('#questionnaires');
    list.innerHTML = ''; // Clear

    if(!auth2.isSignedIn.get()) {
        // Not signed in
        const li = document.createElement('li');
        li.textContent = 'Please sign in!';
        list.append(li);
        return;
    }

    const token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
    const res = await fetch('/api/questionnaires', {
        method: 'GET',
        headers: { 'Authorization' : `Bearer ${token}` } 
    });

    let payload;
    if(res.ok)
        payload = await res.json();
    else {
        console.log('Error?');
    }

    for(const q of payload) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="/answer/${q.id}">${q.name}</a>`;
        list.append(li);
    }

    if(list.innerHTML === '') {
        const li = document.createElement('li');
        li.textContent = "You have no Questionnaires!";
        list.append(li);
    }

    console.log('Loaded!');

}

window.addEventListener('load', async () => {
    auth2 = gapi.auth2.init();
    await loadQuestionnaires();
});