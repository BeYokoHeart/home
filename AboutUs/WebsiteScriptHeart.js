
const button = document.getElementById("toggleHeartPdf");
const container = document.getElementById("HeartPdfContainer");
const image = document.getElementById("HeartPdfImage");

let pdfLoaded = false;

button.addEventListener("click", function () {

    if (container.style.maxHeight) {

        container.style.maxHeight = null;
        button.textContent = "Expand";

    } else {

        if (!pdfLoaded) {

            image.src = "../images/pdf/Heart.jpg";

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
