const challenges = [
    {
        id: 1,
        emoji: "🚰",
        title: "Save Water",
        description: "Turn off the tap while brushing your teeth.",
        points: 10
    },
    {
        id: 2,
        emoji: "🛍️",
        title: "Skip Plastic Bags",
        description: "Use a reusable bag while shopping.",
        points: 15
    },
    {
        id: 3,
        emoji: "💡",
        title: "Save Electricity",
        description: "Switch off lights when leaving a room.",
        points: 10
    },
    {
        id: 4,
        emoji: "🚶",
        title: "Choose Walking",
        description: "Walk for a short trip instead of using a vehicle.",
        points: 20
    },
    {
        id: 5,
        emoji: "🌳",
        title: "Care for a Plant",
        description: "Water a plant or care for a green space.",
        points: 15
    },
    {
        id: 6,
        emoji: "♻️",
        title: "Sort Your Waste",
        description: "Separate recyclable waste from other waste.",
        points: 20
    }
];

const tips = [
    {
        title: "Carry a reusable bottle",
        text: "A reusable bottle can help reduce single-use plastic waste."
    },
    {
        title: "Unplug unused chargers",
        text: "Unplugging devices when they are not needed can reduce unnecessary electricity use."
    },
    {
        title: "Bring your own shopping bag",
        text: "A reusable shopping bag helps reduce the need for disposable bags."
    },
    {
        title: "Avoid wasting food",
        text: "Plan your meals and store food properly to reduce food waste."
    },
    {
        title: "Use natural light",
        text: "Open curtains during the day to make better use of sunlight."
    }
];

const STORAGE_KEY = "ecotrack-daily-progress-v1";

let completedTasks = [];
let tipIndex = 0;
let toastTimeout;

const $ = (id) => document.getElementById(id);

function getTodayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function loadProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (
            saved &&
            saved.date === getTodayKey() &&
            Array.isArray(saved.completed)
        ) {
            completedTasks = saved.completed.filter(id =>
                challenges.some(task => task.id === id)
            );
        } else {
            completedTasks = [];
        }
    } catch (error) {
        completedTasks = [];
    }
}

function saveProgress() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                date: getTodayKey(),
                completed: completedTasks
            })
        );
    } catch (error) {
        showToast("Progress could not be saved in this browser.");
    }
}

function calculatePoints() {
    return challenges
        .filter(task => completedTasks.includes(task.id))
        .reduce((total, task) => total + task.points, 0);
}

function getLevel(points) {
    if (points >= 100) return "Planet Champion";
    if (points >= 60) return "Green Hero";
    if (points >= 20) return "Eco Beginner";
    return "Seedling";
}

function renderChallenges() {
    const list = $("challengeList");

    list.innerHTML = challenges.map(task => {
        const completed = completedTasks.includes(task.id);

        return `
            <article class="challenge-card ${completed ? "completed" : ""}">
                <span class="challenge-emoji">${task.emoji}</span>
                <div class="challenge-info">
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <div class="challenge-footer">
                        <span class="points-label">+${task.points} points</span>
                        <button
                            class="complete-button"
                            type="button"
                            data-task-id="${task.id}"
                            ${completed ? "disabled" : ""}
                        >
                            ${completed ? "✓ Completed" : "Complete +"}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function renderBadges(points) {
    const badges = [
        { id: "badgeBeginner", threshold: 20 },
        { id: "badgeHero", threshold: 60 },
        { id: "badgeChampion", threshold: 100 }
    ];

    badges.forEach(badge => {
        const element = $(badge.id);
        const unlocked = points >= badge.threshold;

        element.classList.toggle("unlocked", unlocked);
        element.querySelector("small").textContent =
            unlocked ? "✓ Unlocked" : "🔒 Locked";
    });
}

function updateDashboard() {
    const points = calculatePoints();
    const completedCount = completedTasks.length;
    const percentage = Math.round(
        (completedCount / challenges.length) * 100
    );

    $("totalPoints").textContent = points;
    $("completedCount").textContent =
        `${completedCount} / ${challenges.length}`;
    $("levelName").textContent = getLevel(points);
    $("remainingCount").textContent =
    challenges.length - completedCount;
    $("progressPercent").textContent = `${percentage}%`;
    $("progressFill").style.width = `${percentage}%`;

    if (percentage === 100) {
        $("progressMessage").textContent =
            "Amazing! You completed every challenge today! 🌍";
    } else if (percentage >= 50) {
        $("progressMessage").textContent =
            "Great work! Keep going to complete your green journey.";
    } else if (percentage > 0) {
        $("progressMessage").textContent =
            "Nice start! Every small action makes a difference.";
    } else {
        $("progressMessage").textContent =
            "Every small action makes a difference.";
    }

    renderBadges(points);
}

function showToast(message) {
    const toast = $("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

$("challengeList").addEventListener("click", event => {
    const button = event.target.closest("[data-task-id]");

    if (!button) return;

    const taskId = Number(button.dataset.taskId);

    if (
        !Number.isInteger(taskId) ||
        completedTasks.includes(taskId)
    ) {
        return;
    }

    completedTasks.push(taskId);

    saveProgress();
    renderChallenges();
    updateDashboard();

    const task = challenges.find(item => item.id === taskId);

    showToast(`Great job! You earned ${task.points} eco-points 🌱`);
});

$("nextTip").addEventListener("click", () => {
    tipIndex = (tipIndex + 1) % tips.length;

    $("tipTitle").textContent = tips[tipIndex].title;
    $("tipText").textContent = tips[tipIndex].text;
});

$("resetButton").addEventListener("click", () => {
    const confirmed = window.confirm(
        "Reset all your eco-challenges for today?"
    );

    if (!confirmed) return;

    completedTasks = [];

    saveProgress();
    renderChallenges();
    updateDashboard();

    showToast("Today's progress has been reset.");
});

function initializeApp() {
    $("todayDate").textContent = new Date().toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

    loadProgress();
    renderChallenges();
    updateDashboard();
}

initializeApp();