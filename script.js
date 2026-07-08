document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("modal");
    const modalFrame = document.getElementById("modalFrame");
    const modalClose = document.getElementById("modalClose");
    const modalTitle = document.getElementById("modalTitle");
    const modalTabs = document.getElementById("modalTabs");
    const modalFallback = document.getElementById("modalFallback");

    

    // ===================================
    // KONFIGURACJA SEKCJI
    // ===================================

    const sections = {

        apps: {
            type: "tabs",
            title: "Chinese Astrology and Metaphysics",
            tabs: [
                { name: "I Ching", page: "ChineseAstrology/iching.html" },
                { name: "BaZi", page: "ChineseAstrology/bazi.html" },
                { name: "Feng Shui", page: "ChineseAstrology/fengshui.html" }
            ]
        },

        guild: {
            type: "tabs",
            title: "BeYokoHeart",
            tabs: [
                { name: "About BeYokoHeart", page: "AboutUs/about.html" },
                { name: "Yoko", page: "AboutUs/yoko.html" },
                { name: "Heart", page: "AboutUs/heart.html" },
                { name: "Guild", page: "AboutUs/guild.html" },
                
            ]
        },



        legal: {
            type: "tabs",
            title: "Conditions",
            tabs: [
                { name: "Rights", page: "legal/rights.html" },
                { name: "GDPR", page: "legal/gdpr.html" },
                { name: "Privacy Policy", page: "legal/privacypolicy.html" },
                { name: "Terms", page: "legal/terms.html" },  
                { name: "Interactive map", page: "legal/portal_map_world.html" },  
            ]
        },

        oracle: {
            type: "tabs",
            title: "BeYokoHeart oracle",
            tabs: [
                { name: "1 card", page: "OracleCardsBeYokoHeart/1card/oracle.html" },
                { name: "3 card", page: "OracleCardsBeYokoHeart/3cards/3cardsppf.html" },
                { name: "5 card", page: "OracleCardsBeYokoHeart/oracle.html" },
                { name: "7 card", page: "OracleCardsBeYokoHeart/oracle.html" },

            ]
        },

        contact: {
            type: "tabs",
            title: "Contact",
            tabs: [
                { name: "Contact", page: "contact/contact.html" },
                { name: "Media", page: "contact/media.html" },
            ]
        },

        quest: {
            type: "tabs",
            title: "Daily quest",
            tabs: [
                { name: "Daily quest", page: "dailyquest/dailyquest.html" },
            ]
        },

        mission: {
            type: "tabs",
            title: "OurMission",
            tabs: [
                { name: "OurMission", page: "mission/ourmission.html" },
                { name: "Have an influence", page: "mission/influence.html" },
            ]
        },

        patron: {
            type: "iframe",
            title: "Portal",
            page: "portal/main.html"
        }

        

    };

    // ===================================
    // skalowanie elementów na stronie + fullscreen
    // ===================================

    function scaleScene() {

        const stage = document.getElementById("mapStage");

        const scaleX = window.innerWidth / 1672;
        const scaleY = window.innerHeight / 941;

        const scale = Math.min(scaleX, scaleY);

        stage.style.transform = `scale(${scale})`;
    }

    window.addEventListener("resize", scaleScene);

    scaleScene();

    // ===================================
    // OTWIERANIE MODALA
    // ===================================

    document.querySelectorAll("[data-target]").forEach(flag => {

        flag.addEventListener("click", () => {

            const target = flag.dataset.target;

            // FULLSCREEN
            if (target === "fullscreen") {
                toggleFullscreen();
                return; 
            }

            // OBSŁUGA LINKU ZEWNĘTRZNEGO
            if (target === "about") {

                const url = flag.dataset.url;

                if (url) {
                    window.open(url, "_blank", "noopener,noreferrer");
                }

                return;
            }

            // MODALE
            const section = sections[target];

            if (!section) return;

            openModal(section);

        });

    });


    function openModal(section) {

    // 1. zabezpieczenie (najczęstszy crash)
    if (!section) {
        console.error("openModal: brak section");
        return;
    }

    // 2. otwarcie modala
    modal.classList.add("active");

    // 3. reset trybów (tabs/iframe)
    modal.classList.remove("mode-tabs", "mode-iframe");

    // 4. reset UI (BARDZO WAŻNE)
    modalTabs.innerHTML = "";
    modalFrame.src = "";
    modalFrame.style.display = "none";
    modalFallback.classList.remove("active");

    // 5. tytuł
    modalTitle.textContent = section.title || "";

    // 6. TABS MODE
    if (section.type === "tabs") {

        modal.classList.add("mode-tabs");

        modalFrame.style.display = "block";

        renderTabs(section.tabs);
        setTab(section.tabs[0]);

        return;
    }

    // 7. IFRAME MODE
    if (section.type === "iframe") {

        modal.classList.add("mode-iframe");

        renderIframeOnly(section);

        return;
    }

    console.warn("Unknown modal type:", section.type);
}
    
    // ===================================
    // 2 SYSTEM MODAL - CUSTOM
    // ===================================

    function renderIframeOnly(section) {

        // ukrywamy tabs
        modalTabs.innerHTML = "";

        // iframe zajmuje CAŁĄ przestrzeń
        modalFrame.style.display = "block";
        modalFrame.src = section.page;

        // fallback opcjonalnie
        modalFallback.classList.remove("active");

        modalFrame.style.opacity = "1";
        modalFrame.style.visibility = "visible";
    }

    // ===================================
    // RENDER ZAKŁADEK
    // ===================================

    function renderTabs(tabs) {

        modalTabs.innerHTML = "";

        tabs.forEach((tab, index) => {

            const btn = document.createElement("button");

            btn.classList.add("tab");

            if (index === 0) btn.classList.add("active");

            btn.textContent = tab.name;

            btn.addEventListener("click", () => {

                modalTabs.querySelectorAll(".tab")
                    .forEach(t => t.classList.remove("active"));

                btn.classList.add("active");

                setTab(tab);

            });

            modalTabs.appendChild(btn);

        });

    }

    // ===================================
    // ZMIANA ZAKŁADKI
    // ===================================

    function setTab(tab) {

        if (modalFallback) {
            modalFallback.classList.remove("active");
        }

        // 🔥 ukrywamy iframe od razu
        modalFrame.style.opacity = "0";
        modalFrame.style.visibility = "hidden";

        let loaded = false;

        modalFrame.onload = () => {

            loaded = true;

            try {

                const doc = modalFrame.contentDocument || modalFrame.contentWindow.document;

                if (!doc || doc.body.innerHTML.includes("Cannot GET")) {
                    throw new Error("Missing page");
                }

                if (modalFallback) {
                    modalFallback.classList.remove("active");
                }

                modalFrame.style.display = "block";

            } catch (e) {

                if (modalFallback) {
                    modalFallback.classList.add("active");
                }

                modalFrame.style.display = "none";
            }

            // pokazujemy dopiero gdy wiemy że OK
            modalFrame.style.opacity = "1";
            modalFrame.style.visibility = "visible";
        };

        modalFrame.src = tab.page;

        // fallback jeśli load nie nastąpi (bez błysku błędu)
        setTimeout(() => {

            if (!loaded) {

                if (modalFallback) {
                    modalFallback.classList.add("active");
                }

                modalFrame.style.display = "none";
            }

        }, 300);
    }

    // ===================================
    // ZAMYKANIE MODALA
    // ===================================

    function closeModal() {

    modal.classList.remove("active");

    modalFrame.src = "about:blank"; // 🔥 TO ZABIJA IFRAME

    modalTitle.textContent = "";
    modalTabs.innerHTML = "";

    if (modalFallback) {
        modalFallback.classList.remove("active");
    }
}
/*
    function closeModal() {

        modal.classList.remove("active");

        modalFrame.src = "";

        modalTitle.textContent = "";

        modalTabs.innerHTML = "";

        if (modalFallback) {
            modalFallback.classList.remove("active");
        }

    }*/

    modalClose.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
    

});