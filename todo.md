- [x] create react app

eslint / prettier

- [x] install and configure eslint and prettier
- [x] eslint is not working
- [x] fos sort imports
  - react
  - common
  - relative
- [ ] eslint imports (enforce absolute paths) [link](https://www.npmjs.com/package/eslint-plugin-no-relative-import-paths)
- [ ] fos enforce jsx vs js files [link](https://github.com/jsx-eslint/eslint-plugin-react)
- [x] fos remove unused imports
- [x] fos spaces
- [x] enforce semicolons
- [ ] enforce proptypes

- line endings! [link](https://prettier.io/docs/en/options#end-of-line) 

organization

- [x] write readme
- [ ] organize src folder (common, pages)
- [ ] do we need a public folder?

routing

- [ ] install react router dom
- [ ] use it

styling

- [ ] install styled components
- [ ] use it
- [ ] create global styling rules in `src/App.css`

connect to api

- [ ] login
  - bcrypt to encrypt user pwd in the request
  - salt in .env
- [ ] sign up
- [ ] sign up with google
- [ ] log out
- [ ] sessions
  - dont use JWTs
  - store session token as cookie
- [ ] user context
- [ ] get all users

pages

- [ ] homepage: you are logged in/out
- [ ] navbar: buttons depend on auth
- [ ] loginpage
- [ ] signup page
- [ ] logout are you sure popup

github

- enforce linting/styling in order to merge into main
- can't push directly to main (except ethan, amy, aanand)
- pr templates
