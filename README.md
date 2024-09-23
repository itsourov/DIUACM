# DIU ACM Website

This is a web application designed to manage attendance, classes, contests, and other events for the DIU ACM community. The project aims to streamline operations and introduce additional features like score calculation and individual progress tracking.

---

## Table of Contents

1. [Features](#features)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Running the Project](#running-the-project)
5. [Branching and Contributing](#branching-and-contributing)
6. [Contributors](#contributors)

---

## Features

- Attendance management for events (classes, contests, etc.)
- Individual contest tracker, Score Calculation
- Gallery for special events
- Educational and Informative Blog 
- Event notifications via email
- Future features: Individual practice tracker

---

## Requirements

Before setting up the project locally, ensure you have the following tools installed:

- PHP >= 8.2
- Composer
- MySQL (optional)
- Node.js & npm
- Git

---

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/itsourov/DIUACM.git
   cd DIUACM
   ```
2. **Install php libraries**:
    ```bash
    composer install
    ```
3. **Setup Project**:
    ```bash
    composer install
    cp .env.example .env
    php artisan key:generate
    ```
4. **Setup Database**:
    ```bash
    php artisan migrate
    ```
    run this if you need a fresh database
    ```bash
    php artisan migrate:fresh
    ```
    run this if you need a fresh database with random dummy data
    ```bash
    php artisan migrate:fresh --seed
    ```
5. **install npm packages**:
    ```bash
    npm install
    npm run dev
    ```
6. **Run local server**:
    ```bash
    php artisan serve
    ```

