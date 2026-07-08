let stage = 0; // 0 past, 1 present, 2 future
let usedCards = [];
let selectedCards = {
    past: null,
    present: null,
    future: null
};

const backImage = "../../images/oracle/back.jpg";

function getRandomCard() {
    const available = ORACLE_CARDS.filter(c => !usedCards.includes(c.id));
    if (available.length === 0) return null;

    const index = Math.floor(Math.random() * available.length);
    const card = available[index];
    usedCards.push(card.id);
    return card;
}

function drawCard() {
    if (stage > 2) return;

    const card = getRandomCard();
    if (!card) return;

    let slot;

    if (stage === 0) slot = "past";
    if (stage === 1) slot = "present";
    if (stage === 2) slot = "future";

    selectedCards[slot] = card;

    const img = document.getElementById(`${slot}-img`);
    img.src = card.image;
    img.classList.add("card-front");

    stage++;

    if (stage > 2) {
        document.getElementById("drawBtn").disabled = true;
        document.getElementById("showBtn").style.display = "inline-block";
    }
}

function showResult() {
    ["past", "present", "future"].forEach(type => {
        const card = selectedCards[type];
        const box = document.getElementById(`${type}-result`);

        box.innerHTML = `
            <div class="card-title"> ${card.title} </div>
            <div class="card-number"> Card: ${card.id}</div>
            <div class="result-box">${card[type]}</div> 
        `;
    });
}

function resetGame() {
    stage = 0;
    usedCards = [];
    selectedCards = {
        past: null,
        present: null,
        future: null
    };

    ["past", "present", "future"].forEach(type => {
        document.getElementById(`${type}-img`).src = backImage;
        document.getElementById(`${type}-result`).innerHTML = "";
    });

    document.getElementById("drawBtn").disabled = false;
    document.getElementById("showBtn").style.display = "none";
}

document.addEventListener("contextmenu", (e) => {
    if (e.target.tagName === "IMG") {
        e.preventDefault();
    }
});

document.addEventListener("dragstart", (e) => {
    if (e.target.tagName === "IMG") {
        e.preventDefault();
    }
});

const preview = document.getElementById("cardPreview");
const previewImg = document.getElementById("cardPreviewImg");

if (preview && previewImg) {
    const cards = document.querySelectorAll(".oracle-table img");

    cards.forEach(card => {

        card.addEventListener("mouseenter", (e) => {
            preview.classList.remove("hidden");
            previewImg.src = e.target.src;
        });

        card.addEventListener("mousemove", (e) => {
            const rect = e.target.getBoundingClientRect();

            const previewWidth = preview.offsetWidth;
            const gap = 15;

            const spaceRight = window.innerWidth - rect.right;
            const spaceLeft = rect.left;

            let left;

            // 👉 jeśli jest miejsce po prawej
            if (spaceRight > previewWidth + gap) {
                left = rect.right + window.scrollX + gap;
                preview.style.transform = "translateY(-50%)";
            } 
            // 👉 jeśli nie ma miejsca → lewa strona
            else if (spaceLeft > previewWidth + gap) {
                left = rect.left + window.scrollX - previewWidth - gap;
                preview.style.transform = "translateY(-50%)";
            } 
            // 👉 fallback (jak bardzo ciasno)
            else {
                left = rect.left + window.scrollX;
                preview.style.transform = "translate(-50%, -110%)";
            }

            const top = rect.top + window.scrollY + rect.height / 2 - 70; // podniesienie o 70 px do góry

            preview.style.left = left + "px";
            preview.style.top = top + "px";
        });

        card.addEventListener("mouseleave", () => {
            preview.classList.add("hidden");
        });

    });
}