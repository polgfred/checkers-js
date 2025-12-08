FROM oven/bun

WORKDIR /checkers
COPY package.json bun.lock ./
RUN bun install
COPY bunfig.toml build.ts server.ts ./
COPY ./src ./src
RUN bun build.ts
CMD bun server.ts
