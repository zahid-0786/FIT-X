// --- Application State ---
let currentGoal = 'gain'; // 'gain' or 'lose'
let lastCalculatedData = {
  maintenance: 2352,
  target: 2852,
  goal: 'gain'
};

// --- Preset Food Suggestions & Diets ---
const dietData = {
  gain: {
    badgeIcon: 'fa-solid fa-dumbbell',
    title: 'Your Daily Plan (Gain Weight)',
    colorClass: 'text-green',
    deltaText: '+500 kcal',
    deltaSub: '(Recommended Surplus)',
    suggestions: [
      'Include protein-rich foods (chicken, eggs, paneer, fish, etc.)',
      'Eat complex carbs (rice, oats, sweet potatoes, whole grains)',
      'Healthy fats (nuts, peanut butter, olive oil, avocado)',
      'Have 5-6 nutrient-dense meals per day'
    ],
    macrosPct: { p: 0.20, c: 0.56, f: 0.24 }, // Protein 20%, Carbs 56%, Fats 24%
    meals: [
      { name: 'Breakfast (7:00 - 9:00 AM)', desc: 'Oats with whole milk, banana, chia seeds, almonds', cals: 700, icon: 'fa-bowl-rice' },
      { name: 'Mid Morning (10:30 AM)', desc: 'Boiled eggs (3) + 2 whole grain toasts with peanut butter', cals: 400, icon: 'fa-egg' },
      { name: 'Lunch (1:00 - 2:00 PM)', desc: 'White rice, grilled chicken breast or paneer, green veg, curd', cals: 800, icon: 'fa-drumstick-bite' },
      { name: 'Evening Snack (5:00 - 6:00 PM)', desc: 'Whey protein shake + apple or bananas', cals: 450, icon: 'fa-blender' },
      { name: 'Dinner (8:00 - 9:00 PM)', desc: 'Paneer or fish, 3 whole wheat rotis, fresh tossed salad', cals: 500, icon: 'fa-utensils' }
    ]
  },
  lose: {
    badgeIcon: 'fa-solid fa-fire',
    title: 'Your Daily Plan (Lose Weight)',
    colorClass: 'text-blue',
    deltaText: '-500 kcal',
    deltaSub: '(Recommended Deficit)',
    suggestions: [
      'Eat lean protein (chicken breast, egg whites, fish, tofu, legumes)',
      'Choose high-fiber foods (leafy vegetables, fruits, whole grains)',
      'Avoid fried junk food and sugary liquid drinks',
      'Stay hydrated (2.5 – 3.5 L water daily)'
    ],
    macrosPct: { p: 0.30, c: 0.45, f: 0.25 }, // Protein 30%, Carbs 45%, Fats 25%
    meals: [
      { name: 'Breakfast (8:00 - 9:00 AM)', desc: 'Scrambled egg whites or paneer bhurji + 1 slice whole wheat bread + black coffee', cals: 400, icon: 'fa-egg' },
      { name: 'Mid Morning (11:00 AM)', desc: 'Green tea + a handful of roasted almonds and walnuts', cals: 180, icon: 'fa-mug-hot' },
      { name: 'Lunch (1:00 - 2:00 PM)', desc: 'Grilled chicken or tofu salad with mixed veggies and light lemon olive oil dressing', cals: 600, icon: 'fa-bowl-food' },
      { name: 'Evening Snack (5:00 PM)', desc: 'Protein shake mixed with water or low fat Greek yogurt with berries', cals: 250, icon: 'fa-blender' },
      { name: 'Dinner (8:00 - 8:30 PM)', desc: 'Clear vegetable soup + grilled fish / sauteed paneer with steamed broccoli', cals: 450, icon: 'fa-utensils' }
    ]
  }
};

// --- Navigation Management ---
function navigateTo(pageId) {
  // Update nav link active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-page') === pageId);
  });

  // Switch visible section
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
  const targetSection = document.getElementById(`${pageId}-page`);
  if (targetSection) {
    targetSection.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Attach click listeners to nav buttons
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.getAttribute('data-page');
    navigateTo(page);
  });
});

