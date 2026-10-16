/* === تسجيل الخروج - تم إصلاحه === */
function setupLogout() {
    const logoutButton = document.querySelector('[data-action="logout"]');
    if (!logoutButton) return;

    logoutButton.addEventListener("click", function (e) {
        e.preventDefault();
        // امسحي حالة الدخول
        sessionStorage.clear();
        localStorage.removeItem("siham_demo_login");
        localStorage.removeItem("siham_demo_user");
        // وديهو لصفحة الدخول - عدلتها ل Store ولا index حسب ملفك
        window.location.href = "index.html";
    });
}
