
let questionnaire;
let auth2;

async function loadQuestions() {

    // Get the questionnaire
    const id = window.location.pathname.split('/');
    const response = await fetch(`/api/get/${id[id.length - 1]}`);

    if(response.ok) {
        questionnaire = await response.json();
    }else{
        console.log('Error in loading');
        return;
    }

    const qlist = document.querySelector('#qlist');

    // Iterate over questions
    for(const q of questionnaire.questions)
        qlist.append(buildQuestion(q));

}

function buildQuestion(q) {

    // Line element will contain each question in its entirity
    const elem = document.createElement('li');
    elem.classList.add('question');
    elem.id = `${q.id}`;

    // Construct and add label for question
    const lbl = document.createElement('label');
    lbl.textContent = q.text;
    lbl.id = `${q.id}-q`;
    elem.append(lbl);

    // Construct the response here
    let input;
    let multi = false;
    switch(q.type) {
    case 'text':
    case 'number':

        input = document.createElement('input');
        input.for = lbl.id;
        input.type = q.type;

        break;

    case 'multi-select':
        multi = true;
    case 'single-select':

        // Create and populate a select element with the 
        // valid options
        input = document.createElement('select');
        input.for = lbl.id;
        if(multi) input.setAttribute('multiple', '');

        for(const opt of q.options) {
            const box = document.createElement('option');
            box.textContent = opt;
            box.value = opt;
            input.append(box);
        }

    }

    elem.append(input);
    // elem.addEventListener('input', update);

    return elem;

}

async function submit() {

    const payload = {};

    for(const q of questionnaire.questions) {

        let el;
        if(q.type === 'text' || q.type === 'number') {
            payload[q.id] = document.querySelector(`#${q.id} > input`).value;
        }else if(q.type === 'multi-select' || q.type === 'single-select') {
            const selected = document.querySelectorAll(`#${q.id} > select option:checked`);
            const arr = [];
            for(const item of selected)
                arr.unshift(item.label);

            // Chose unique delimeter unlikely to be present in natural text
            payload[q.id] = arr.join(';:-><');
        }

    }

    let headerVals = { 'Content-Type' : 'application/json' };
    if(auth2.isSignedIn.get()) {
        const token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
        headerVals['Authorization'] = `Bearer ${token}`;
    }

    const id = window.location.pathname.split('/');
    const res = await fetch(`/answer/${id[id.length - 1]}`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: headerVals
    });

    console.log(res.ok ? 'Done!' : 'Error!');

}

async function downloadResponses() {

    const id = window.location.pathname.split('/');
    const token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
    const res = await fetch(`/api/responses/${id[id.length - 1]}`, {
        method: 'GET',
        headers: { 'Content-Type' : 'application/json' , 'Authorization' : `Bearer ${token}`}
    });

    let payload;
    if(res.ok)
        payload = await res.blob()
    else {
        console.log('Error');
        return;
    }

    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(payload);;
    a.download = "responses.json";
    document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
    a.click();
    a.remove();

}

async function checkUserStatus() {
    const path = window.location.pathname.split('/');
    const id = path[path.length - 1];

    const qlist = document.querySelector('#qlist');

    const res = await fetch(`/api/owner/${id}`);

    let owner;
    if(res.ok) {
        owner = (await res.json()).owner;
        if(auth2.isSignedIn.get()) {
            let user = auth2.currentUser.get().getBasicProfile().getId();

            if(user === owner) {
                // Inserting button for user to download responses
                const btn = document.createElement('button');
                btn.textContent = "Download Responses";
                // btn.download = 'responses.json';
                // btn.href = `/api/responses/${id}`;

                btn.addEventListener('click', downloadResponses);
                qlist.parentNode.insertBefore(btn, qlist);
            }
        }

    }else {
        console.log('error');
    }
}

window.addEventListener('load', async () => {

    auth2 = gapi.auth2.init();

    await loadQuestions();
    document.querySelector('#submit').addEventListener('click', submit);

});

