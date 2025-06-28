

# Project Name

This is a front-end project built with Vue.js and Vite, primarily used for displaying and managing content related to strategies, maps, and scripts. The project has a clear structure and is suitable for the development and expansion of strategy-based applications.

## Project Overview

The project is mainly used to display the following functional modules:
- **Strategy Card List**: Displays various strategy cards.
- **Battle Strategy List**: Displays battle strategies.
- **Map Tree List**: Displays the structure of the map tree.
- **Script List and Details**: Displays script content and its detailed information.
- **Map Details**: Displays information related to maps.

The project utilizes Vue 3's Composition API and is built rapidly with Vite.

## Technology Stack

- Vue 3
- Vite
- JavaScript
- HTML/CSS

## Project Structure

```
├── public/                  # Static resources
├── src/                     # Source code
│   ├── components/          # Component directory
│   │   ├── LayoutMain.vue   # Main layout component
│   │   ├── details/         # Detail page components (map, script)
│   │   └── lists/           # List components (strategy, map, script, etc.)
│   ├── App.vue              # Root component
│   └── main.js              # Entry file
├── index.html               # HTML template
├── package.json             # Project dependencies and scripts
├── vite.config.js           # Vite configuration file
└── .env                     # Environment variable configuration
```

## Installation and Execution

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

This will start the development server locally, accessible by default at `http://localhost:3000`.

### Build Production Version

```bash
npm run build
```

The built files will be output to the `dist/` directory.

## Usage Instructions

- **Strategy Display**: Strategy cards and battle strategy lists can be viewed on the homepage.
- **Maps and Scripts**: Navigate to view the map tree, script list, and detailed information about maps and scripts.
- **Custom Development**: Components and functional modules can be extended as needed.

## Contribution Guide

We welcome code contributions and improvements to the project! Please follow these steps:

1. Fork the project repository.
2. Create a new branch (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push the branch (`git push origin feature/new-feature`).
5. Submit a Pull Request.

## License

This project is licensed under the MIT License. Please refer to the [LICENSE](LICENSE) file for details.