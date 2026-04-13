const password1 = document.getElementById("password1");
const password2 = document.getElementById("password2");
const count1 = document.getElementById("count1");
const count2 = document.getElementById("count2");
const battleBtn = document.getElementById("battleBtn");
const resetBtn = document.getElementById("resetBtn");
const winnerText = document.getElementById("winnerText");

const ui = {
    1: {
        score: document.getElementById("score1"),
        strengthText: document.getElementById("strengthText1"),
        strengthFill: document.getElementById("strengthFill1"),
        loadingFill: document.getElementById("loadingFill1"),
        crackTime: document.getElementById("crackTime1"),
        feedback: document.getElementById("feedback1"),
        card: document.getElementById("card1")
    },
    2: {
        score: document.getElementById("score2"),
        strengthText: document.getElementById("strengthText2"),
        strengthFill: document.getElementById("strengthFill2"),
        loadingFill: document.getElementById("loadingFill2"),
        crackTime: document.getElementById("crackTime2"),
        feedback: document.getElementById("feedback2"),
        card: document.getElementById("card2")
    }
};

function updateCount(input, countEl) {
    countEl.textContent = `${input.value.length} / 20`;
}

function setStrengthBar(fillEl, score100) {
    fillEl.style.width = `${score100}%`;

    if (score100 <= 25) {
        fillEl.style.background = "linear-gradient(90deg, #ff5f6d, #ffc371)";
    } else if (score100 <= 50) {
        fillEl.style.background = "linear-gradient(90deg, #ffd86f, #fc6262)";
    } else if (score100 <= 75) {
        fillEl.style.background = "linear-gradient(90deg, #43e97b, #38f9d7)";
    } else {
        fillEl.style.background = "linear-gradient(90deg, #ffffff, #7ee6ff)";
    }
}

function scoreLabel(score) {
    if (score === 0) return "Very Weak";
    if (score === 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Strong";
    return "Very Strong";
}

function renderFeedback(listEl, result) {
    listEl.innerHTML = "";

    const warnings = [];
    if (result.feedback.warning) warnings.push(result.feedback.warning);

    const suggestions = Array.isArray(result.feedback.suggestions)
        ? result.feedback.suggestions
        : [];

    const allFeedback = [...warnings, ...suggestions];

    if (!allFeedback.length) {
        const li = document.createElement("li");
        li.textContent = "Great password structure.";
        listEl.appendChild(li);
        return;
    }

    allFeedback.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        listEl.appendChild(li);
    });
}

function resetLoading(fillEl) {
    fillEl.style.transition = "none";
    fillEl.style.width = "0%";
}

function animateLoading(fillEl, duration) {
    fillEl.style.transition = "none";
    fillEl.style.width = "0%";
    void fillEl.offsetWidth;
    fillEl.style.transition = `width ${duration}ms linear`;
    fillEl.style.width = "100%";
}

function animationDurationFromScore(score) {
    if (score === 0) return 1000;
    if (score === 1) return 1500;
    if (score === 2) return 2200;
    if (score === 3) return 3200;
    return 4200;
}

function getRelevantCrackTime(result) {
    if (result.crack_times_display && result.crack_times_display.offline_slow_hashing_1e4_per_second) {
        return `Estimated crack time: ${result.crack_times_display.offline_slow_hashing_1e4_per_second}`;
    }

    if (result.crack_times_display && result.crack_times_display.offline_fast_hashing_1e10_per_second) {
        return `Estimated crack time: ${result.crack_times_display.offline_fast_hashing_1e10_per_second}`;
    }

    return "Estimated crack time unavailable.";
}

function getGuesses(result) {
    if (typeof result.guesses === "number") {
        return result.guesses;
    }
    return 0;
}

function analyzePassword(password) {
    const result = zxcvbn(password);

    return {
        raw: result,
        score100: Math.round((result.score / 4) * 100),
        score4: result.score,
        label: scoreLabel(result.score),
        crackText: getRelevantCrackTime(result),
        guesses: getGuesses(result),
        sequence: result.sequence || [],
        animationDuration: animationDurationFromScore(result.score)
    };
}

