# DIU ACM Website (Archived)

> ⚠️ **This repository is archived and no longer maintained.**  
> The DIU ACM website has been rewritten using a new framework and is now maintained at [**itsourov/diuacm-web**](https://github.com/itsourov/diuacm-web).

---

This project was originally built to manage attendance, classes, contests, and other events for the **DIU ACM** community. It helped streamline internal operations and introduced features like score calculation, email notifications, and more.

The project served its purpose well and laid the foundation for the current system.

---

## 🚀 What's in the New Version?

The new version of the website brings:

- A modern framework with better performance and maintainability  
- A fresh UI and improved UX  
- Enhanced features like individual practice tracking, leaderboard, and more

Check it out here: [https://github.com/itsourov/diuacm-web](https://github.com/itsourov/diuacm-web)

---

## 🧾 Original Documentation (For Reference)

### Features

- Attendance management for events (classes, contests, etc.)
- Individual contest tracker, score calculation
- Gallery for special events
- Educational and informative blog
- Event notifications via email
- Planned: individual practice tracker

### Requirements

- PHP >= 8.2  
- Composer  
- MySQL (optional)  
- Node.js & npm  
- Git  

### Installation

```bash
git clone https://github.com/itsourov/DIUACM.git
cd DIUACM
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run dev
php artisan serve
```

To reset the database:
```bash
php artisan migrate:fresh
```

To reset and seed with dummy data:
```bash
php artisan migrate:fresh --seed
```

---

Thanks to everyone who used this version of the DIU ACM website! 🎉  
Let’s continue building cool things together at [**diuacm-web**](https://github.com/itsourov/diuacm-web).
