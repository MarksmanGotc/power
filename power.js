document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector(".wrapper");
    const statsSummary = document.getElementById("statsSummary");
    const otherStatsContainer = document.createElement("div");
    otherStatsContainer.classList.add("otherStats");
    wrapper.insertBefore(otherStatsContainer, document.querySelector(".buttons"));

    function updateTypeLabels(troopType) {
        const allStats = otherStatsContainer.querySelectorAll(".stats");
        allStats.forEach(stats => {
            const typeSpans = stats.querySelectorAll("label span");
            typeSpans.forEach(span => {
                span.textContent = troopType;
            });
        });
    }

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
                    <label for="typeAttack">
                        <span>[type]</span> attack
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
                            <span>[type]</span> attack
                        </label>
                        <input type="text" class="numeric-input" name="typeAttack" placeholder="value" pattern="[0-9]*" inputmode="numeric">
                    </div>
                    <div>
                        <label>
                            Marcher <span>[type]</span> attack vs Player's SOP
                        </label>
                        <input type="text" class="numeric-input" name="marcher" placeholder="value" pattern="[0-9]*" inputmode="numeric">
                    </div>
                    <div>
                        <label>
                            <span>[type]</span> attack vs Player's Infantry
                        </label>
                        <input type="text" class="numeric-input" name="vs_inf" placeholder="value" pattern="[0-9]*" inputmode="numeric">
                    </div>
                    <div>
                        <label>
                            <span>[type]</span> attack vs Player's Ranged
                        </label>
                        <input type="text" class="numeric-input" name="vs_ran" placeholder="value" pattern="[0-9]*" inputmode="numeric">
                    </div>
                    <div>
                        <label>
                            <span>[type]</span> attack vs Player's Cavalry
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
        updateTypeLabels(troopType);

        // Scroll to the newly added stats element
        statsContainer.scrollIntoView({ behavior: "smooth", block: "start" });

        const removeButton = statsContainer.querySelector(".removeButton");
        removeButton.addEventListener("click", () => {
            statsContainer.remove();
        });
    }

    document.querySelector("select[name=trooptype]").addEventListener("change", (e) => {
        updateTypeLabels(e.target.value);
    });

    window.addNew = addNew;
});
