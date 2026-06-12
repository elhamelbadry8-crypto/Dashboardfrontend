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
    if (loginError) {
        const span = loginError.querySelector('span');
        if (span) span.textContent = msg;
        loginError.style.display = "flex";
    } else {
        alert(msg); // حماية إضافية في حال عدم وجود العنصر في الـ HTML
    }
};

const hideError = () => {
    if (loginError) loginError.style.display = "none";
};

// ===== LOGIN LOGIC =====
const performLogin = async () => {
    hideError();
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (!usernameInput || !passwordInput) {
        return showError("فشل العثور على عناصر الإدخال في صفحة HTML");
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        return showError("الرجاء إدخال اسم المستخدم وكلمة المرور كاملة");
    }

    // Button Loading State
    const originalBtnHtml = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
    loginBtn.disabled = true;

    try {
        console.log("جاري إرسال الطلب إلى السيرفر...");
        const res = await fetch(API, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        // طباعة حالة الـ Response في الـ Console لمعرفة الـ HTTP Status Code (مثال: 200, 400, 500)
        console.log("حالة استجابة السيرفر Status Code:", res.status);

        if (!res.ok) {
            // إذا كان هناك خطأ في السيرفر (مثل 500 أو 404) نقرأ نص الخطأ أولاً
            const errorText = await res.text();
            throw new Error(`خطأ من السيرفر (${res.status}): ${errorText || res.statusText}`);
        }

        const data = await res.json();
        console.log("البيانات المستلمة من السيرفر:", data);

        // التحقق من نجاح عملية تسجيل الدخول
        if (data && data.success === true) {
            localStorage.setItem("manager", JSON.stringify({
                staff_id: data.staff_id,
                role: data.role,
                name: data.name
            }));
            
            console.log("تم حفظ البيانات بنجاح! جاري التوجيه...");
            
            // التوجيه إلى صفحة الـ overview (تأكدي من صحة الحروف الإملائية للفولدر لديكِ)
            window.location.href = "../overview/overview.html"; 
        } else {
            // عرض رسالة الخطأ القادمة من الباك إند أو الرسالة الافتراضية
            showError(data.message || "اسم المستخدم أو كلمة المرور غير صحيحة.");
            loginBtn.innerHTML = originalBtnHtml;
            loginBtn.disabled = false;
        }
    } catch (err) {
        console.error("تفاصيل الخطأ بالكامل في الـ Console:", err);
        
        // عرض الخطأ الفعلي للمستخدم ليسهل عليكِ معرفة السبب فوراً دون فتح الـ Console
        showError("حدث خطأ أثناء الاتصال: " + err.message);
        
        loginBtn.innerHTML = originalBtnHtml;
        loginBtn.disabled = false;
    }
};

if (loginBtn) {
    loginBtn.addEventListener('click', performLogin);
}

// ===== TRIGGER LOGIN ON ENTER KEY =====
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        performLogin();
    }
});
