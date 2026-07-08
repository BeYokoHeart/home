const checkbox = document.getElementById('acceptRules');
const showBtn = document.getElementById('showEmailBtn');
const copyBtn = document.getElementById('copyEmailBtn');
const email = document.getElementById('email');
const copyMsg = document.getElementById('copyMsg');

let revealedEmail = "";

/* checkbox → odblokuj pokaż email */
checkbox.addEventListener('change', function () {
    showBtn.disabled = !this.checked;
});

/* pokaż email */
showBtn.addEventListener('click', function () {

    revealedEmail = 'beyokoheart6@gmail.com';
    email.textContent = revealedEmail;

    showBtn.disabled = true;
    checkbox.disabled = true;

    // aktywuj kopiowanie
    copyBtn.disabled = false;
});

/* kopiowanie emaila */
copyBtn.addEventListener('click', async function () {

    try {
        await navigator.clipboard.writeText(revealedEmail);

        // pokaż komunikat
        copyMsg.style.display = 'block';

        setTimeout(() => {
            copyMsg.style.display = 'none';
        }, 2000);

    } catch (err) {
        console.error('Copy error:', err);
    }
});

/* Conditions modal (iframe → parent) */
document.getElementById('openConditions').addEventListener('click', function () {

    const flagLegal = window.parent.document.querySelector('[data-target="legal"]');

    if (flagLegal) {
        flagLegal.click();
    }

});