document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector(".wrapper");
    const statsSummary = document.getElementById("statsSummary");
    const otherStatsContainer = document.createElement("div");
    otherStatsContainer.classList.add("otherStats");
    wrapper.insertBefore(otherStatsContainer, document.querySelector(".buttons"));

    // Updates type labels in the given stats container
    function updateTypeLabels(statsContainer, troopType) {
        const typeSpans = statsContainer.querySelectorAll("label span");
        typeSpans.forEach(span => {
            span.textContent = troopType;
        });
    }

    // Adds a new stats section
    function addNew() {
        const troopTypeElement = document.querySelector("select[name=trooptype]");
        const troopType = troopTypeElement ? troopTypeElement.value : "infantry";

        const statsContainer = document.createElement("div");
        statsContainer.classList.add("stats");
        statsContainer.innerHTML = `
            <div class="troopStats">
                <div class="removeButton">
                    <p><svg xmlns="http://www.w3.org/2000/svg" height="16" width="12" viewBox="0 0 384 512">
                        <path d="M326.6 166.6L349.3 144 304 98.7l-22.6 22.6L192 210.7l-89.4-89.4L80 98.7 34.7 144l22.6 22.6L146.7 256 57.4 345.4 34.7 368 80 413.3l22.6-22.6L192 301.3l89.4 89.4L304 413.3 349.3 368l-22.6-22.6L237.3 256l89.4-89.4z"></path>
                    </svg></p>
                </div>
                <div class="type">
                    <label for="trooptype">
                        Troop type
                    </label>
                    <select name="trooptype" class="dynamic-trooptype">
                        <option value="infantry">Infantry</option>
                        <option value="ranged">Ranged</option>
                        <option value="cavalry">Cavalry</option>
                    </select>
                </div>
                <div class="typeStats">
                    <div>
                        <label>
                            <span>Infantry</span> attack
                        </label>
                        <input type="text" class="numeric-input" name="typeAttack" placeholder="value" pattern="[0-9]*" inputmode="numeric">
                    </div>
                    <div>
                        <label>
                            Marcher <span>Infantry</span> attack vs Player's SOP
                        </label>
                        <input type="text" class="numeric-input" name="marcher" placeholder="value" pattern="[0-9]*" inputmode="numeric">
                    </div>
                    <div>
                        <label>
                            <span>Infantry</span> attack vs Player's Infantry
                        </label>
                        <input type="text" class="numeric-input" name="vs_inf" placeholder="value" pattern="[0-9]*" inputmode="numeric">
                    </div>
                    <div>
                        <label>
                            <span>Infantry</span> attack vs Player's Ranged
                        </label>
                        <input type="text" class="numeric-input" name="vs_ran" placeholder="value" pattern="[0-9]*" inputmode="numeric">
                    </div>
                    <div>
                        <label>
                            <span>Infantry</span> attack vs Player's Cavalry
                        </label>
                        <input type="text" class="numeric-input" name="vs_cav" placeholder="value" pattern="[0-9]*" inputmode="numeric">
                    </div>
                </div>
                <div class="otherInfo">
                    <div class="hero">
                        <label>Hero</label>
                        <input type="text" class="text-input" name="hero" placeholder="Name">
                    </div>
                    <div class="dragon">
                        <input type="checkbox" name="dragon" value="dragon">
                        <label for="dragon">I used a Dragon</label>
                    </div>
                </div>
            </div>
        `;

        otherStatsContainer.appendChild(statsContainer);

        // Set the initial troop type for the new stats container
        updateTypeLabels(statsContainer, troopType);

        // Scroll to the newly added stats element
        statsContainer.scrollIntoView({ behavior: "smooth", block: "start" });

        // Add change listener for the troop type select within this stats element
        statsContainer.querySelector(".dynamic-trooptype").addEventListener("change", (e) => {
            updateTypeLabels(statsContainer, e.target.value);
        });

        // Add remove button functionality
        const removeButton = statsContainer.querySelector(".removeButton");
        removeButton.addEventListener("click", () => {
            statsContainer.remove();
        });
    }

    // Calculates and displays the stats summary
    function calculateStats() {
        wrapper.style.display = "none";
        statsSummary.style.display = "flex";

        const allStats = otherStatsContainer.querySelectorAll(".stats");
        statsSummary.innerHTML = '<button id="closeResults">\n            <span>Click here to go back and modify your selections</span>\n            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">\n                <path d="M345 137c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-119 119L73 103c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l119 119L39 375c-9.4-9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l119-119L311 409c9.4-9.4 24.6-9.4 33.9 0s9.4-24.6 0-33.9l-119-119L345 137z"></path>\n            </svg></button>';

        allStats.forEach(stats => {
            const troopType = stats.querySelector(".dynamic-trooptype").value;
            const hero = stats.querySelector(".text-input[name=hero]").value.trim();
            const dragon = stats.querySelector("input[name=dragon]").checked;

            const typeAttack = parseFloat(stats.querySelector("input[name=typeAttack]").value) || 0;
            const marcher = parseFloat(stats.querySelector("input[name=marcher]").value) || 0;
            const vsInf = parseFloat(stats.querySelector("input[name=vs_inf]").value) || 0;
            const vsRan = parseFloat(stats.querySelector("input[name=vs_ran]").value) || 0;
            const vsCav = parseFloat(stats.querySelector("input[name=vs_cav]").value) || 0;

            const attackVsInf = (((typeAttack + marcher) / 100) * vsInf + (typeAttack + marcher)) + vsInf;
            const attackVsRan = (((typeAttack + marcher) / 100) * vsRan + (typeAttack + marcher)) + vsRan;
            const attackVsCav = (((typeAttack + marcher) / 100) * vsCav + (typeAttack + marcher)) + vsCav;

            const average = ((attackVsInf + attackVsRan + attackVsCav) / 3).toFixed(2);

            let description = `${troopType} attack`;
            if (hero || dragon) {
                description += " with";
                if (hero) description += ` ${hero} hero`;
                if (dragon) description += hero ? " and dragon" : " dragon";
            }

            statsSummary.innerHTML += `
                <div class="statsCard">
                    <p>${description}</p>
                    <p>Attack vs Infantry: ${attackVsInf.toFixed(2)}</p>
                    <p>Attack vs Ranged: ${attackVsRan.toFixed(2)}</p>
                    <p>Attack vs Cavalry: ${attackVsCav.toFixed(2)}</p>
                    <p>Average: ${average}</p>
                </div>`;
        });

        document.getElementById("closeResults").addEventListener("click", () => {
            wrapper.style.display = "block";
            statsSummary.style.display = "none";
        });
    }

    // Add change listener for the initial troop type select
    document.querySelector("select[name=trooptype]").addEventListener("change", (e) => {
        const firstStats = document.querySelector(".wrapper .stats");
        if (firstStats) {
            updateTypeLabels(firstStats, e.target.value);
        }
    });

    window.addNew = addNew;
    window.calculateStats = calculateStats;
});
