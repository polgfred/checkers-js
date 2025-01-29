# Development

Install NPM pages and start the development server:

```console
% npm install
% npm test
% npm start:dev
```

# Docker

Build the app as a docker container:

```console
% docker build --tag checkers .
% docker run -it --rm -p 8080:80 checkers
```
