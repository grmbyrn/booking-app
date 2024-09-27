# Full Stack Booking App

## Overview

Welcome to the Full Stack Booking App project built from scratch using the MERN stack (MongoDB, Express, React, Node.js). This application allows users to browse and book accommodations, manage their bookings, and create new listings seamlessly.

## Features

- **Homepage**:
  - Display all available places to book.
  - Clickable listings that reveal detailed information about each place, including:
    - Title
    - Link to Google Maps
    - Photos gallery with a modal view for an enhanced browsing experience.
- **Place Page**:

  - Description and detailed information on the left side.
  - Booking functionality using date pickers.
  - Additional information and perks about each accommodation.

- **User Authentication**:
  - User login and registration functionality.
- **User Account Management**:
  - View and manage bookings.
  - Access previous bookings with detailed information and photos.
- **Accommodation Management**:
  - Create, edit, and delete listings.
  - Update listing details such as:
    - Title
    - Address
    - Photos (upload from computer or via link)
    - Description
    - Perks
    - Pricing
    - Check-in and check-out times

## Tech Stack

This project is built using the following technologies:

- **Frontend**: React
- **Backend**: Node.js with Express
- **Database**: MongoDB

## Installation

Follow these steps to set up the project locally:

1. **Fork the repository**:

   - Click the "Fork" button at the top right of this repository's page.

2. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

3. Install dependencies for the backend: Navigate to the backend directory and install dependencies:

   ```bash
   cd api
   npm install
   ```

4. Install dependencies for the frontend: Navigate to the frontend directory and install dependencies:

   ```bash
   cd client
   npm install
   ```

5. Set up the database: Make sure you have MongoDB running and update the database connection string in the backend configuration.

6. Run the application:

- Start the backend server:

  ```bash
  cd api
  nodemon index.js
  ```

- Start the frontend development server:
  ```bash
  cd client
  npm run dev
  ```
