document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector(".wrapper");
    const statsSummary = document.getElementById("statsSummary");
    const otherStatsContainer = document.createElement("div");
    otherStatsContainer.classList.add("otherStats");
    wrapper.insertBefore(otherStatsContainer, document.querySelector(".buttons"));

	wrapper.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Estä oletustoiminto (esim. lomakkeen lähetys)
            calculateStats(); // Kutsu calculateStats
        }
    });
	
    function updateTypeLabels(statsContainer, troopType) {
        const typeSpans = statsContainer.querySelectorAll("label span");
        typeSpans.forEach(span => {
            span.textContent = troopType;
        });
    }

    function formatNumber(num) {
        return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    }

    function parseNumericInput(value) {
        if (!value) return 0;
        return parseFloat(value.replace(",", "."));
    }

    function encodeData(data) {
        return encodeURIComponent(JSON.stringify(data));
    }

    function decodeData(encoded) {
        try {
            return JSON.parse(decodeURIComponent(encoded));
        } catch {
            return null;
        }
    }

    function populateInputsFromData(data) {
        data.forEach((statsData, index) => {
            if (index === 0) {
                // Täytä ensimmäinen oletusstats
                populateStatsInputs(document.querySelector(".wrapper .stats"), statsData);
            } else {
                // Lisää uusi stats ja täytä se
                addNew();
                const newStats = otherStatsContainer.querySelectorAll(".stats")[index - 1];
                populateStatsInputs(newStats, statsData);
            }
        });
    }

    function populateStatsInputs(statsContainer, statsData) {
        if (!statsContainer || !statsData) return;
        statsContainer.querySelector(".dynamic-trooptype").value = statsData.troopType;
        statsContainer.querySelector("input[name=typeAttack]").value = statsData.typeAttack;
        statsContainer.querySelector("input[name=marcher]").value = statsData.marcher;
        statsContainer.querySelector("input[name=vs_inf]").value = statsData.vsInf;
        statsContainer.querySelector("input[name=vs_ran]").value = statsData.vsRan;
        statsContainer.querySelector("input[name=vs_cav]").value = statsData.vsCav;
        statsContainer.querySelector("input[name=hero]").value = statsData.hero || "";
        statsContainer.querySelector("input[name=dragon]").checked = statsData.dragon || false;
        updateTypeLabels(statsContainer, statsData.troopType);
    }

    function addNew() {
        const troopTypeElement = document.querySelector("select[name=trooptype]");
        const troopType = troopTypeElement ? troopTypeElement.value : "infantry";

        const statsContainer = document.createElement("div");
        statsContainer.classList.add("stats", "animated");
        statsContainer.innerHTML = `
            <div class="troopStats">
                <div class="removeButton">
                    <p>Remove <svg xmlns="http://www.w3.org/2000/svg" height="16" width="12" viewBox="0 0 384 512">
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
                        <input type="text" class="numeric-input" name="typeAttack" placeholder="value" pattern="[0-9]*" inputmode="numeric" required>
                    </div>
                    <div>
                        <label>
                            Marcher <span>Infantry</span> attack vs Player's SOP
                        </label>
                        <input type="text" class="numeric-input" name="marcher" placeholder="value" pattern="[0-9]*" inputmode="numeric" required>
                    </div>
                    <div>
                        <label>
                            <span>Infantry</span> attack vs Player's Infantry
                        </label>
                        <input type="text" class="numeric-input" name="vs_inf" placeholder="value" pattern="[0-9]*" inputmode="numeric" required>
                    </div>
                    <div>
                        <label>
                            <span>Infantry</span> attack vs Player's Ranged
                        </label>
                        <input type="text" class="numeric-input" name="vs_ran" placeholder="value" pattern="[0-9]*" inputmode="numeric" required>
                    </div>
                    <div>
                        <label>
                            <span>Infantry</span> attack vs Player's Cavalry
                        </label>
                        <input type="text" class="numeric-input" name="vs_cav" placeholder="value" pattern="[0-9]*" inputmode="numeric" required>
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

        updateTypeLabels(statsContainer, troopType);
        statsContainer.scrollIntoView({ behavior: "smooth", block: "start" });

        setTimeout(() => statsContainer.classList.remove("animated"), 2000);

        statsContainer.querySelector(".dynamic-trooptype").addEventListener("change", (e) => {
            updateTypeLabels(statsContainer, e.target.value);
        });

        statsContainer.querySelector(".removeButton").addEventListener("click", () => {
            statsContainer.remove();
        });
    }

    function calculateStats() {
		wrapper.style.display = "none";
		statsSummary.style.display = "flex";

		const defaultStats = document.querySelector(".wrapper .stats");
		const otherStats = otherStatsContainer.querySelectorAll(".stats");
		const allStats = defaultStats ? [defaultStats, ...otherStats] : otherStats;

		if (allStats.length === 0) return;

		let statsDataForUrl = [];
		let summaryData = [];
		let isValid = true;

		statsSummary.innerHTML = `
			<button id="closeResults">
				<span>Click here to go back and modify your selections</span>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
					<path d="M345 137c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-119 119L73 103c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l119 119L39 375c-9.4-9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l119-119L311 409c9.4-9.4 24.6-9.4 33.9 0s9.4-24.6 0-33.9l-119-119L345 137z"></path>
				</svg>
			</button>
		`;

		allStats.forEach(stats => {
			const inputs = stats.querySelectorAll("input[required]");
			inputs.forEach(input => {
				if (!input.value.trim()) {
					input.classList.add("error");
					isValid = false;

					input.addEventListener("input", function handleInput() {
						if (input.value.trim()) {
							input.classList.remove("error");
							input.removeEventListener("input", handleInput);
						}
					});
				}
			});
		});

		if (!isValid) {
			wrapper.style.display = "block";
			statsSummary.style.display = "none";
			alert("Please fill in all required fields.");
			return;
		}

		allStats.forEach(stats => {
			const troopType = stats.querySelector(".dynamic-trooptype").value;
			const hero = stats.querySelector(".text-input[name=hero]").value.trim();
			const dragon = stats.querySelector("input[name=dragon]").checked;

			const typeAttack = parseNumericInput(stats.querySelector("input[name=typeAttack]").value);
			const marcher = parseNumericInput(stats.querySelector("input[name=marcher]").value);
			const vsInf = parseNumericInput(stats.querySelector("input[name=vs_inf]").value);
			const vsRan = parseNumericInput(stats.querySelector("input[name=vs_ran]").value);
			const vsCav = parseNumericInput(stats.querySelector("input[name=vs_cav]").value);

			const attackVsInf = (((typeAttack + marcher) / 100) * vsInf + (typeAttack + marcher)) + vsInf;
			const attackVsRan = (((typeAttack + marcher) / 100) * vsRan + (typeAttack + marcher)) + vsRan;
			const attackVsCav = (((typeAttack + marcher) / 100) * vsCav + (typeAttack + marcher)) + vsCav;

			const average = ((attackVsInf + attackVsRan + attackVsCav) / 3);

			let description = `${troopType} attack`;
			if (hero || dragon) {
				description += " with";
				if (hero) description += ` ${hero} hero`;
				if (dragon) description += hero ? " and dragon" : " dragon";
			}

			statsSummary.innerHTML += `
				<div class="statsCard">
					<h4>${description}</h4>
					<p>Attack vs Infantry: ${formatNumber(attackVsInf)}</p>
					<p>Attack vs Ranged: ${formatNumber(attackVsRan)}</p>
					<p>Attack vs Cavalry: ${formatNumber(attackVsCav)}</p>
					<p>Average: ${formatNumber(average)}</p>
				</div>`;

			summaryData.push({ description, average });
			statsDataForUrl.push({
				troopType,
				typeAttack,
				marcher,
				vsInf,
				vsRan,
				vsCav,
				hero,
				dragon
			});
		});

		if (summaryData.length > 1) {
			summaryData.sort((a, b) => b.average - a.average);

			let summaryContent = summaryData
				.map((data, index) => `<p>${index + 1}. ${data.description} - ${formatNumber(data.average)}</p>`)
				.join("");

			statsSummary.innerHTML += `
				<div class="statsCardSummary">
					<h4>Summary of Calculations</h4>
					${summaryContent}
				</div>
			`;
		}

		const shareContainer = document.createElement("div");
		shareContainer.className = "share";

		const shareButton = document.createElement("button");
		shareButton.id = "shareResults";
		shareButton.textContent = "Copy Results";

		shareButton.addEventListener("click", () => {
			const url = new URL(window.location.href);
			url.searchParams.set("data", encodeData(statsDataForUrl));
			navigator.clipboard.writeText(url.href).then(() => {
				shareButton.textContent = "Link copied to clipboard!";
				setTimeout(() => (shareButton.textContent = "Copy Results"), 2000);
			});
		});

		// Lisää nappi shareContaineriin
		shareContainer.appendChild(shareButton);

		// Lisää shareContainer statsSummaryyn
		statsSummary.appendChild(shareContainer);


		document.getElementById("closeResults").addEventListener("click", () => {
			wrapper.style.display = "block";
			statsSummary.style.display = "none";

			// Tarkista, onko "Clear"-div jo olemassa
			if (!document.querySelector(".clear")) {
				const clearDiv = document.createElement("div");
				clearDiv.className = "clear";
				clearDiv.innerHTML = `<button>Clear</button>`;
				wrapper.insertBefore(clearDiv, document.querySelector(".stats.start"));

				clearDiv.querySelector("button").addEventListener("click", () => {
					const url = new URL(window.location.href);
					url.searchParams.delete("data");
					window.location.href = url.href;
				});
			}
		});

	}

    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get("data");

    if (encodedData) {
        const decodedData = decodeData(encodedData);
        if (decodedData) {
            wrapper.style.display = "none";
            statsSummary.style.display = "flex";
            populateInputsFromData(decodedData);
            calculateStats();
        }
    }

    window.addNew = addNew;
    window.calculateStats = calculateStats;
});
