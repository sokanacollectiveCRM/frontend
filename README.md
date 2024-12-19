# Frontend Template

_2025 Discover Program Project Templates_

This template was created by the DISC tech leads of 2024-2025:

- [Amy Liao](https://www.linkedin.com/in/amyzliao/)
- [Ethan Pineda](https://www.linkedin.com/in/ethanpineda/)
- [Aanand Patel](https://www.linkedin.com/in/aanand-patel1/)

Check out DISC:

- [Website](https://disc-nu.github.io/disc-website/)
- [Github](https://github.com/DISC-NU)
- [DISCord](https://discord.gg/mqRQ7s9CyS)
- [Email](disc@u.northwestern.edu)

## Get started

### 1. Install dependencies

```
npm i
```

### 2. Set up formatting with Prettier and ESLint

If you are contributing to this repo, you must make sure ALL your code is
formatted according to our `eslint.config.mjs` and `.prettierrc.json` configs.
The best way to make sure you are always sticking to our guidelines is by having
prettier & eslint automatically format your code when you save.

Here's how to set that up:

- If you are using VSCode, do the following:

  1. Install the
     [Prettier ESLint VSCode extension](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint)
  2. Install the
     [ESLint VSCode extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  3. **Restart VSCode completely (quit app and reopen).**

- If you are NOT using VSCode, either use VSCode or you'll have to figure out
  how to format-on-save on your own.

Find more details about our linting config [here](#code-formatting-rules)

### 3. Run the app in development mode

```
npm start
```

## Additional scripts

Launch the test runner in interactive watch mode:

```
npm test
```

Create an optimized production build:

```
npm run build
```

# Frontend Template

_2025 Discover Program Project Templates_

This template was created by the DISC tech leads of 2024-2025:

- [Amy Liao](https://www.linkedin.com/in/amyzliao/)
- [Ethan Pineda](https://www.linkedin.com/in/ethanpineda/)
- [Aanand Patel](https://www.linkedin.com/in/aanand-patel1/)

Check out DISC:

- [Website](https://disc-nu.github.io/disc-website/)
- [Github](https://github.com/DISC-NU)
- [DISCord](https://discord.gg/mqRQ7s9CyS)
- [Email](disc@u.northwestern.edu)

## Get started

### 1. Install dependencies

```
npm i
```

### 2. Set up formatting with Prettier and ESLint

If you are contributing to this repo, you must make sure ALL your code is
formatted according to our `eslint.config.mjs` and `.prettierrc.json` configs.
The best way to make sure you are always sticking to our guidelines is by having
prettier & eslint automatically format your code when you save.

Here's how to set that up:

- If you are using VSCode, do the following:

  1. Install the
     [Prettier ESLint VSCode extension](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint)
  2. Install the
     [ESLint VSCode extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  3. **Restart VSCode completely (quit app and reopen).**

- If you are NOT using VSCode, either use VSCode or you'll have to figure out
  how to format-on-save on your own.

Find more details about our linting config [here](#code-formatting-rules)

### 3. Run the app in development mode

```
npm start
```

## Additional scripts

Launch the test runner in interactive watch mode:

```
npm test
```

Create an optimized production build:

```
npm run build
```

## File organization

Feel free to modify stuff inside the `public` or `src` directories, or the
`README`:

```c
├── public // root html, favicon, and manifest
├── src
│   ├── assets // files that are not code (eg. icons, images)
│   │   └── icons // all icons used in the app (bunch of .svg files)
│   ├── common // stuff that doesn't belong to any one page; shared stuff
│   │   ├── components
│   │   ├── contexts
│   │   ├── hooks // custom hooks
│   │   ├── layouts // for routing
│   │   └── utils // helper functions that are not hooks
│   ├── pages // a folder for every unique page (or set of pages)
│   │   ├── account // user account related pages (login, signup, etc)
│   │   ├── home // homepage
│   │   └── not-found // error page for bad routes
│   ├── App.css // global stylesheet
│   └── App.jsx // global contexts & routing
└── README.md // project documentation
```

Everything else: **DO NOT TOUCH!!!**

- many of these are modified as side-effects of normal development, that's okay
- just never modify these directly

```c
├── .vscode // project-specific settings for VSCode (eg. format on save)
├── build // copy of the project optimized for production
├── node_modules // external libraries and dependencies
├── eslint.config.mjs // linting config
├── jsconfig.json // JS compiling config
├── package-lock.json // detailed description of the entire dependency tree
└── package.json // project dependencies
```

## Code formatting rules

We enforce the following rules across all of our code.  
Code that deviates is always flagged as an error.

- Only `.jsx` files can have React JSX in them, and all `.jsx` files MUST have
  JSX in them.  
  Empty files are not flagged.
- Always have semicolons at the end of expressions
- Single quotes only
- Line widths around 80, wrapping everything including prose
- Code has a tab width of 2. Editor displays a tab size of 2.
- Imports
  - Unused imports are not allowed
  - Relative import paths are only permitted if the imported file is inside the
    same directory. In all other cases, absolute paths only. `src` is the base
    directory for absolute import paths.
  - Imports are roughly bundled into 3 groups, in this order:
    1. "react"
    2. third party modules (things that dont fit other rules)
    3. absolute paths in `src` (begin with `common` or `pages`)
    4. relative paths (begin with `.` or `/`)
  - Within each import group, imports are sorted alphabetically
  - Line of space between each import group
  - If importing multiple things from one file, items imported are sorted
    alphabetically
  - Imports that don't exist are not allowed
- Plus the default rules in the following eslint plugins:
  - js plugin recommended
  - react plugin recommended
  - import plugin errors
  - prettier plugin recommended

## Credits

This project was bootstrapped with
[Create React App](https://github.com/facebook/create-react-app).

We use [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) with
various plugins to handle code formatting.

We enforce defining [prop-types](https://www.npmjs.com/package/prop-types) for
all components.

We use [React Router DOM](https://reactrouter.com/7.0.2/home) for client-side
routing.

The vast majority of styling is done using
[styled-components](https://styled-components.com/).

## File organization

Feel free to modify stuff inside the `public` or `src` directories, or the
`README`:

```c
├── public // root html, favicon, and manifest
├── src
│   ├── assets // files that are not code (eg. icons, images)
│   │   └── icons // all icons used in the app (bunch of .svg files)
│   ├── common // stuff that doesn't belong to any one page; shared stuff
│   │   ├── components
│   │   ├── contexts
│   │   ├── hooks // custom hooks
│   │   ├── layouts // for routing
│   │   └── utils // helper functions that are not hooks
│   ├── pages // a folder for every unique page (or set of pages)
│   │   ├── account // user account related pages (login, signup, etc)
│   │   ├── home // homepage
│   │   └── not-found // error page for bad routes
│   ├── App.css // global stylesheet
│   └── App.jsx // global contexts & routing
└── README.md // project documentation
```

Everything else: **DO NOT TOUCH!!!**

- many of these are modified as side-effects of normal development, that's okay
- just never modify these directly

```c
├── .vscode // project-specific settings for VSCode (eg. format on save)
├── build // copy of the project optimized for production
├── node_modules // external libraries and dependencies
├── eslint.config.mjs // linting config
├── jsconfig.json // JS compiling config
├── package-lock.json // detailed description of the entire dependency tree
└── package.json // project dependencies
```

## Code formatting rules

We enforce the following rules across all of our code.  
Code that deviates is always flagged as an error.

- Only `.jsx` files can have React JSX in them, and all `.jsx` files MUST have
  JSX in them.  
  Empty files are not flagged.
- Always have semicolons at the end of expressions
- Single quotes only
- Line widths around 80, wrapping everything including prose
- Code has a tab width of 2. Editor displays a tab size of 2.
- Imports
  - Unused imports are not allowed
  - Relative import paths are only permitted if the imported file is inside the
    same directory. In all other cases, absolute paths only. `src` is the base
    directory for absolute import paths.
  - Imports are roughly bundled into 3 groups, in this order:
    1. "react"
    2. third party modules (things that dont fit other rules)
    3. absolute paths in `src` (begin with `common` or `pages`)
    4. relative paths (begin with `.` or `/`)
  - Within each import group, imports are sorted alphabetically
  - Line of space between each import group
  - If importing multiple things from one file, items imported are sorted
    alphabetically
  - Imports that don't exist are not allowed
- Plus the default rules in the following eslint plugins:
  - js plugin recommended
  - react plugin recommended
  - import plugin errors
  - prettier plugin recommended

## Credits

This project was bootstrapped with
[Create React App](https://github.com/facebook/create-react-app).

We use [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) with
various plugins to handle code formatting.

We enforce defining [prop-types](https://www.npmjs.com/package/prop-types) for
all components.

We use [React Router DOM](https://reactrouter.com/7.0.2/home) for client-side
routing.

The vast majority of styling is done using
[styled-components](https://styled-components.com/).
