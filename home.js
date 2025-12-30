

const APP_ID = "9177cc1c"; 
const APP_KEY = "9f153da4b14fc9ebdbbe7ff9c3d5e699"; 

let baseNutrientsPer100g = null;

// Initialization
window.onload = () => {
    loadHistory();
};

// Search Logic
document.getElementById('searchBtn').addEventListener('click', () => {
    const foodName = document.getElementById('foodInput').value;
    if (foodName) {
        searchFood(foodName);
    }
});

async function searchFood(query) {
    const url = `https://api.edamam.com/api/food-database/v2/parser?app_id=${APP_ID}&app_key=${APP_KEY}&ingr=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.hints && data.hints.length > 0) {
            const food = data.hints[0].food;
            
            baseNutrientsPer100g = {
                name: food.label,
                calories: food.nutrients.ENERC_KCAL || 0,
                protein: food.nutrients.PROCNT || 0,
                carbs: food.nutrients.CHOCDF || 0,
                fats: food.nutrients.FAT || 0
            };

            document.getElementById('foodWeight').value = 100;
            updateByWeight(100);
            saveToLocalStorage(food.label, Math.round(baseNutrientsPer100g.calories));
        } else {
            alert("Food not found!");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Weight Calculation Logic
document.getElementById('foodWeight').addEventListener('input', (e) => {
    const weight = parseFloat(e.target.value) || 0;
    updateByWeight(weight);
});

function updateByWeight(grams) {
    if (!baseNutrientsPer100g) return;

    const factor = grams / 100;
    const totalCals = Math.round(baseNutrientsPer100g.calories * factor);
    const totalP = (baseNutrientsPer100g.protein * factor).toFixed(1);
    const totalC = (baseNutrientsPer100g.carbs * factor).toFixed(1);
    const totalF = (baseNutrientsPer100g.fats * factor).toFixed(1);

    document.getElementById('foodName').innerText = baseNutrientsPer100g.name;
    document.getElementById('calories').innerText = totalCals;
    
    const values = document.querySelectorAll('.macro-item .value');
    values[0].innerText = `${totalP}g`;
    values[1].innerText = `${totalC}g`;
    values[2].innerText = `${totalF}g`;

    document.querySelector('.bar-fill.protein').style.width = Math.min((totalP / 50) * 100, 100) + "%";
    document.querySelector('.bar-fill.carbs').style.width = Math.min((totalC / 50) * 100, 100) + "%";
    document.querySelector('.bar-fill.fats').style.width = Math.min((totalF / 50) * 100, 100) + "%";
}

// History/Local Storage Logic
function saveToLocalStorage(name, kcal) {
    let history = JSON.parse(localStorage.getItem('foodHistory')) || [];
    history.unshift({ name, kcal });
    if (history.length > 10) history.pop();
    localStorage.setItem('foodHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const historyList = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('foodHistory')) || [];
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-msg">No items searched yet.</p>';
        return;
    }

    historyList.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<strong>${item.name}</strong>: ${item.kcal} kcal`;
        historyList.appendChild(div);
    });
}
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (!user) {
        // If not logged in, send them back to the login page
        window.location.href = "index.html";
    } else {
        console.log("Welcome,", user.email);
    }
});