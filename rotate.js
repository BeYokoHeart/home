document.addEventListener("DOMContentLoaded", () => {

    const overlay = document.getElementById("rotate-overlay");
    const btnContinue = document.getElementById("rotate-continue");
    const btnReset = document.getElementById("rotate-reset");

    // zabezpieczenie (ważne w większych aplikacjach)
    if (!overlay || !btnContinue) return;

    // tylko w RAM (reset po refreshu)
    let dismissed = false;
    let permanentlyHidden = false;

    function isMobileLike() {
        return window.innerWidth <= 1024;
    }

    function isPortrait() {
        return window.matchMedia("(orientation: portrait)").matches;
    }

    function shouldShow() {
        return (
            !dismissed &&
            !permanentlyHidden &&
            isMobileLike() &&
            isPortrait()
        );
    }

    function show() {
        overlay.classList.add("show");
        document.body.style.overflow = "hidden";
    }

    function hide() {
        overlay.classList.remove("show");
        document.body.style.overflow = "";
    }

    function check() {
        if (shouldShow()) show();
        else hide();
    }

    // start
    check();

    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);

    // ======================================
    // PRZYCISK 1: kontynuuj (tymczasowo)
    // ======================================
    btnContinue.addEventListener("click", () => {
        dismissed = true;
        hide();
    });

    // ======================================
    // PRZYCISK 2: nie pokazuj ponownie (do końca sesji)
    // ======================================
    if (btnReset) {
        btnReset.addEventListener("click", () => {
            permanentlyHidden = true;
            hide();
        });
    }

});