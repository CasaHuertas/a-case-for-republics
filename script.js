// The Definitive and Final script.js

// --- Global Data ---
const navHouses = ["Bourbon", "Habsburg", "Habsburg Lorraine", "Hanover", "Hohenzollern", "Stuart", "Tudor", "Windsor"];


// --- Core Functions ---

/**
 * Creates the HTML for a single Monarch Block.
 */
function createMonarchBlock(monarch, displayHouseName) {
    const monarchBlock = document.createElement('div');
    monarchBlock.classList.add('monarch-block');
    monarchBlock.dataset.id = monarch.id;
    monarchBlock.dataset.inbreedingRate = monarch.inbreeding_rate;

    // --- Top Section: Name, Nickname, etc. ---
    const monarchHeaderTop = document.createElement('div');
    monarchHeaderTop.classList.add('monarch-header-top-section');
    
    const houseNameElement = document.createElement('p');
    houseNameElement.classList.add('house-name-text');
    houseNameElement.textContent = `House of ${displayHouseName.split(' ').map(word => {
        const lowercaseWords = ['of', 'and', 'the', 'de', 'd\'', 'du', 'des', 'dos', 'da', 'das', 'dei', 'del'];
        return lowercaseWords.includes(word.toLowerCase()) ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ')}`;
    monarchHeaderTop.appendChild(houseNameElement);

    const monarchNameElement = document.createElement('h2');
    monarchNameElement.classList.add('monarch-name-text');
    monarchNameElement.textContent = monarch.name.split(' ').map(word => {
        if (word.match(/^(i{1,3}|iv|v|vi{1,3}|ix|x)$/i)) { return word.toUpperCase(); }
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
    monarchHeaderTop.appendChild(monarchNameElement);

    const nicknameYearsElement = document.createElement('p');
    nicknameYearsElement.classList.add('nickname-years-text');
    const yearsText = `(${monarch.birth_year}–${monarch.death_year || 'Present'})`;
    if (monarch.nickname) {
        const formattedNickname = monarch.nickname.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        nicknameYearsElement.textContent = `${formattedNickname}, ${yearsText}`;
    } else {
        nicknameYearsElement.textContent = yearsText;
    }
    monarchHeaderTop.appendChild(nicknameYearsElement);
    monarchBlock.appendChild(monarchHeaderTop);

    // --- Visuals and Titles Section ---
    const monarchVisualsAndTitles = document.createElement('div');
    monarchVisualsAndTitles.classList.add('monarch-visual-and-titles-wrapper');

    const portraitImg = document.createElement('img');
    portraitImg.classList.add('monarch-portrait-placeholder');
    portraitImg.src = `images/portraits/${monarch.id}.jpg`;
    portraitImg.srcset = `images/portraits/${monarch.id}.jpg 1x, images/portraits/${monarch.id}@2x.jpg 2x`;
    portraitImg.alt = `Portrait of ${monarch.name}`;
    portraitImg.width = 140;
    portraitImg.height = 100;
    monarchVisualsAndTitles.appendChild(portraitImg);
    const titlesElement = document.createElement('p');
    titlesElement.classList.add('titles-text');
    titlesElement.textContent = `${monarch.titles.toUpperCase()} (${monarch.reign_years})`;
    monarchVisualsAndTitles.appendChild(titlesElement);
    monarchBlock.appendChild(monarchVisualsAndTitles);
    
    // --- Inbreeding Crest ---
    const inbreedingCrestContainer = document.createElement('div');
    inbreedingCrestContainer.classList.add('inbreeding-crest-container');
    inbreedingCrestContainer.innerHTML = `
        <svg viewBox="0 0 129 146">
            <path class="crest-bottom-stroke" d="M65,7.08C33.93,7.08,7.86,30.55,7.86,30.55c0,0-8.47,88.86,57.14,108.37,65.62-19.51,57.14-108.37,57.14-108.37,0,0-26.07-23.47-57.14-23.47"/>
            <path class="crest-top-stroke" d="M65,7.08C33.93,7.08,7.86,30.55,7.86,30.55c0,0-8.47,88.86,57.14,108.37,65.62-19.51,57.14-108.37,57.14-108.37,0,0-26.07-23.47-57.14-23.47"/>
        </svg>
        <div class="crest-text-overlay">
            <span class="crest-text-label">Inbreeding</span>
            <span class="crest-rate-number">0</span>
            <span class="crest-text-label">Rate</span>
        </div>
    `;
    monarchBlock.appendChild(inbreedingCrestContainer);

    // --- Bottom Section (Parents/Spouses/Children) ---
    const monarchBottomSections = document.createElement('div');
    monarchBottomSections.classList.add('monarch-bottom-sections');

    // --- NEW: Conditional Logic for Parents Section ---
    if (monarch.inbreeding_rate > 0 && monarch.inbreeding_explanation) {
        // If there's an explanation, show it
        const explanationPara = document.createElement('p');
        explanationPara.classList.add('inbreeding-explanation-text');
        explanationPara.textContent = monarch.inbreeding_explanation;
        monarchBottomSections.appendChild(explanationPara);
    } else {
        // Otherwise, show the original "Son of" section
        const parentsHeading = document.createElement('p');
        parentsHeading.classList.add('section-heading');
        parentsHeading.textContent = 'Son of';
        monarchBottomSections.appendChild(parentsHeading);
        const parentsList = document.createElement('ul');
        parentsList.classList.add('section-list');
        parentsList.innerHTML = `
            <li>${monarch.parents.father.name}, ${monarch.parents.father.title || ''} (House of ${monarch.parents.father.house})</li>
            <li>${monarch.parents.mother.name}, ${monarch.parents.mother.title || ''} (House of ${monarch.parents.mother.house})</li>
        `;
        monarchBottomSections.appendChild(parentsList);
    }
    // --- End of Conditional Logic ---

    const spousesHeading = document.createElement('p');
    spousesHeading.classList.add('section-heading');
    spousesHeading.textContent = 'Married to';
    monarchBottomSections.appendChild(spousesHeading);
    const spousesList = document.createElement('ul');
    spousesList.classList.add('section-list');
    if (monarch.spouses === "Never Married") {
        spousesList.innerHTML = `<li>Never Married</li>`;
    } else {
        spousesList.innerHTML = monarch.spouses.map(spouse => `
            <li>
                ${spouse.name}, ${spouse.birth_title ? spouse.birth_title + ' ' : ''}(House of ${spouse.house || ''}),
                <br>daughter of
                <ul class="section-list" style="padding-left: 20px;">
                    <li>${spouse.parents.father.name}, ${spouse.parents.father.title || ''} (House of ${spouse.parents.father.house || ''})</li>
                    <li>${spouse.parents.mother.name}, ${spouse.parents.mother.title || ''} (House of ${spouse.parents.mother.house || ''})</li>
                </ul>
            </li>
        `).join('');
    }
    monarchBottomSections.appendChild(spousesList);

    const childrenHeading = document.createElement('p');
    childrenHeading.classList.add('section-heading');
    childrenHeading.textContent = 'Children:';
    monarchBottomSections.appendChild(childrenHeading);
    const childrenList = document.createElement('ul');
    childrenList.classList.add('section-list');
    if (monarch.children.length === 0) {
        childrenList.innerHTML = `<li>N/A</li>`;
    } else {
        childrenList.innerHTML = monarch.children.map(child => `
            <li>${child.name}, ${child.title}</li>
        `).join('');
    }
    monarchBottomSections.appendChild(childrenList);
    monarchBlock.appendChild(monarchBottomSections);

    return monarchBlock;
}


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
    const monarchsData = await fetch('monarchs.json').then(response => response.json())
        .catch(error => {
            console.error("Error loading monarchs.json:", error);
            return [];
        });

    console.log("Monarchs data loaded:", monarchsData.length, "monarchs");
    
    // Check for mobile/tablet view based on our new breakpoint.
    const isMobileView = window.matchMedia("(max-width: 1024px)").matches;

    const monarchsByDisplayHouse = {};
    monarchsData.forEach(monarch => {
        let displayHouseName = '';
        if (monarch.house.startsWith('Bourbon')) { displayHouseName = 'Bourbon'; }
        else if (monarch.house === 'Habsburg-Lorraine') { displayHouseName = 'Habsburg Lorraine'; }
        else if (monarch.house.startsWith('Habsburg')) { displayHouseName = 'Habsburg'; }
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
                if (index === 0) {
                    houseBlock.classList.add('is-visible');
                }

                const houseTitle = document.createElement('h3');
                houseTitle.classList.add('house-title');
                houseTitle.textContent = `${String(index + 1).padStart(2, '0')}. House of ${houseName.split(' ').map(word => {
                    const lowercaseWords = ['of', 'and', 'the', 'de', 'd\'', 'du', 'des', 'dos', 'da', 'das', 'dei', 'del'];
                    return lowercaseWords.includes(word.toLowerCase()) ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1);
                }).join(' ')}`;
                houseBlock.appendChild(houseTitle);
                mainContainer.appendChild(houseBlock);

                if (isMobileView) {
                    // --- MOBILE/TABLET PATH: Single Column ---
                	const monarchsGridContainer = document.createElement('div');
                	monarchsGridContainer.classList.add('monarchs-grid');
                	mainContainer.appendChild(monarchsGridContainer);

                    const singleColumn = document.createElement('div');
                    singleColumn.classList.add('monarch-column');
                    monarchsGridContainer.appendChild(singleColumn);

                	let currentMonarchIndex = 0;
                	const appendNextMonarch = () => {
                    	if (currentMonarchIndex < houseMonarchs.length) {
                        	const monarch = houseMonarchs[currentMonarchIndex];
                        	const monarchBlock = createMonarchBlock(monarch, houseName);
                        	if (index === 0) {
                            	const shouldBeVisible = (currentMonarchIndex === 0);
                            	if (shouldBeVisible) {
                                	monarchBlock.classList.add('is-visible');
                            	}
                        	}
                        	setTimeout(() => {
                            	requestAnimationFrame(() => {
                                	singleColumn.appendChild(monarchBlock);
                                	currentMonarchIndex++;
                                	appendNextMonarch();
                            	});
                        	}, 50);
                    	} else {
                        	resolve();
                    	}
                	};
                	appendNextMonarch();

                } else {
                    // --- DESKTOP PATH: Two-Column Masonry (Original Logic) ---
                	const monarchsGridContainer = document.createElement('div');
                	monarchsGridContainer.classList.add('monarchs-grid');
                	mainContainer.appendChild(monarchsGridContainer);

                	const leftColumn = document.createElement('div');
                	leftColumn.classList.add('monarch-column', 'left-column');
                	monarchsGridContainer.appendChild(leftColumn);
                	const rightColumn = document.createElement('div');
                	rightColumn.classList.add('monarch-column', 'right-column');
                	monarchsGridContainer.appendChild(rightColumn);

                	let currentMonarchIndex = 0;
                	const appendNextMonarch = () => {
                    	if (currentMonarchIndex < houseMonarchs.length) {
                        	const monarch = houseMonarchs[currentMonarchIndex];
                        	const monarchBlock = createMonarchBlock(monarch, houseName);
                        	if (index === 0) {
                            	const shouldBeVisible = (currentMonarchIndex <= 1);
                            	if (shouldBeVisible) {
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
                }
            });
            renderingPromises.push(housePromise);
        }
    });

    await Promise.all(renderingPromises);

    // --- 3. Setup Intersection Observer for Animations ---
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
    }, { threshold: 0.01 });

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
    // --- NEW: Only run these animations on desktop screens ---
    if (!window.matchMedia("(max-width: 1024px)").matches) {
        
        const mastheadBlock = document.querySelector('.masthead-block');
        const mastheadTitle = document.querySelector('.masthead-title');
        const mastheadSubtitle = document.querySelector('.masthead-subtitle');

        if (!mastheadBlock || !mastheadTitle) return;

        const scrollY = window.scrollY;

        // --- Part 1: Handle the Text Fade ---
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

        // --- Part 2: Handle the Masthead Fixing ---
        const fixTriggerPoint = 740 - 115; // 625px

        if (scrollY >= fixTriggerPoint) {
            mastheadBlock.classList.add('is-fixed-to-top');
        } else {
            mastheadBlock.classList.remove('is-fixed-to-top');
        }
    }
});