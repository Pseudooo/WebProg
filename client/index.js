const el = {};

async function submit() {

    // Construct a new form to be submitted
    const payload = new FormData();
    
    // Attach selected file
    const f = el.selectfile.files;
    if(f)
        payload.append('questionnaire', f[0]);

    // Send payload as POST 
    const res = await fetch('questionnaires', {
        method: 'POST',
        body: payload
    });

    console.log(res.ok ? 'Sent!' : 'Error!');

}

window.addEventListener('load', () => {

    el.selectfile = document.querySelector("#select-file");
    el.submit = document.querySelector('#submit');
    el.submit.addEventListener('click', submit);

})
