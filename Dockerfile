FROM node
WORKDIR /checkers
COPY \
	package.json \
	package-lock.json \
	postcss.config.js \
	tsconfig.json \
	webpack.config.js \
	./
RUN npm install
COPY ./src ./src
COPY ./static ./static
RUN npm run build:client
RUN npm run build:server

FROM node:slim
WORKDIR /checkers
COPY \
	package.json \
	package-lock.json \
	./
RUN npm install --only=production
COPY --from=0 /checkers/lib ./lib
COPY --from=0 /checkers/static ./static
EXPOSE 8080
ENTRYPOINT ["npm", "start"]
