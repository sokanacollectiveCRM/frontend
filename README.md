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

### 1. install dependencies:

```
npm i
```

- Only run this command after initial clone, or after someone installs more
  dependencies.

### 2. Run the app in development mode:

```
npm start
```

### 3. Set up formatting with Prettier and ESLint

If you are contributing, you must make sure ALL your code is formatted
according to our `eslint.config.mjs` and `.prettierrc.json` configs.
Below are instructions for setting up automatic format-on-save for a VSCode environment.

_If you are NOT using VSCode, you must figure out how to configure format-on-save on your own._

1. Install the [Prettier ESLint VSCode extension](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint)
2. Install the [ESLint VSCode extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
3. Open the command palette in VSCode by typing:
    ```
    CMD + SHIFT + P (Mac OS)
    CTRL + SHIFT + P (Windows)
    ```
4. In the command palette, search for and select `Preferences: Open Workspace Settings (JSON)`
5. In the .vscode/settings.json file we just opened, add the following settings

```
{
  "editor.defaultFormatter": "rvest.vs-code-prettier-eslint",
  "editor.formatOnType": false,
  "editor.formatOnSave": true,
  "editor.formatOnSaveMode": "file",
  "vs-code-prettier-eslint.prettierLast": false
}
```

6. **IMPORTANT!!!!!!! Restart VSCode**

Now, whenever you save a file, it should be automatically formatted
according to our configuration.

## Additional scripts

Launch the test runner in interactive watch mode:

```
npm test
```

Create an optimized production build:

```
npm run build
```

## Credits

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
