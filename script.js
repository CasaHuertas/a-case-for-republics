// The Definitive and Final script.js

// --- Global Data ---
const navHouses = ["Bourbon", "Habsburg", "Habsburg Lorraine", "Hanover", "Hohenzollern", "Stuart", "Tudor", "Windsor"];


// --- Core Functions ---

/**
 * Main function to fetch data and render all content on the page.
 */
async function initializeWebsite() {
    const mainContainer = document.querySelector('.main-container');
    const navBar = document.querySelector('.navigation-bar');
    
    // --- 1. Create Navigation Buttons ---
    const navButtonContainer = document.createElement('div');
    navButtonContainer.classList.add('nav-button-container');
    navHouses.forEach(houseName => {
        const button = document.createElement('button');
        button.classList.add('nav-button');
        button.textContent = houseName.toUpperCase();
        button.addEventListener('click', () => {
            const targetHouseBlock = document.querySelector(`[data-house-name-target="${houseName.toLowerCase().replace(/[^a-z0-9]/g, '')}"]`);
            if (targetHouseBlock) {
                targetHouseBlock.scrollIntoView({ behavior: 'smooth' });
            }
        });
        navButtonContainer.appendChild(button);
    });
    navBar.appendChild(navButtonContainer);

    // --- 2. Load and Render Monarch Data ---
    const monarchsData = await fetch('monarchs.json').then(response => response.json()).catch(error => { console.error("Error loading monarchs.json:", error); return []; });
    console.log("Monarchs data loaded:", monarchsData.length, "monarchs");

    const isMobile = window.matchMedia("(max-width: 1024px)").matches; // Use the wider breakpoint

    const monarchsByDisplayHouse = {};
    monarchsData.forEach(monarch => {
        let displayHouseName = '';
        if (monarch.house.startsWith('Bourbon')) { displayHouseName = 'Bourbon'; }
        else if (monarch.house.startsWith('Habsburg')) { displayHouseName = 'Habsburg'; }
        else if (monarch.house === 'Habsburg-Lorraine') { displayHouseName = 'Habsburg Lorraine'; }
        else { displayHouseName = monarch.house; }
        if (!monarchsByDisplayHouse[displayHouseName]) {
            monarchsByDisplayHouse[displayHouseName] = [];
        }
        monarchsByDisplayHouse[displayHouseName].push(monarch);
    });

    const renderingPromises = [];
    navHouses.forEach((houseName, index) => {
        const houseMonarchs = monarchsByDisplayHouse[houseName] || [];
        if (houseMonarchs.length > 0) {
            const housePromise = new Promise((resolve) => {
                const houseBlock = document.createElement('div');
                houseBlock.classList.add('house-block');
                houseBlock.dataset.houseNameTarget = houseName.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (index === 0) { houseBlock.classList.add('is-visible'); }

                const houseTitle = document.createElement('h3');
                houseTitle.classList.add('house-title');
                houseTitle.textContent = `${String(index + 1).padStart(2, '0')}. House of ${houseName.split(' ').map(word => {
                    const lowercaseWords = ['of', 'and', 'the', 'de', 'd\'', 'du', 'des', 'dos', 'da', 'das', 'dei', 'del'];
                    return lowercaseWords.includes(word.toLowerCase()) ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1);
                }).join(' ')}`;
                houseBlock.appendChild(houseTitle);
                mainContainer.appendChild(houseBlock);

                const monarchsGridContainer = document.createElement('div');
                monarchsGridContainer.classList.add('monarchs-grid');
                mainContainer.appendChild(monarchsGridContainer);

                // Always build the two-column DOM structure. CSS will handle stacking on mobile.
                const leftColumn = document.createElement('div');
                leftColumn.classList.add('monarch-column');
                monarchsGridContainer.appendChild(leftColumn);
                const rightColumn = document.createElement('div');
                rightColumn.classList.add('monarch-column');
                monarchsGridContainer.appendChild(rightColumn);

                let currentMonarchIndex = 0;
                const appendNextMonarch = () => {
                    if (currentMonarchIndex < houseMonarchs.length) {
                        const monarch = houseMonarchs[currentMonarchIndex];
                        const monarchBlock = createMonarchBlock(monarch, houseName);
                        // Pre-load first one (mobile) or two (desktop) blocks of the first house
                        if (index === 0) {
                           if (isMobile ? (currentMonarchIndex === 0) : (currentMonarchIndex <= 1)) {
                               monarchBlock.classList.add('is-visible');
                           }
                        }
                        setTimeout(() => {
                            requestAnimationFrame(() => {
                                if (leftColumn.offsetHeight <= rightColumn.offsetHeight) { leftColumn.appendChild(monarchBlock); }
                                else { rightColumn.appendChild(monarchBlock); }
                                currentMonarchIndex++;
                                appendNextMonarch();
                            });
                        }, 50);
                    } else {
                        resolve();
                    }
                };
                appendNextMonarch();
            });
            renderingPromises.push(housePromise);
        }
    });

    await Promise.all(renderingPromises);
    
    // --- 3. Setup Intersection Observer for Animations (THE FULL, CORRECT CODE) ---
    console.log("All content rendered. Setting up IntersectionObserver.");
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                target.classList.add('is-visible');
                if (target.classList.contains('monarch-block')) {
                    const rate = parseFloat(target.dataset.inbreedingRate);
                    const crestTopStroke = target.querySelector('.crest-top-stroke');
                    const rateNumberElement = target.querySelector('.crest-rate-number');
                    if (crestTopStroke && rateNumberElement) {
                        const zeroPercentOffset = 391.0;
                        const fiftyPercentOffset = 195.5;
                        const oneHundredPercentOffset = 0.0;
                        let offset;
                        if (rate <= 50) {
                            offset = mapRange(rate, 0, 50, zeroPercentOffset, fiftyPercentOffset);
                        } else {
                            offset = mapRange(rate, 50, 100, fiftyPercentOffset, oneHundredPercentOffset);
                        }
                        crestTopStroke.style.strokeDashoffset = offset;
                        if (rate === 0) {
                            crestTopStroke.style.opacity = '0';
                        }
                        setTimeout(() => {
                             animateNumber(rateNumberElement, rate, 900);
                        }, 400);
                    }
                }
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.house-block:not(.is-visible)').forEach(block => observer.observe(block));
    document.querySelectorAll('.monarch-block:not(.is-visible)').forEach(block => observer.observe(block));
}


