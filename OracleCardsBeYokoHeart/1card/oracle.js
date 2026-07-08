let currentCardIndex = null;

const drawBtn = document.getElementById("drawBtn");

const cardImage = document.getElementById("cardImage");
const cardTitle = document.getElementById("cardTitle");
const cardNumber = document.getElementById("cardNumber");
const cardDescription = document.getElementById("cardDescription");

const catFinance = document.getElementById("catFinance");
const catWork = document.getElementById("catWork");
const catHealth = document.getElementById("catHealth");
const catLuck = document.getElementById("catLuck");
const catMood = document.getElementById("catMood");
const catRelations = document.getElementById("catRelations");

function getRandomCardIndex() {
    if (ORACLE_CARDS.length <= 1) return 0;

    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * ORACLE_CARDS.length);
    } while (newIndex === currentCardIndex);

    return newIndex;
}

function renderCard(card) {
    cardImage.src = card.image;
    cardTitle.textContent = card.title;
    cardNumber.textContent = "Card: " + card.id;
    cardDescription.textContent = card.description;

    catFinance.textContent = card.categories.finance;
    catWork.textContent = card.categories.work;
    catHealth.textContent = card.categories.health;
    catLuck.textContent = card.categories.luck;
    catMood.textContent = card.categories.mood;
    catRelations.textContent = card.categories.relations;
}

function showCard() {
    currentCardIndex = getRandomCardIndex();
    const card = ORACLE_CARDS[currentCardIndex];

    renderCard(card);

    // pokazuje opis (jeśli też był ukryty)
    document.getElementById("cardDescription").classList.remove("hidden");

    // 🔥 POKAZUJEMY KATEGORIE PO LOSOWANIU
    document.querySelector(".card-categories").classList.remove("hidden");

    // opcjonalny efekt fade
    cardImage.style.opacity = 0;
    setTimeout(() => {
        cardImage.style.opacity = 1;
    }, 50);
}

drawBtn.addEventListener("click", showCard);

const preview = document.getElementById("cardPreview");
const previewImg = document.getElementById("cardPreviewImg");
const container = document.querySelector(".oracle-container");

cardImage.addEventListener("mouseenter", () => {
    preview.style.display = "block";
    previewImg.src = cardImage.src;
});

cardImage.addEventListener("mousemove", () => {

    const rect = cardImage.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const previewWidth = preview.offsetWidth;
    const previewHeight = preview.offsetHeight;

    const gap = 15;

    const spaceRight = containerRect.right - rect.right;
    const spaceLeft = rect.left - containerRect.left;

    let left;

    // miejsce po prawej stronie miniaturki
    if (spaceRight > previewWidth + gap) {

        left =
            rect.right -
            containerRect.left +
            gap + 40; // oddalenie w prawo o 40 px

    }
    // miejsce po lewej stronie miniaturki
    else if (spaceLeft > previewWidth + gap) {

        left =
            rect.left -
            containerRect.left -
            previewWidth -
            gap;

    }
    // brak miejsca -> środek modala
    else {

        left =
            (containerRect.width - previewWidth) / 2;

    }

    let top =
        rect.top -
        containerRect.top +
        rect.height / 2 -
        previewHeight / 2 - 120; // przesunięcie do góry o 70 px

    // zabezpieczenie góra
    if (top < 10) {
        top = 10;
    }

    // zabezpieczenie dół
    if (top + previewHeight > containerRect.height - 10) {
        top = containerRect.height - previewHeight - 10;
    }

    preview.style.left = left + "px";
    preview.style.top = top + "px";

});

cardImage.addEventListener("mouseleave", () => {
    preview.style.display = "none";
});


/*
const preview = document.getElementById("cardPreview");
const previewImg = document.getElementById("cardPreviewImg");

cardImage.addEventListener("mouseenter", () => {
    preview.style.display = "block";
    previewImg.src = cardImage.src;
});

cardImage.addEventListener("mousemove", (e) => {

    const rect = cardImage.getBoundingClientRect();

    const previewWidth = 180;
    const gap = 15;

    let left;

    if (window.innerWidth - rect.right > previewWidth + gap) {
        left = rect.right + gap;
    } else {
        left = rect.left - previewWidth - gap;
    }

    const top = rect.top + rect.height / 2 - 70;

    preview.style.left = left + "px";
    preview.style.top = top + "px";

});

cardImage.addEventListener("mouseleave", () => {
    preview.style.display = "none";
});


*/