function updatePlayerUI(playerNum, analysis) {
    ui[playerNum].score.textContent = analysis.score100;
    ui[playerNum].strengthText.textContent = analysis.label;
    setStrengthBar(ui[playerNum].strengthFill, analysis.score100);
    renderFeedback(ui[playerNum].feedback, analysis.raw);
    ui[playerNum].crackTime.textContent = "Analyzing...";
    resetLoading(ui[playerNum].loadingFill);
    animateLoading(ui[playerNum].loadingFill, analysis.animationDuration);
}

function clearWinnerStyles() {
    ui[1].card.classList.remove("winner");
    ui[2].card.classList.remove("winner");
}

function resetGame() {
    password1.value = "";
    password2.value = "";

    password1.type = "password";
    password2.type = "password";

    document.querySelectorAll(".toggle-btn").forEach((btn) => {
        btn.textContent = "Show";
    });

    updateCount(password1, count1);
    updateCount(password2, count2);

    [1, 2].forEach((n) => {
        ui[n].score.textContent = "0";
        ui[n].strengthText.textContent = "Waiting...";
        ui[n].strengthFill.style.width = "0%";
        ui[n].strengthFill.style.background = "linear-gradient(90deg, #2d7cff, #00e5ff)";
        resetLoading(ui[n].loadingFill);
        ui[n].crackTime.textContent = "No result yet.";
        ui[n].feedback.innerHTML = "";
    });

    clearWinnerStyles();
    winnerText.textContent = "Enter two passwords, then press BATTLE.";
}

password1.addEventListener("input", () => updateCount(password1, count1));
password2.addEventListener("input", () => updateCount(password2, count2));

document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const target = document.getElementById(btn.dataset.target);

        if (!target) return;

        if (target.type === "password") {
            target.type = "text";
            btn.textContent = "Hide";
        } else {
            target.type = "password";
            btn.textContent = "Show";
        }
    });
});

battleBtn.addEventListener("click", () => {
    if (typeof zxcvbn !== "function") {
        winnerText.textContent = "zxcvbn did not load. Check the script tag in the HTML file.";
        return;
    }

    const pw1 = password1.value.trim();
    const pw2 = password2.value.trim();

    if (!pw1 || !pw2) {
        winnerText.textContent = "Both players need to enter a password first.";
        return;
    }

    const result1 = analyzePassword(pw1);
    const result2 = analyzePassword(pw2);

    clearWinnerStyles();
    updatePlayerUI(1, result1);
    updatePlayerUI(2, result2);

    winnerText.textContent = "Running password battle...";

    let finished = 0;

    function finishOne(playerNum, analysis) {
        ui[playerNum].crackTime.textContent = analysis.crackText;
        finished++;

        if (finished !== 2) return;

        if (result1.score4 > result2.score4) {
            winnerText.textContent = "Player 1 wins with the stronger password.";
            ui[1].card.classList.add("winner");
            return;
        }

        if (result2.score4 > result1.score4) {
            winnerText.textContent = "Player 2 wins with the stronger password.";
            ui[2].card.classList.add("winner");
            return;
        }

        if (result1.guesses > result2.guesses) {
            winnerText.textContent = "Tie on strength level, but Player 1 would take more guesses to crack.";
            ui[1].card.classList.add("winner");
            return;
        }

        if (result2.guesses > result1.guesses) {
            winnerText.textContent = "Tie on strength level, but Player 2 would take more guesses to crack.";
            ui[2].card.classList.add("winner");
            return;
        }

        winnerText.textContent = "It's a tie. Both passwords performed the same.";
    }

    setTimeout(() => finishOne(1, result1), result1.animationDuration);
    setTimeout(() => finishOne(2, result2), result2.animationDuration);
});

resetBtn.addEventListener("click", resetGame);

updateCount(password1, count1);
updateCount(password2, count2);