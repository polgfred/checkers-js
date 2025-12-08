FROM oven/bun
WORKDIR /checkers
COPY package.json bun.lock ./
RUN bun install
COPY bunfig.toml build.ts ./
COPY ./src ./src
RUN bun build.ts

FROM oven/bun:slim
WORKDIR /checkers
COPY package.json bun.lock ./
RUN bun install --production
COPY bunfig.toml server.ts ./
COPY ./src ./src
COPY --from=0 /checkers/dist ./dist
CMD bun server.ts