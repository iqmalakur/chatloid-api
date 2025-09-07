FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install
COPY . .
RUN pnpm prisma generate
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start:prod"]
