FROM alpine
RUN apk add --update nodejs npm
COPY . /checkers
WORKDIR /checkers
RUN npm install
RUN npm run build
EXPOSE 8080
ENTRYPOINT ["node", "--require", "esm", "./lib/server.js"]
