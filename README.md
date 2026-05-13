# Role-Play Frontend

English | [中文](docs/README_ZH.md)

<img src="https://github.com/smanx/role-play/blob/master/public/pwa-192x192.png?raw=true" alt="Role-Play Logo" width="128" />

A frontend application built with Vue 3 + Vite + TypeScript + Tailwind CSS.

## Project Overview

Role-Play is an LLM-based role-play chat application that supports:

- 🎭 Create and manage custom characters
- 💬 Have smooth conversations with AI characters
- 🌍 World Info and regex scripts to enhance character settings
- 📱 Responsive design, supporting PC and mobile
- 🔄 Chat history synchronization (after login)
- 👥 Group chat with multi-character interaction
- 📤 Character import/export with multiple formats
- 🎨 Theme switching and personalized settings
- 📦 Offline PWA support

## Screenshots

### PC
<img src="https://github.com/smanx/role-play/blob/master/docs/imgs/pc-home-light.jpg?raw=true" alt="PC Home" width="800" />

### Mobile
<div align="center">
  <img src="https://github.com/smanx/role-play/blob/master/docs/imgs/phone-home-list.jpg?raw=true" alt="Mobile List" width="300" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://github.com/smanx/role-play/blob/master/docs/imgs/phone-home-chat.jpg?raw=true" alt="Mobile Chat" width="300" />
</div>

## Try Online

🚀 **[https://rp.good.hidns.vip/](https://rp.good.hidns.vip/)**

## Tech Stack

- **Framework**: Vue 3 + TypeScript
- **Build**: Vite 5
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Routing**: Vue Router
- **PWA**: vite-plugin-pwa
- **Database**: IndexedDB (Dexie)
- **Markdown**: marked + dompurify
- **Drag & Drop**: sortablejs + vuedraggable
- **Compression**: pako

## Logged In vs Guest Features

| Feature | Guest | Logged In |
|---------|-------|-----------|
| Friend list | ✅ Local storage | ✅ Local storage |
| Chat history | ✅ Local storage | ✅ Local storage |
| LLM API configuration | ✅ Local storage | ✅ Local storage |
| Character import/export | ✅  | ✅  |
| Chat history import/export | ✅  | ✅  |
| Use built-in LLM | ❌ | ✅ |
| View character comments | ❌ | ✅ |
| Like characters | ❌ | ✅ |
| Add online characters | ❌ | ✅ |
| Share characters to online list | ❌ | ✅ |
| Sync and share chat history | ❌ | ✅ (manual trigger) |

## Development

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file:

```env
# Backend API URL (optional)
# Development mode: Leave empty to use Vite proxy
# Production mode: Set full backend URL
# Example: VITE_API_BASE_URL=http://192.168.1.100:3001/api
VITE_API_BASE_URL=

# Show login and admin entry (default false)
# Set to true to show login button and admin entry
VITE_SHOW_AUTH_ENTRY=false
```

## Responsive Design

The project supports PC and mobile:

- Uses Tailwind CSS responsive breakpoints
- Mobile-first design
- Touch-friendly interactions
- Minimum button size 48px

## PWA Support

Production builds automatically include PWA support:

- Offline access
- Add to home screen
- Automatic updates
- Google Fonts caching

### iOS Immersive Experience

iOS users can add the app to the home screen via Safari's "Add to Home Screen" feature. When launched from the home screen, the app runs in full-screen mode, hiding the Safari address bar and toolbar, providing a native app-like immersive experience.

<div align="center">
  <img src="https://github.com/smanx/role-play/blob/master/docs/imgs/phone-home-ios-pwa.jpg?raw=true" alt="ios app" width="300" />
</div>

## Main Dependencies

### Production Dependencies

- `vue` - Vue 3 framework
- `vue-router` - Routing management
- `pinia` - State management
- `dexie` - IndexedDB wrapper
- `marked` - Markdown parser
- `dompurify` - HTML sanitization
- `sortablejs` - Drag and drop sorting
- `vuedraggable` - Vue drag and drop component
- `pako` - Gzip compression/decompression

### Development Dependencies

- `vite` - Build tool
- `vite-plugin-pwa` - PWA plugin
- `typescript` - TypeScript support
- `tailwindcss` - CSS framework
- `postcss` - CSS processing
- `autoprefixer` - CSS auto-prefixing
- `sharp` - Image processing

## Build Configuration

### Vite Configuration

- Dev server port: 3000
- API proxy: `/api` -&gt; `http://localhost:3001`
- Build output: `../dist`
- Path alias: `@` -&gt; `src/`

### PWA Configuration

- App name: Role-Play
- Theme color: #1f2937
- Background color: #f3f4f6
- Display mode: standalone
- Cache strategy: CacheFirst (Google Fonts)

## IndexedDB Database

Database name: `SillyTavernDB`

Main storage:
- Chat history: `silly_tavern_chat_{characterID}`
- Character sprites
- Local character data
- User settings

## Development Guidelines

### Naming Conventions

- **File names**: kebab-case (e.g., `chat-view.ts`)
- **Component names**: PascalCase (e.g., `ChatView.vue`)
- **Variables/functions**: camelCase
- **CSS class names**: kebab-case (Tailwind CSS)

### Code Style

- Use TypeScript
- Use Vue 3 Composition API
- Use Pinia for state management
- Use Tailwind CSS for styling

## License

MIT License

Copyright (c) 2026 Role-Play Lab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
