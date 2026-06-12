const API = "https://elham-33-dashboard.hf.space/login";
const loginError = document.getElementById('login-error');
const loginBtn = document.getElementById('login-btn');
const themeToggle = document.getElementById('theme-toggle');

// ===== LIGHT / DARK MODE TOGGLE =====
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        theme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
    });
}

function updateThemeIcon(theme) {
    if(themeToggle) {
        themeToggle.innerHTML = theme === 'light' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    }
}

// ===== ERROR HANDLING =====
const showError = (msg) => {
    loginError.querySelector('span').textContent = msg;
    loginError.style.display = "flex";
};

const hideError = () => {
    loginError.style.display = "none";
};

// ===== LOGIN LOGIC =====
const performLogin = async () => {
    hideError();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) return showError("Please fill username and password");

    // Button Loading State
    const originalBtnHtml = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
    loginBtn.disabled = true;

    try {
        const res = await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem("manager", JSON.stringify({
                staff_id: data.staff_id,
                role: data.role,
                name: data.name
            }));
            
            // Redirect to overview
            window.location.href = "../overveiw/overveiw.html";
        } else {
            showError(data.message || "Invalid username or password");
            loginBtn.innerHTML = originalBtnHtml;
            loginBtn.disabled = false;
        }
    } catch (err) {
        console.error("Login Error:", err);
        showError("Server error, please check connection.");
        loginBtn.innerHTML = originalBtnHtml;
        loginBtn.disabled = false;
    }
};

loginBtn?.addEventListener('click', performLogin);

// ===== TRIGGER LOGIN ON ENTER KEY =====
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        performLogin();
    }
});
