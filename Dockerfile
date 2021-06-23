FROM node
WORKDIR /checkers
COPY package.json package-lock.json ./
RUN npm install
COPY postcss.config.js tsconfig.json webpack.config.js ./
COPY ./src ./src
COPY ./static ./static
RUN npm run build:client

FROM nginx:alpine
COPY --from=0 /checkers/static /usr/share/nginx/html
