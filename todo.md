- [x] create react app

eslint / prettier

- [x] install and configure eslint and prettier
- [x] eslint is not working
- [x] fos sort imports
  - react
  - common
  - relative
- [x] eslint check for bad imports
  - bug with .jsx
- [x] eslint imports (enforce absolute paths)
      [link](https://www.npmjs.com/package/eslint-plugin-no-relative-import-paths)
- [x] fos enforce jsx vs js files
      [link](https://github.com/jsx-eslint/eslint-plugin-react)
- [x] fos remove unused imports
- [x] fos spaces
- [x] enforce semicolons
- [x] enforce proptypes

routing

- [x] install react router dom
- [x] use it

styling

- [x] install styled components
- [x] use it
- [x] create global styling rules in `src/App.css`

organization

- [x] write readme
- [x] organize src folder (common, pages)
- [x] file organization in readme

connect to api

- [x] user context
- [ ] login
  - bcrypt to encrypt user pwd in the request
  - salt in .env
- [ ] sign up
- [ ] sign up with google
- [ ] log out
- [ ] sessions
  - store session token as cookie
- [ ] get all users (display on homepage)
- [ ] navbar: buttons depend on auth
- [ ] homepage: you are logged in/out
- [ ] ensure correct pages are inaccessible if logged in/out

content

- [x] homepage
- [x] loginpage
- [x] signup page
- [ ] logout are you sure popup
- [ ] public/manifest.json (and logos)
- [x] use proper proptypes
- [ ] required fields

deploy

- [ ] deploy on vercel

github

- enforce linting/styling in order to merge into main
- can't push directly to main (except ethan, amy, aanand)
- pr templates
