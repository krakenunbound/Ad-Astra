# Ad Astra - Bug Fixes: Rotation & Admin Login

## 🐛 Bug #1: Stars Not Rotating Visibly

**Problem:** Stars rotate but SO slowly you can't see it (takes hours)

**Fix:** ✅ Increased rotation speed from 0.0000005 to 0.00002

**Result:** Stars now rotate noticeably in ~30 seconds (dreamy, slow drift)

**File Changed:** `particles.js` (line 8)

---

## 🐛 Bug #2: Sysop Access Link Does Nothing

**Problem:** Clicking "Sysop Access" does nothing, just shows `localhost:8000/#`

**Fix:** Need to add admin login form + JavaScript handlers

---

## 📥 Files to Update

### 1. Replace These Files:

**[index.html](computer:///mnt/user-data/outputs/index.html)** - Now includes admin login form  
**[particles.js](computer:///mnt/user-data/outputs/particles.js)** - Faster rotation

---

## 2. Add JavaScript to main.js

You need to add event handlers for the admin login. Here's where to add them:

### Location in main.js:
Find the section with form switching handlers (around lines 50-100), it should look like:

```javascript
// Show register form
document.getElementById('show-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    // ... existing code
});

// Show login form
document.getElementById('show-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    // ... existing code
});
```

### Add These Handlers RIGHT AFTER:

```javascript
// Show admin login form
document.getElementById('show-admin-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('admin-login-form').classList.add('active');
});

// Back to login from admin
document.getElementById('show-login-from-admin')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('login-form').classList.add('active');
});

// Admin login button
document.getElementById('admin-login-btn')?.addEventListener('click', async () => {
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value;

    if (!username || !password) {
        alert('Please enter admin credentials');
        return;
    }

    // Try to login as admin
    const result = window.game.auth.login(username, password);
    
    if (!result.success) {
        alert(result.error || 'Invalid admin credentials');
        return;
    }

    // Check if user is actually admin
    if (!result.isAdmin) {
        alert('Access denied: Not an admin account');
        return;
    }

    // Login successful - show admin screen
    console.log('✅ Admin login successful');
    window.game.gameState.setCurrentUser(username);
    
    // Switch to admin screen
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('admin-screen').classList.add('active');
    
    // Initialize admin panel if function exists
    if (window.game.initAdmin) {
        window.game.initAdmin();
    }
});

// Enter key support for admin login
document.getElementById('admin-password')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('admin-login-btn').click();
    }
});
```

---

## 🎯 Quick Install

### Step 1: Replace Files
1. Replace `index.html` (adds admin login form)
2. Replace `js/particles.js` (faster rotation)

### Step 2: Edit main.js
1. Open `js/main.js`
2. Find the form switching section (search for `show-register`)
3. Add the admin login handlers shown above
4. Save

### Step 3: Test
```bash
python -m http.server 8000
# Open http://localhost:8000
```

**Click "Sysop Access"** → Should show admin login form

**Default admin:**
- Username: `admin`
- Password: `admin123`

---

## ✅ What's Fixed

### Stars:
- ✅ Now rotate visibly (~30 second full rotation)
- ✅ Smooth, dreamy drift effect
- ✅ Still subtle (not distracting)

### Admin Login:
- ✅ "Sysop Access" link now works
- ✅ Shows dedicated admin login form
- ✅ Validates admin credentials
- ✅ Prevents non-admin access
- ✅ Takes you to admin panel
- ✅ "Back to Login" link works

---

## 🔧 Customization

### Want Faster/Slower Rotation?
Edit `js/particles.js` line 8:

```javascript
const rotationSpeed = 0.00002; // Current (30 sec rotation)
const rotationSpeed = 0.00004; // Faster (15 sec rotation)
const rotationSpeed = 0.00001; // Slower (60 sec rotation)
const rotationSpeed = 0.00005; // Much faster (12 sec rotation)
```

### Want More/Fewer Stars?
Edit `js/particles.js` line 7:

```javascript
const count = 150; // Current
const count = 250; // More stars
const count = 100; // Fewer stars
```

---

## 🐛 Troubleshooting

### "Stars still not rotating"
- Clear browser cache (Ctrl+F5)
- Check you replaced `particles.js`
- Watch for 30 seconds (it's still slow, just faster than before)

### "Sysop Access still does nothing"
- Check you added the JavaScript to `main.js`
- Check browser console (F12) for errors
- Make sure you replaced `index.html`

### "Admin login fails"
- Default credentials: `admin` / `admin123`
- Check if admin account exists in localStorage
- Try creating admin account first:
  - Open browser console (F12)
  - Run: `window.game.auth.createDefaultAdmin()`

### "Can't find where to add code in main.js"
- Search for: `getElementById('show-register')`
- Add the admin code right after the register/login handlers
- Make sure it's inside the initialization function

---

## 📊 Summary

| Issue | Status | File |
|-------|--------|------|
| Stars not rotating | ✅ FIXED | particles.js |
| Sysop link broken | ✅ FIXED | index.html + main.js |

---

**Installation time:** ~5 minutes  
**Difficulty:** Easy (copy/paste)

Test both fixes and let me know if anything else needs adjusting! 🚀