// --- Mode Switcher (Gain vs Lose) ---
function switchMode(mode) {
  currentGoal = mode;
  const calcContainer = document.getElementById('calc-container-box');
  const tabGain = document.getElementById('tab-gain');
  const tabLose = document.getElementById('tab-lose');
  const modeLabel = document.getElementById('calc-mode-label');
  const badgeIcon = document.querySelector('#calc-badge i');
  const btnCalculate = document.getElementById('btn-calculate');

  if (mode === 'gain') {
    calcContainer.classList.remove('mode-lose');
    tabGain.classList.add('active');
    tabLose.classList.remove('active');
    modeLabel.textContent = 'Gain Weight';
    badgeIcon.className = 'fa-solid fa-dumbbell';
    btnCalculate.style.background = 'var(--primary-green)';
  } else {
    calcContainer.classList.add('mode-lose');
    tabLose.classList.add('active');
    tabGain.classList.remove('active');
    modeLabel.textContent = 'Lose Weight';
    badgeIcon.className = 'fa-solid fa-fire';
    btnCalculate.style.background = 'var(--primary-blue)';
  }

  // Recalculate with active inputs
  calculateCalories();
}

function startCalculator(mode) {
  navigateTo('calculator');
  switchMode(mode);
}

// --- Scientific Calorie Calculation (Mifflin-St Jeor Equation) ---
function calculateCalories() {
  const gender = document.getElementById('gender').value;
  const age = parseFloat(document.getElementById('age').value) || 25;
  const height = parseFloat(document.getElementById('height').value) || 175;
  const weight = parseFloat(document.getElementById('weight').value) || 70;
  const activityMultiplier = parseFloat(document.getElementById('activity').value) || 1.55;

  // BMR Calculation
  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const maintenance = Math.round(bmr * activityMultiplier);
  const delta = currentGoal === 'gain' ? 500 : -500;
  const target = maintenance + delta;

  lastCalculatedData = { maintenance, target, goal: currentGoal };

  renderResults(maintenance, target, currentGoal);
}

// --- Render Calculation Results ---
function renderResults(maintenance, target, goal) {
  const goalConfig = dietData[goal];

  document.getElementById('maint-val').textContent = maintenance.toLocaleString();
  document.getElementById('target-calories-val').innerHTML = `${target.toLocaleString()} <span class="unit">kcal/day</span>`;
  document.getElementById('target-mode-tag').textContent = goal === 'gain' ? 'To Gain Weight' : 'To Lose Weight';
  document.getElementById('target-delta-tag').textContent = goalConfig.deltaText;
  document.getElementById('target-note').textContent = goalConfig.deltaSub;

  // Update suggestions list
  const listEl = document.getElementById('food-suggestions-list');
  listEl.innerHTML = '';
  goalConfig.suggestions.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    listEl.appendChild(li);
  });
}

// --- Modal Detailed Plan Handling ---
function showDietPlanModal() {
  const goalConfig = dietData[lastCalculatedData.goal];
  const target = lastCalculatedData.target;

  document.getElementById('diet-plan-title').textContent = goalConfig.title;
  document.getElementById('diet-calories-sum').textContent = `${target.toLocaleString()} kcal/day`;

  // Macro distribution calculations
  const proteinGrams = Math.round((target * goalConfig.macrosPct.p) / 4); // 4 kcal per gram of protein
  const carbsGrams = Math.round((target * goalConfig.macrosPct.c) / 4);   // 4 kcal per gram of carb
  const fatGrams = Math.round((target * goalConfig.macrosPct.f) / 9);     // 9 kcal per gram of fat

  document.getElementById('macro-protein').textContent = `${proteinGrams}g`;
  document.getElementById('macro-protein-pct').textContent = `(${Math.round(goalConfig.macrosPct.p * 100)}%)`;

  document.getElementById('macro-carbs').textContent = `${carbsGrams}g`;
  document.getElementById('macro-carbs-pct').textContent = `(${Math.round(goalConfig.macrosPct.c * 100)}%)`;

  document.getElementById('macro-fats').textContent = `${fatGrams}g`;
  document.getElementById('macro-fats-pct').textContent = `(${Math.round(goalConfig.macrosPct.f * 100)}%)`;

  // Populate Meals list
  const container = document.getElementById('meal-list-container');
  container.innerHTML = '';

  goalConfig.meals.forEach(m => {
    const mealEl = document.createElement('div');
    mealEl.className = 'meal-item';
    mealEl.innerHTML = `
      <div class="meal-title-wrap">
        <i class="fa-solid ${m.icon} meal-icon-tag"></i>
        <div>
          <div class="meal-name">${m.name}</div>
          <div class="meal-desc">${m.desc}</div>
        </div>
      </div>
      <div class="meal-cals">~ ${m.cals} kcal</div>
    `;
    container.appendChild(mealEl);
  });

  document.getElementById('diet-modal').classList.add('active');
}

function closeDietModal() {
  document.getElementById('diet-modal').classList.remove('active');
}

// Close modal when clicking outside of modal content
window.addEventListener('click', (e) => {
  const modal = document.getElementById('diet-modal');
  if (e.target === modal) {
    closeDietModal();
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  calculateCalories();
});