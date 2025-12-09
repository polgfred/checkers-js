FROM oven/bun
WORKDIR /checkers
COPY package.json bun.lock ./
RUN bun install
COPY bunfig.toml build.ts plugin-react-svg.ts ./
COPY ./src ./src
RUN bun build.ts
 
FROM nginx:alpine
COPY --from=0 /checkers/dist /usr/share/nginx/html
