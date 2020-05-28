
let questionnaire;

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

            payload[q.id] = arr.join(',');
        }

    }

    const id = window.location.pathname.split('/');
    const res = await fetch(`/answer/${id[id.length - 1]}`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type' : 'application/json' }
    });

    console.log(res.ok ? 'Done!' : 'Error!');


}

window.addEventListener('load', async () => {

    await loadQuestions();
    document.querySelector('#submit').addEventListener('click', submit);

});

