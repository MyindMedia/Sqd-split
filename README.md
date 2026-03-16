# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

# Sqd Split

A premium, real-time bill-splitting application built with **React**, **Convex**, and **Expo**.

## 🚀 Key Features
- **Real-time Splitting**: Sync claims instantly across all participants.
- **Proportional Tax**: Intelligent tax distribution based on item claims.
- **Individual Gratuity**: Customizable tip percentages per user.
- **Native & Web**: Built for the web with Netlify and native mobile with Expo/EAS.

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Convex account (free tier)

### 2. Backend (Convex)
Initialize your backend and sync the schema:
```bash
npm install
npx convex dev
```

### 3. Frontend Environment
Create a `.env.local` file and add your Convex URL:
```env
VITE_CONVEX_URL=https://your-deployment-url.convex.cloud
```

### 4. Running the App
- **Web (Vite)**: `npm run dev`
- **Native (Expo)**: `npx expo start`

### 5. Native Build (EAS)
```bash
npm install -g eas-cli
eas build --platform ios # or android
```

## 🎨 Tech Stack
- **Frontend**: React (SDK 52/React 18.3.1)
- **Backend**: Convex
- **Styling**: Vanilla CSS (Luminous Minimalist Theme)
- **Deployment**: Netlify (Web) / EAS (Mobile)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
