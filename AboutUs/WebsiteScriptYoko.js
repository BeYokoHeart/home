const button = document.getElementById("toggleYokoPdf");
const container = document.getElementById("YokoPdfContainer");
const image = document.getElementById("YokoPdfImage");

let pdfLoaded = false;

button.addEventListener("click", function () {

    if (container.style.maxHeight) {

        container.style.maxHeight = null;
        button.textContent = "Expand";

    } else {

        if (!pdfLoaded) {

            image.src = "../images/pdf/Yoko18072026.jpg";

            image.onload = function () {
                container.style.maxHeight = image.offsetHeight + 50 + "px";
            };

            pdfLoaded = true;

        } else {

            container.style.maxHeight = image.offsetHeight + 50 + "px";

        }

        button.textContent = "Collapse";
    }

});
