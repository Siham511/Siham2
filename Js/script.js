"use strict";

const CONFIG = {
    whatsapp: "249900000000",
    phone: "0900000000",
    facebook: "#"
};

const KEYS = {
    products: "siham_products",
    sales: "siham_sales",
    marketers: "siham_marketers",
    orders: "siham_orders",
    webhook: "siham_webhook"
};

function getData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch { return []; }
}
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
function money(value) {
    return Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
}
function createTable(headers, rows) {
    const table = document.createElement("table");
    table.className = "data-table";
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    headers.forEach(header => { const th = document.createElement("th"); th.textContent = header; headRow.appendChild(th); });
    thead.appendChild(headRow); table.appendChild(thead);
    const tbody = document.createElement("tbody");
    rows.forEach(row => { const tr = document.createElement("tr"); row.forEach(value => { const td = document.createElement("td"); td.textContent = value ?? ""; tr.appendChild(td); }); tbody.appendChild(tr); });
    table.appendChild(tbody); return table;
}
function setupContactLinks() {
    const whatsappNumber = CONFIG.whatsapp.replace(/\D/g, "");
    const whatsappURL = "https://wa.me/" + whatsappNumber;
    ["waLinkTop", "floatWa"].forEach(id => { const link = document.getElementById(id); if (link) link.href = whatsappURL; });
}
function setupTabs() {
    const tabs = document.querySelectorAll(".tab[data-tab]");
    const pages = document.querySelectorAll(".page");
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            const targetId = this.dataset.tab;
            tabs.forEach(item => item.classList.remove("active"));
            pages.forEach(page => page.classList.remove("active"));
            this.classList.add("active");
            const target = document.getElementById(targetId);
            if (target) target.classList.add("active");
        });
    });
}
function setupProductForm() {
    const form = document.getElementById("productForm"); if (!form) return;
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const barcode = document.getElementById("pBarcode").value.trim();
        const name = document.getElementById("pName").value.trim();
        const cost = Number(document.getElementById("pCost").value);
        const sell = Number(document.getElementById("pSell").value);
        const qty = Number(document.getElementById("pQty").value);
        if (!barcode || !name || cost < 0 || sell < 0 || qty < 0) { alert("راجعي بيانات المنتج."); return; }
        const products = getData(KEYS.products);
        if (products.some(product => product.barcode === barcode)) { alert("الباركود مسجل من قبل."); return; }
        products.push({ barcode, name, cost, sell, qty });
        saveData(KEYS.products, products); form.reset(); renderProducts(); updateReports();
    });
}
function renderProducts() {
    const container = document.getElementById("productTable"); if (!container) return;
    const products = getData(KEYS.products); container.replaceChildren();
    if (!products.length) { container.textContent = "لا توجد منتجات مسجلة."; }
    else {
        const rows = products.map(p => [p.barcode, p.name, money(p.cost) + " ج", money(p.sell) + " ج", String(p.qty)]);
        container.appendChild(createTable(["الباركود", "اسم المنتج", "سعر الشراء", "سعر البيع", "الكمية"], rows));
    }
    renderOnlineProducts();
}
function renderOnlineProducts() {
    const container = document.getElementById("onlineProducts"); if (!container) return;
    const products = getData(KEYS.products); const available = products.filter(p => Number(p.qty) > 0);
    container.replaceChildren();
    if (!available.length) { container.textContent = "لا توجد منتجات متاحة حاليًا."; return; }
    const rows = available.map(p => [p.name, money(p.sell) + " ج", String(p.qty)]);
    container.appendChild(createTable(["اسم المنتج", "سعر البيع", "الكمية المتوفرة"], rows));
}
function setupMarketerForm() {
    const form = document.getElementById("marketerForm"); if (!form) return;
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = document.getElementById("mName").value.trim();
        const phone = document.getElementById("mPhone").value.trim();
        const account = document.getElementById("mAcc").value.trim();
        const commission = Number(document.getElementById("mComm").value);
        if (!name || commission < 0 || commission > 100) { alert("أدخلي اسم المسوق وتأكدي من نسبة العمولة."); return; }
        const marketers = getData(KEYS.marketers);
        marketers.push({ id: String(Date.now()) + Math.random().toString(16).slice(2), name, phone, account, commission });
        saveData(KEYS.marketers, marketers); form.reset(); document.getElementById("mComm").value = "0"; renderMarketers();
    });
}
function renderMarketers() {
    const container = document.getElementById("marketerTable"); const select = document.getElementById("marketerSelectPos");
    const marketers = getData(KEYS.marketers);
    if (select) {
        const previousValue = select.value; select.replaceChildren();
        const defaultOption = document.createElement("option"); defaultOption.value = ""; defaultOption.textContent = "بدون مسوق"; select.appendChild(defaultOption);
        marketers.forEach(m => { const option = document.createElement("option"); option.value = m.id; option.textContent = m.name; select.appendChild(option); });
        select.value = previousValue;
    }
    if (!container) return; container.replaceChildren();
    if (!marketers.length) { container.textContent = "لا يوجد مسوقون مسجلون."; return; }
    const rows = marketers.map(m => [m.name, m.phone || "—", m.account || "—", String(m.commission) + "%"]);
    container.appendChild(createTable(["اسم المسوق", "رقم الهاتف", "حساب بنكك", "العمولة"], rows));
}
function setupSaleForm() {
    const form = document.getElementById("saleForm"); if (!form) return;
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const barcode = document.getElementById("barcodeInput").value.trim();
        const marketerId = document.getElementById("marketerSelectPos").value;
        const products = getData(KEYS.products); const product = products.find(item => item.barcode === barcode);
        if (!product) { alert("المنتج غير موجود."); return; }
        if (Number(product.qty) < 1) { alert("المنتج غير متوفر."); return; }
        const marketers = getData(KEYS.marketers); const marketer = marketers.find(item => item.id === marketerId);
        const sell = Number(product.sell); const cost = Number(product.cost); const commissionRate = marketer ? Number(marketer.commission) : 0;
        const commission = sell * commissionRate / 100; product.qty = Number(product.qty) - 1; saveData(KEYS.products, products);
        const sales = getData(KEYS.sales);
        sales.push({ id: String(Date.now()), barcode: product.barcode, name: product.name, sell, cost, commission, marketerName: marketer ? marketer.name : "", date: new Date().toLocaleString() });
        saveData(KEYS.sales, sales); const lastSale = document.getElementById("lastSale"); if (lastSale) lastSale.textContent = "تم بيع " + product.name + " بسعر " + money(sell) + " ج.";
        form.reset(); renderProducts(); renderSales(); updateReports();
    });
}
function renderSales() {
    const container = document.getElementById("salesList"); if (!container) return;
    const sales = getData(KEYS.sales); container.replaceChildren();
    if (!sales.length) { container.textContent = "لا توجد مبيعات مسجلة."; return; }
    const rows = sales.slice().reverse().map(s => [s.date, s.name, money(s.sell) + " ج", s.marketerName || "بدون مسوق", money(s.commission) + " ج"]);
    container.appendChild(createTable(["التاريخ", "المنتج", "سعر البيع", "المسوق", "العمولة"], rows));
}
function updateReports() {
    const sales = getData(KEYS.sales);
    const totalSales = sales.reduce((sum, s) => sum + Number(s.sell || 0), 0);
    const totalCost = sales.reduce((sum, s) => sum + Number(s.cost || 0), 0);
    const totalComm = sales.reduce((sum, s) => sum + Number(s.commission || 0), 0);
    const netProfit = totalSales - totalCost - totalComm;
    const fields = { totalSales, totalCost, totalComm, netProfit };
    Object.entries(fields).forEach(([id, value]) => { const element = document.getElementById(id); if (element) element.textContent = money(value); });
}
function setupClearAll() {
    const button = document.querySelector('[data-action="clear-all"]'); if (!button) return;
    button.addEventListener("click", function () {
        if (!confirm("هل أنتِ متأكدة؟ سيتم حذف كل البيانات المحفوظة.")) return;
        Object.values(KEYS).forEach(key => localStorage.removeItem(key));
        renderProducts(); renderMarketers(); renderSales(); renderOrders(); updateReports();
    });
}
function setupWebhook() {
    const form = document.getElementById("webhookForm"); const input = document.getElementById("webhookUrl");
    if (input) input.value = localStorage.getItem(KEYS.webhook) || "";
    if (form) { form.addEventListener("submit", function (event) { event.preventDefault(); const url = input.value.trim(); localStorage.setItem(KEYS.webhook, url); alert("تم حفظ الرابط."); }); }
}
function renderOrders() {
    const container = document.getElementById("fbOrdersList"); if (!container) return;
    const orders = getData(KEYS.orders); container.replaceChildren();
    if (!orders.length) { container.textContent = "لا توجد طلبات مستوردة."; return; }
    const rows = orders.map(o => [o.name || "—", o.phone || "—", o.product || "—", o.status || "جديد"]);
    container.appendChild(createTable(["العميل", "رقم الهاتف", "المنتج", "الحالة"], rows));
}

/* === تم التعديل هنا - زر الخروج يودي لـ index.html === */
function setupLogout() {
    document.body.addEventListener("click", function(e){
        const btn = e.target.closest('[data-action="logout"]');
        if (!btn) return;
        e.preventDefault();
        if(!confirm("هل أنتِ متأكدة من تسجيل الخروج؟")) return;
        sessionStorage.clear();
        localStorage.removeItem("siham_demo_login");
        localStorage.removeItem("siham_demo_user");
        window.location.href = "./index.html";
    });
}

document.addEventListener("DOMContentLoaded", function () {
    setupContactLinks(); setupTabs(); setupProductForm(); setupMarketerForm(); setupSaleForm(); setupClearAll(); setupWebhook(); setupLogout();
    renderProducts(); renderMarketers(); renderSales(); updateReports();
});
