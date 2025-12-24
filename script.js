// ===============================
// GLOBAL
// ===============================
let editingProductIndex = null;

// ===============================
// HILFSFUNKTIONEN
// ===============================
function closeAllPopups() {
  document.querySelectorAll(".popUp").forEach(p => p.style.display = "none");
}

function getBudget() {
  return parseFloat(localStorage.getItem("budget")) || 0;
}

function setBudget(value) {
  localStorage.setItem("budget", value.toFixed(2));
  document.getElementById("budgetValue").innerText =
    value.toFixed(2).replace(".", ",") + " €";
}

function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

function renderProducts() {
  const list = document.querySelector(".product-list");
  list.innerHTML = "";

  const products = getProducts();

  products.forEach((p, index) => {
    const item = document.createElement("div");
    item.className = "product-item";
    item.dataset.index = index;

    item.innerHTML = `
      <span class="product-name">${p.name}</span>
      <span class="product-amount">${p.amount}</span>
      <span class="product-price">${p.price.toFixed(2).replace(".", ",")} €</span>
      <div class="product-actions">
        <button class="edit-product">✏️</button>
        <button class="delete-product">🗑️</button>
      </div>
    `;
    list.appendChild(item);
  });
}

// ===============================
// SEITENSTART
// ===============================
window.addEventListener("load", () => {
  closeAllPopups();

  const budget = localStorage.getItem("budget");
  const lastSet = localStorage.getItem("lastSet");
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  if (!budget || !lastSet || now - lastSet > THIRTY_DAYS) {
    document.getElementById("setBudgetPopup").style.display = "flex";
  } else {
    setBudget(parseFloat(budget));
    document.getElementById("currentBudgetPopup").innerText =
      parseFloat(budget).toFixed(2).replace(".", ",") + " €";

    document.getElementById("welcomePopup").style.display = "flex";
    setTimeout(closeAllPopups, 5000);
  }

  renderProducts();
});

// ===============================
// BUDGET SPEICHERN
// ===============================
document.getElementById("saveBudget").addEventListener("click", () => {
  const value = parseFloat(document.getElementById("startBudget").value);
  if (!value || value <= 0) return alert("Ungültiges Budget");

  localStorage.setItem("budget", value);
  localStorage.setItem("lastSet", Date.now());

  setBudget(value);
  closeAllPopups();
});

// ===============================
// BUDGET BEARBEITEN
// ===============================
document.getElementById("editBudget").addEventListener("click", () => {
  document.getElementById("startBudget").value = getBudget();
  document.getElementById("setBudgetPopup").style.display = "flex";
});

// ===============================
// PRODUKT HINZUFÜGEN
// ===============================
document.getElementById("add").addEventListener("click", () => {
  editingProductIndex = null;
  document.getElementById("productName").value = "";
  document.getElementById("productAmount").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("addProductPopup").style.display = "flex";
});

// ===============================
// PRODUKT ABBRECHEN
// ===============================
document.getElementById("cancelProduct").addEventListener("click", () => {
  editingProductIndex = null;
  document.getElementById("addProductPopup").style.display = "none";
});

// ===============================
// PRODUKT SPEICHERN (ADD / EDIT)
// ===============================
document.getElementById("saveProduct").addEventListener("click", () => {
  const name = document.getElementById("productName").value.trim();
  const amount = parseInt(document.getElementById("productAmount").value);
  const price = parseFloat(document.getElementById("productPrice").value);

  if (!name || amount <= 0 || price <= 0) {
    return alert("Bitte gültige Werte eingeben");
  }

  const products = getProducts();
  const total = amount * price;
  let budget = getBudget();

  if (editingProductIndex !== null) {
    const old = products[editingProductIndex];
    const oldTotal = old.amount * old.price;
    const diff = total - oldTotal;

    if (budget - diff < 0) return alert("Budget reicht nicht");

    budget -= diff;
    products[editingProductIndex] = { name, amount, price };
  } else {
    if (budget - total < 0) return alert("Budget reicht nicht");

    budget -= total;
    products.push({ name, amount, price });
  }

  saveProducts(products);
  setBudget(budget);
  renderProducts();

  editingProductIndex = null;
  document.getElementById("addProductPopup").style.display = "none";
});

// ===============================
// EDIT / DELETE
// ===============================
document.querySelector(".product-list").addEventListener("click", e => {
  const item = e.target.closest(".product-item");
  if (!item) return;

  const index = parseInt(item.dataset.index);
  const products = getProducts();

  // ✏️ EDIT
  if (e.target.classList.contains("edit-product")) {
    const p = products[index];
    editingProductIndex = index;

    document.getElementById("productName").value = p.name;
    document.getElementById("productAmount").value = p.amount;
    document.getElementById("productPrice").value = p.price;

    document.getElementById("addProductPopup").style.display = "flex";
  }

  // 🗑️ DELETE
  if (e.target.classList.contains("delete-product")) {
    if (!confirm("Produkt wirklich löschen?")) return;

    const p = products[index];
    setBudget(getBudget() + p.amount * p.price);

    products.splice(index, 1);
    saveProducts(products);
    renderProducts();
  }
});
