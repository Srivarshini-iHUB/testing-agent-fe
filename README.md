# Testing Agents Dashboard

A comprehensive AI-powered testing platform built with React, featuring specialized testing agents for automated software quality assurance.

## Features

- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 19** - Latest React with modern features
- 🎨 **Tailwind CSS v3** - Utility-first CSS framework with custom configuration
- 🧭 **React Router** - Client-side routing with navigation
- 🌙 **Theme System** - Dark/Light mode with system preference detection
- 📱 **Responsive Design** - Mobile-first responsive layout
- 🤖 **AI Testing Agents** - Specialized testing automation tools

## Testing Agents

### 🧪 Unit Testing Agent
- Automated unit test generation and execution
- Support for Jest, Mocha, Vitest, and Cypress
- Code coverage analysis and optimization
- Mock object creation and assertion testing

### 📝 Test Case Generator
- Intelligent test case creation from requirements
- Natural language processing for user stories
- Automatic categorization and priority assignment
- Edge case detection and test data generation

### 🔄 End-to-End Testing Agent
- Complete user workflow testing
- Multi-browser compatibility testing
- API integration and database validation
- Cross-device testing with screenshot capture

### 👁️ Visual Testing Agent
- Automated visual regression testing
- Pixel-perfect UI consistency validation
- Cross-browser visual comparison
- Responsive design and accessibility testing

## Project Structure

```
src/
├── components/
│   └── AppRouter.jsx              # Main router with navigation
├── contexts/
│   └── ThemeContext.jsx           # Theme context and provider
├── pages/
│   ├── Dashboard.jsx              # Main dashboard overview
│   ├── UnitTestingAgent.jsx      # Unit testing interface
│   ├── TestCaseGenerator.jsx      # Test case generation tool
│   ├── E2ETestingAgent.jsx       # End-to-end testing interface
│   └── VisualTestingAgent.jsx    # Visual testing interface
├── App.jsx                       # Main app component
├── main.jsx                      # App entry point
└── index.css                     # Tailwind CSS imports and custom styles
```

## Theme System

The application includes a comprehensive theme system with:

- **Automatic Detection**: Detects system preference on first visit
- **Persistent Storage**: Remembers user's theme choice in localStorage
- **Smooth Transitions**: CSS transitions for theme changes
- **Custom Colors**: Extended color palette with primary and secondary colors
- **Dark Mode Support**: Full dark mode implementation

## Tailwind Configuration

Custom Tailwind configuration includes:

- **Custom Colors**: Primary and secondary color palettes
- **Dark Mode**: Class-based dark mode strategy
- **Custom Animations**: Fade-in and slide-in animations
- **Component Classes**: Pre-built component styles (buttons, cards, nav links)
- **Typography**: Inter font family integration

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- **React 19** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS v3** - Styling framework
- **React Router DOM** - Routing library
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## Customization

### Adding New Testing Agents

1. Create a new agent component in `src/pages/`
2. Add the route to `src/components/AppRouter.jsx`
3. Add navigation link to the `navItems` array
4. Update the dashboard with the new agent card

### Customizing Theme

1. Modify colors in `tailwind.config.js`
2. Update theme context in `src/contexts/ThemeContext.jsx`
3. Add custom CSS classes in `src/index.css`

### Styling Components

Use the pre-built component classes:
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.card` - Card container style
- `.nav-link` - Navigation link style

### Testing Agent Integration

Each testing agent is designed to be:
- **Modular** - Independent functionality
- **Configurable** - Customizable settings and parameters
- **Interactive** - Real-time feedback and progress tracking
- **Comprehensive** - Complete testing workflow coverage

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project as a starting point for your own applications!