// --- Helper Functions ---


/**
 * Animates a number counting up linearly.
 */
function animateNumber(element, finalValue, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        // Calculate linear progress (0 to 1) without any easing.
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Calculate the current number based on the direct progress.
        const currentNumber = progress * finalValue;

        element.textContent = finalValue % 1 === 0 ? Math.floor(currentNumber) : currentNumber.toFixed(1);

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = finalValue % 1 === 0 ? finalValue.toFixed(0) : finalValue.toFixed(1);
        }
    };
    window.requestAnimationFrame(step);
}

/**
 * Maps a number from one range to another.
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}


// --- Event Listeners ---

// Initialize the entire website when the DOM is ready.
document.addEventListener('DOMContentLoaded', initializeWebsite);

// Handle all scroll-based animations for the masthead.
window.addEventListener('scroll', () => {
    // First, check if we're on a desktop-sized screen.
    const isDesktop = window.matchMedia("(min-width: 769px)").matches;
    if (!isDesktop) {
        // If we're on mobile or tablet, do nothing.
        return;
    }

    const mastheadBlock = document.querySelector('.masthead-block');
    const mastheadTitle = document.querySelector('.masthead-title');
    const mastheadSubtitle = document.querySelector('.masthead-subtitle');

    if (!mastheadBlock || !mastheadTitle) return;

    const scrollY = window.scrollY;

    // --- Text Fade Logic ---
    const fadeEndPosition = 115;
    const fadeTravelDistance = 200;
    const titleTop = mastheadTitle.getBoundingClientRect().top;
    const titleFadeStart = fadeEndPosition + fadeTravelDistance;
    const titleProgress = (titleFadeStart - titleTop) / fadeTravelDistance;
    const titleOpacity = 1 - Math.max(0, Math.min(titleProgress, 1));
    mastheadTitle.style.opacity = titleOpacity;
    const subtitleTop = mastheadSubtitle.getBoundingClientRect().top;
    const subtitleFadeStart = fadeEndPosition + fadeTravelDistance;
    const subtitleProgress = (subtitleFadeStart - subtitleTop) / fadeTravelDistance;
    const subtitleOpacity = 1 - Math.max(0, Math.min(subtitleProgress, 1));
    mastheadSubtitle.style.opacity = subtitleOpacity;

    // --- Masthead Fixing Logic ---
    const fixTriggerPoint = 740 - 115; // 625px
    if (scrollY >= fixTriggerPoint) {
        mastheadBlock.classList.add('is-fixed-to-top');
    } else {
        mastheadBlock.classList.remove('is-fixed-to-top');
    }
});