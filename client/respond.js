
async function loadQuestions() {

    // Get the questionnaire
    const id = window.location.pathname.split('/');
    const response = await fetch(`/api/get/${id[id.length - 1]}`);

    let payload;
    if(response.ok) {
        payload = await response.json();
    }else{
        console.log('Error in loading');
        return;
    }

    const qlist = document.querySelector('#qlist');

    // Iterate over questions
    for(const q of payload.questions)
        qlist.append(buildQuestion(q));
}

function buildQuestion(q) {

    const elem = document.createElement('li');
    elem.classList.add('question');
    elem.id = `${q.id}-container`;

    const lbl = document.createElement('label');
    lbl.textContent = q.text;
    lbl.id = `${q.id}-q`;
    elem.append(lbl);

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

        input = document.createElement('select');
        input.for = lbl.id;
        input.mutiple = multi;

        for(const opt of q.options) {
            const box = document.createElement('option');
            box.textContent = opt;
            box.value = opt;
            input.append(box);
        }

        break;
    }
    elem.append(input);

    return elem;

}

window.addEventListener('load', async () => {

    await loadQuestions();

});

