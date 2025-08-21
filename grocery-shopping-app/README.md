# Grocery Shopping App

## Overview
The Grocery Shopping App is a mobile-optimized web application designed to streamline the grocery shopping experience. It allows users to manage their grocery inventory and create shopping lists efficiently.

## Features
- **Master Inventory List**: Users can add, edit, and delete frequently purchased items.
- **Quick Shopping List Creation**: Easily create shopping lists by selecting items from the master inventory.
- **Check-off Functionality**: Users can check off items as they shop.
- **Web Share API Integration**: Share shopping lists with others using the native web share functionality.
- **Categories/Sections**: Organize items into categories such as produce, dairy, etc.
- **Quantity Fields**: Specify quantities for each item in the shopping list.
- **Search/Filter Functionality**: Quickly find items in large master lists.
- **List Management**: Options to clear completed items or clear all items in the shopping list.
- **Responsive Design**: Mobile-first design with large, touch-friendly buttons and checkboxes.
- **Dark Mode**: Enhanced visibility in stores with a dark mode option.
- **Offline Functionality**: Access the app without an internet connection.
- **Statistics**: View simple statistics like most bought items.

## Technical Specifications
- **Data Persistence**: Utilizes localStorage for saving and retrieving data.
- **File Structure**:
  - `src/index.html`: Main HTML document.
  - `src/css/main.css`: Primary styles for the app.
  - `src/css/responsive.css`: Mobile-specific styles.
  - `src/js/app.js`: Core functionality and user interactions.
  - `src/js/storage.js`: Data management with localStorage.
  - `src/js/ui.js`: User interface interactions.
  - `src/js/share.js`: Web share API integration.
  - `src/assets/icons/`: Contains SVG icons for various functionalities.
- **Manifest**: `manifest.json` provides metadata for the web app.

## Setup Instructions
1. Clone the repository to your local machine.
2. Open the `index.html` file in a web browser to run the app.
3. Ensure that your browser supports the Web Share API for sharing functionality.

## Usage Guidelines
- Use the master inventory list to manage your frequently purchased items.
- Create a shopping list by selecting items from the master list.
- Check off items as you shop for a more organized experience.
- Share your shopping list with friends or family using the share feature.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.