document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.querySelector(".wrapper");
    const statsSummary = document.getElementById("statsSummary");
    const attackButton = document.querySelector(".att");
    const defenceButton = document.querySelector(".def");
    const attackStatsWrap = document.querySelector(".attackStats");
    const defenceStatsWrap = document.querySelector(".defenceStats");
    const otherStatsContainer = document.createElement("div");
	

    otherStatsContainer.classList.add("otherStats");
    attackStatsWrap.append(otherStatsContainer);

    // Näppäimen klikkauksen käsittely
    attackButton.addEventListener("click", () => {
        if (!attackButton.classList.contains("active")) {
            attackButton.classList.add("active");
            defenceButton.classList.remove("active");
            attackStatsWrap.classList.remove("none");
            defenceStatsWrap.classList.add("none");
        }
    });

    defenceButton.addEventListener("click", () => {
        if (!defenceButton.classList.contains("active")) {
            defenceButton.classList.add("active");
            attackButton.classList.remove("active");
            defenceStatsWrap.classList.remove("none");
            attackStatsWrap.classList.add("none");
        }
    });
	
	wrapper.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Estä oletustoiminto (esim. lomakkeen lähetys)
            calculateStats(); // Kutsu calculateStats
        }
    });
	
	const firstStats = document.querySelector(".wrapper .stats.start");
    if (firstStats) {
        const firstTroopTypeSelect = firstStats.querySelector(".dynamic-trooptype");
        firstTroopTypeSelect.addEventListener("change", (e) => {
            updateTypeLabels(firstStats, e.target.value);
        });
    }
	
    // Päivitä troop type -valinnan muutokset puolustuksessa
    defenceStatsWrap.addEventListener("change", (event) => {
        if (event.target && event.target.matches("select[name=trooptype]")) {
            const statsContainer = event.target.closest(".stats");
            if (statsContainer) {
                updateTypeLabels(statsContainer, event.target.value);
            }
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

	// Enkoodaus Base64-muotoon
	function encodeData(data) {
		return btoa(JSON.stringify(data));
	}

	// Dekoodaus Base64-muodosta
	function decodeData(encoded) {
		try {
			return JSON.parse(atob(encoded));
		} catch {
			return null;
		}
	}

    function populateInputsFromData(data) {
		const calculationType = urlParams.get("type"); // Tarkista URL:sta tyyppi (attack/defence)
		const container = calculationType === "defence"
			? document.querySelector(".otherStatsDef")
			: otherStatsContainer;

		data.forEach((statsData, index) => {
			let statsContainer;
			if (index === 0) {
				// Täytä ensimmäinen stats
				statsContainer = calculationType === "defence"
					? document.querySelector(".defenceStats .stats.start")
					: document.querySelector(".attackStats .stats.start");
			} else {
				// Lisää uusi stats ja täytä se
				addNew();
				statsContainer = container.querySelectorAll(".stats")[index - 1];
			}

			// Lisää puuttuva removeButton, jos se puuttuu
			if (!statsContainer.querySelector(".removeButton")) {
				const removeButton = document.createElement("div");
				removeButton.classList.add("removeButton");
				removeButton.innerHTML = `<p>Remove</p>`;
				statsContainer.insertBefore(removeButton, statsContainer.firstChild);

				// Poista kortti, kun remove-nappia painetaan
				removeButton.addEventListener("click", () => {
					statsContainer.remove();
				});
			}

			// Täytä stats-tiedot
			populateStatsInputs(statsContainer, statsData);
		});
	}



    function populateStatsInputs(statsContainer, statsData) {
		if (!statsContainer || !statsData) return;

		const isAttack = statsData.hasOwnProperty("typeAttack"); // Tarkista onko Attack vai Defence

		statsContainer.querySelector(".dynamic-trooptype").value = statsData.troopType;

		if (isAttack) {
			// Täytä Attack-kentät
			statsContainer.querySelector("input[name=typeAttack]").value = statsData.typeAttack;
			statsContainer.querySelector("input[name=marcher]").value = statsData.marcher;
			statsContainer.querySelector("input[name=vs_inf]").value = statsData.vsInf;
			statsContainer.querySelector("input[name=vs_ran]").value = statsData.vsRan;
			statsContainer.querySelector("input[name=vs_cav]").value = statsData.vsCav;
		} else {
			// Täytä Defence-kentät
			statsContainer.querySelector("input[name=typeDefence]").value = statsData.typeDefence;
			statsContainer.querySelector("input[name=defDefence]").value = statsData.defDefence;
			statsContainer.querySelector("input[name=marcherD]").value = statsData.marcherD;
			statsContainer.querySelector("input[name=vs_inf_d]").value = statsData.vsInfD;
			statsContainer.querySelector("input[name=vs_ran_d]").value = statsData.vsRanD;
			statsContainer.querySelector("input[name=vs_cav_d]").value = statsData.vsCavD;
		}

		statsContainer.querySelector("input[name=hero]").value = statsData.hero || "";
		statsContainer.querySelector("input[name=dragon]").checked = statsData.dragon || false;
		updateTypeLabels(statsContainer, statsData.troopType);
	}


    function addNew() {
		// Tarkista, kumpi puoli on aktiivinen
		const isAttackVisible = !attackStatsWrap.classList.contains("none");
		const container = isAttackVisible ? otherStatsContainer : document.querySelector(".otherStatsDef");

		const statsContainer = document.createElement("div");
		statsContainer.classList.add("stats", "animated");

		if (isAttackVisible) {
			// Attack-rakenne
			statsContainer.innerHTML = `
				<div class="troopStats">
					<div class="removeButton">
						<p>Remove</p>
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
							<label><span>Infantry</span> attack</label>
							<input type="text" class="numeric-input" name="typeAttack" placeholder="value" required>
						</div>
						<div>
							<label>Marcher <span>Infantry</span> attack vs Player's SOP</label>
							<input type="text" class="numeric-input" name="marcher" placeholder="value" required>
						</div>
						<div>
							<label><span>Infantry</span> attack vs Player's Infantry</label>
							<input type="text" class="numeric-input" name="vs_inf" placeholder="value" required>
						</div>
						<div>
							<label><span>Infantry</span> attack vs Player's Ranged</label>
							<input type="text" class="numeric-input" name="vs_ran" placeholder="value" required>
						</div>
						<div>
							<label><span>Infantry</span> attack vs Player's Cavalry</label>
							<input type="text" class="numeric-input" name="vs_cav" placeholder="value" required>
						</div>
					</div>
					<div class="otherInfo">
						<div class="hero">
							<label>Hero</label>
							<input type="text" class="text-input" name="hero" placeholder="Name">
						</div>
						<div class="dragon">
							<input type="checkbox" name="dragon" id="dragonCheckbox${Date.now()}" value="dragon">
							<label for="dragonCheckbox${Date.now()}">I used a Dragon</label>
						</div>
					</div>
				</div>`;
		} else {
			// Defence-rakenne
			statsContainer.innerHTML = `
				<div class="troopStats">
					<div class="removeButton">
						<p>Remove</p>
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
							<label><span>infantry</span> defence</label>
							<input type="text" class="numeric-input" name="typeDefence" placeholder="value" required>
						</div>
						<div>
							<label>Defender defence</label>
							<input type="text" class="numeric-input" name="defDefence" placeholder="value" required>
						</div>
						<div>
							<label><span>infantry</span> defence vs Player's SOP</label>
							<input type="text" class="numeric-input" name="marcherD" placeholder="value" required>
						</div>
						<div>
							<label><span>infantry</span> defence vs Player's Infantry</label>
							<input type="text" class="numeric-input" name="vs_inf_d" placeholder="value" required>
						</div>
						<div>
							<label><span>infantry</span> defence vs Player's Ranged</label>
							<input type="text" class="numeric-input" name="vs_ran_d" placeholder="value" required>
						</div>
						<div>
							<label><span>infantry</span> defence vs Player's Cavalry</label>
							<input type="text" class="numeric-input" name="vs_cav_d" placeholder="value" required>
						</div>
					</div>
					<div class="otherInfo">
						<div class="hero">
							<label>Hero</label>
							<input type="text" class="text-input" name="hero" placeholder="Name">
						</div>
						<div class="dragon">
							<input type="checkbox" name="dragon" id="dragonCheckbox${Date.now()}" value="dragon">
							<label for="dragonCheckbox${Date.now()}">I used a Dragon</label>
						</div>
					</div>
				</div>`;
		}

		container.appendChild(statsContainer);

		statsContainer.scrollIntoView({ behavior: "smooth", block: "start" });

		setTimeout(() => statsContainer.classList.remove("animated"), 2000);

		statsContainer.querySelector(".dynamic-trooptype").addEventListener("change", (e) => {
			updateTypeLabels(statsContainer, e.target.value);
		});

		statsContainer.querySelector(".removeButton")?.addEventListener("click", () => {
			statsContainer.remove();
		});
	}

    function calculateStats() {
		const isAttackVisible = !attackStatsWrap.classList.contains("none");
		const primaryStats = isAttackVisible
			? document.querySelector(".wrapper .stats.start")
			: document.querySelector(".defenceStats .stats.start");

		const additionalStats = isAttackVisible
			? otherStatsContainer.querySelectorAll(".stats")
			: document.querySelectorAll(".otherStatsDef .stats");

		const allStats = primaryStats ? [primaryStats, ...additionalStats] : additionalStats;

		if (allStats.length === 0) return;
		
		let isValid = true;

		// Tarkista vain näkyvän puolen pakolliset kentät
		allStats.forEach((stats) => {
			const requiredInputs = stats.querySelectorAll("input[required]");
			requiredInputs.forEach((input) => {
				if (!input.value.trim()) {
					input.classList.add("error"); // Lisää virheluokka
					isValid = false;

					// Poista virheluokka, kun kenttä täytetään
					input.addEventListener("input", function handleInput() {
						if (input.value.trim()) {
							input.classList.remove("error");
							input.removeEventListener("input", handleInput); // Poista kuuntelija
						}
					});
				}
			});
		});

		if (!isValid) {
			alert("Please fill in all required fields.");
			return; // Pysäytä laskenta
		}

		// Piilota wrapper laskennan ajaksi
		wrapper.classList.add("none");
		statsSummary.style.display = "flex";
		statsSummary.innerHTML = `
			<button id="closeResults">
				<span>Click here to go back and modify your selections</span>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
					<path d="M345 137c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-119 119L73 103c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l119 119L39 375c-9.4-9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l119-119L311 409c9.4-9.4 24.6-9.4 33.9 0s9.4-24.6 0-33.9l-119-119L345 137z"></path>
				</svg>
			</button>
		`;

		let summaryData = [];
		let calculationType = isAttackVisible ? "attack" : "defence";

		allStats.forEach((stats) => {
			const troopType = stats.querySelector(".dynamic-trooptype").value;
			const hero = stats.querySelector("input[name=hero]").value.trim();
			const dragon = stats.querySelector("input[name=dragon]").checked;

			let description = `${troopType} ${isAttackVisible ? "attack" : "defence"}`;
			if (hero || dragon) {
				description += " with";
				if (hero) description += ` ${hero}`;
				if (dragon) description += hero ? " and dragon" : " dragon";
			}

			if (isAttackVisible) {
				// Attack laskenta
				const typeAttack = parseNumericInput(stats.querySelector("input[name=typeAttack]").value);
				const marcher = parseNumericInput(stats.querySelector("input[name=marcher]").value);
				const vsInf = parseNumericInput(stats.querySelector("input[name=vs_inf]").value);
				const vsRan = parseNumericInput(stats.querySelector("input[name=vs_ran]").value);
				const vsCav = parseNumericInput(stats.querySelector("input[name=vs_cav]").value);

				const attackVsInf = (((typeAttack + marcher) / 100) * vsInf + (typeAttack + marcher)) + vsInf;
				const attackVsRan = (((typeAttack + marcher) / 100) * vsRan + (typeAttack + marcher)) + vsRan;
				const attackVsCav = (((typeAttack + marcher) / 100) * vsCav + (typeAttack + marcher)) + vsCav;

				const average = ((attackVsInf + attackVsRan + attackVsCav) / 3);

				statsSummary.innerHTML += `
					<div class="statsCard">
						<h4>${description}</h4>
						<p>Attack vs Infantry: ${formatNumber(attackVsInf)}</p>
						<p>Attack vs Ranged: ${formatNumber(attackVsRan)}</p>
						<p>Attack vs Cavalry: ${formatNumber(attackVsCav)}</p>
						<p>Average: ${formatNumber(average)}</p>
					</div>`;
				summaryData.push({ description: `${troopType} attack`, average });
			} else {
				// Defence laskenta
				const typeDefence = parseNumericInput(stats.querySelector("input[name=typeDefence]").value);
				const defenderDefence = parseNumericInput(stats.querySelector("input[name=defDefence]").value);
				const sopDefence = parseNumericInput(stats.querySelector("input[name=marcherD]").value);
				const vsInfD = parseNumericInput(stats.querySelector("input[name=vs_inf_d]").value);
				const vsRanD = parseNumericInput(stats.querySelector("input[name=vs_ran_d]").value);
				const vsCavD = parseNumericInput(stats.querySelector("input[name=vs_cav_d]").value);

				const defVsInf = (((typeDefence + defenderDefence + sopDefence) / 100) * vsInfD + (typeDefence + defenderDefence + sopDefence)) + vsInfD;
				const defVsRan = (((typeDefence + defenderDefence + sopDefence) / 100) * vsRanD + (typeDefence + defenderDefence + sopDefence)) + vsRanD;
				const defVsCav = (((typeDefence + defenderDefence + sopDefence) / 100) * vsCavD + (typeDefence + defenderDefence + sopDefence)) + vsCavD;

				const averageDef = ((defVsInf + defVsRan + defVsCav) / 3);

				statsSummary.innerHTML += `
					<div class="statsCard">
						<h4>${description}</h4>
						<p>Defence vs Infantry: ${formatNumber(defVsInf)}</p>
						<p>Defence vs Ranged: ${formatNumber(defVsRan)}</p>
						<p>Defence vs Cavalry: ${formatNumber(defVsCav)}</p>
						<p>Average: ${formatNumber(averageDef)}</p>
					</div>`;
				summaryData.push({ description: `${troopType} defence`, average: averageDef });
			}
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
				</div>`;
		}

		// Kopiointitoiminto
		const shareContainer = document.createElement("div");
		shareContainer.className = "share";

		const shareButton = document.createElement("button");
		shareButton.id = "shareResults";
		shareButton.textContent = "Copy Results";

		shareButton.addEventListener("click", () => {
			const url = new URL(window.location.href);
			const originalData = Array.from(allStats).map((stats) => {
				const troopType = stats.querySelector(".dynamic-trooptype").value;

				if (isAttackVisible) {
					return {
						troopType,
						typeAttack: parseNumericInput(stats.querySelector("input[name=typeAttack]").value),
						marcher: parseNumericInput(stats.querySelector("input[name=marcher]").value),
						vsInf: parseNumericInput(stats.querySelector("input[name=vs_inf]").value),
						vsRan: parseNumericInput(stats.querySelector("input[name=vs_ran]").value),
						vsCav: parseNumericInput(stats.querySelector("input[name=vs_cav]").value),
						hero: stats.querySelector("input[name=hero]").value.trim(),
						dragon: stats.querySelector("input[name=dragon]").checked,
					};
				} else {
					return {
						troopType,
						typeDefence: parseNumericInput(stats.querySelector("input[name=typeDefence]").value),
						defDefence: parseNumericInput(stats.querySelector("input[name=defDefence]").value),
						marcherD: parseNumericInput(stats.querySelector("input[name=marcherD]").value),
						vsInfD: parseNumericInput(stats.querySelector("input[name=vs_inf_d]").value),
						vsRanD: parseNumericInput(stats.querySelector("input[name=vs_ran_d]").value),
						vsCavD: parseNumericInput(stats.querySelector("input[name=vs_cav_d]").value),
						hero: stats.querySelector("input[name=hero]").value.trim(),
						dragon: stats.querySelector("input[name=dragon]").checked,
					};
				}
			});

			// Tallenna URL:iin alkuperäiset stats-data ja tyyppi
			url.searchParams.set("data", encodeData(originalData));
			url.searchParams.set("type", isAttackVisible ? "attack" : "defence");

			navigator.clipboard.writeText(url.href).then(() => {
				shareButton.textContent = "Link copied to clipboard!";
				setTimeout(() => (shareButton.textContent = "Copy Results"), 2000);
			});
		});

		shareContainer.appendChild(shareButton);
		statsSummary.appendChild(shareContainer);



		document.getElementById("closeResults").addEventListener("click", () => {
			wrapper.classList.remove("none");
			statsSummary.style.display = "none";

			// Tarkista, onko "Clear"-div jo olemassa
			if (!document.querySelector(".clear")) {
				const clearDiv = document.createElement("div");
				clearDiv.className = "clear";
				clearDiv.innerHTML = `<button>Clear</button>`;
				//wrapper.insertBefore(clearDiv, document.querySelector(".stats.start"));
				defenceButton.parentElement.after(clearDiv);
				
				clearDiv.querySelector("button").addEventListener("click", () => {
					const url = new URL(window.location.href);
					url.searchParams.delete("data");
					url.searchParams.delete("type"); 
					window.location.href = url.href; 
				});
			}
		});
	}

    const urlParams = new URLSearchParams(window.location.search);
	const encodedData = urlParams.get("data");

	if (encodedData) {
		const decodedData = decodeData(encodedData);
		const calculationType = urlParams.get("type"); // Hae type-parametri (attack/defence)

		if (decodedData && Array.isArray(decodedData) && calculationType) {
			// Piilota wrapper ja näytä statsSummary
			wrapper.classList.add("none");
			statsSummary.style.display = "flex";

			// Aktivoi oikea puoli riippuen type-parametrista
			if (calculationType === "defence") {
				defenceButton.click(); // Aktivoi Defence-puoli
			} else if (calculationType === "attack") {
				attackButton.click(); // Aktivoi Attack-puoli
			} else {
				attackButton.click(); // Aktivoi Attack-puoli
			}

			// Täytä tiedot lomakkeeseen
			populateInputsFromData(decodedData);

			// Suorita laskenta
			calculateStats();
		} else {
			console.error("Invalid or missing data in URL parameters.");
		}
	}



    window.addNew = addNew;
    window.calculateStats = calculateStats;
});
