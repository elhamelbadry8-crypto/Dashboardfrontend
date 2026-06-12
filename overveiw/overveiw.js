(function() {
    const manager = localStorage.getItem(\"manager\");
    if (!manager) {
        window.location.href = \"../login/login.html\"; 
    }
})();
const API = "https://elham-33-dashboard.hf.space/manager";

// ===== UI Elements =====
const sidebar = document.getElementById('sidebar');
const sidebarArrow = document.getElementById('sidebar-arrow');
const mobileToggle = document.getElementById('mobile-sidebar-toggle');
const closeSidebarBtn = document.getElementById('close-sidebar'); 
const sidebarOverlay = document.getElementById('sidebar-overlay'); 
const btnLogout = document.getElementById('btn-logout');
const themeToggle = document.getElementById('theme-toggle');

// ===== LIGHT / DARK MODE TOGGLE =====
const currentTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        theme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
        loadMainOverview(); 
    });
}
function updateThemeIcon(theme) {
    if(themeToggle) {
        if(theme === 'light') {
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    }
}

// ===== SIDEBAR LOGIC =====
if(sidebarArrow) {
    sidebarArrow.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
}
if(mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        sidebar.classList.add('mobile-active');
        sidebarOverlay.classList.add('active');
    });
}
const closeSidebar = () => {
    sidebar.classList.remove('mobile-active');
    sidebarOverlay.classList.remove('active');
};
if(closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
if(sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        const target = this.dataset.target;
        if(target && target !== '#') window.location.href = target;
    });
});

// Logout
if(btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem("manager");
        window.location.href = "../login/login.html";
    });
}

const getEl = (id) => document.getElementById(id);

// ===== FETCH & RENDER OVERVIEW DATA =====
const loadMainOverview = async () => {
    try {
        const res = await fetch(API + '/overview');
        if(!res.ok) throw new Error("فشل جلب البيانات من السيرفر");
        const data = await res.json();

        // Cards values
        if(getEl('today-revenue')) getEl('today-revenue').textContent = data.today_revenue.toLocaleString() + " EGP";
        if(getEl('today-orders')) getEl('today-orders').textContent = data.today_orders;
        if(getEl('active-reservations')) getEl('active-reservations').textContent = data.active_reservations;
        if(getEl('avg-rating')) getEl('avg-rating').textContent = data.avg_rating.toFixed(1) + " / 5";

        // Recent Orders Table
        const tbody = document.querySelector('.table-responsive tbody');
        if(tbody) {
            if(!data.recent_orders || data.recent_orders.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">لا توجد طلبات اليوم حتى الآن</td></tr>`;
            } else {
                tbody.innerHTML = data.recent_orders.map(o => {
                    let statusClass = "badge-pending";
                    if(o.status === "Completed") statusClass = "badge-success";
                    if(o.status === "Cancelled") statusClass = "badge-danger";
                    if(o.status === "Preparing") statusClass = "badge-warning";

                    return `
                        <tr>
                            <td>#${o.order_id}</td>
                            <td>${o.type}</td>
                            <td>${o.total} EGP</td>
                            <td><span class="badge ${statusClass}">${o.status}</span></td>
                            <td>${o.time}</td>
                        </tr>
                    `;
                }).join('');
            }
        }
    } catch (err) {
        console.error("Overview Fetch Error:", err);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadMainOverview();
    loadCashiers();
});

// ===== RESET PASSWORD MODAL LOGIC =====
const modal = document.getElementById("resetPasswordModal");
const openBtn = document.getElementById("openResetModalBtn");
const closeBtn = document.querySelector(".close-modal");

if(openBtn) {
    openBtn.onclick = function() { modal.style.display = "flex"; }
}
if(closeBtn) {
    closeBtn.onclick = function() { modal.style.display = "none"; }
}
window.onclick = function(event) {
    if (event.target == modal) { modal.style.display = "none"; }
}

function loadCashiers() {
    fetch(API + '/cashiers')
    .then(res => res.json())
    .then(data => {
        let select = document.getElementById("cashierSelect");
        if(select) {
            select.innerHTML = '<option value="">اختر كاشير...</option>' + 
                data.map(c => `<option value="${c.staff_id}">${c.name} (${c.role})</option>`).join('');
        }
    })
    .catch(err => console.error("Error loading cashiers:", err));
}

function submitReset() {
    let staff_id = document.getElementById("cashierSelect").value;
    let password = document.getElementById("newPassword").value;

    if (!staff_id) {
        alert("Please select a cashier");
        return;
    }
    if (!password || password.length < 8) {
        alert("Password must be at least 8 characters");
        return;
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!regex.test(password)) {
        alert("Password must contain uppercase, lowercase, number, and special character");
        return;
    }

    // 👈 تم تعديل الرابط هنا ليكون ديناميكياً ويشير إلى الهجينج فيس أونلاين مباشرة بدلاً من Localhost
    fetch(`${API}/reset-password/${staff_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password })
    })
    .then(res => {
        if (!res.ok) return res.json().then(err => { throw err; });
        return res.json();
    })
    .then(data => {
        alert("Password reset successfully!");
        modal.style.display = "none";
        document.getElementById("newPassword").value = "";
        document.getElementById("cashierSelect").value = "";
    })
    .catch(err => {
        console.error("Reset password error:", err);
        alert(err.message || "Error resetting password");
    });
}
