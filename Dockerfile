FROM node:18.12.1-bullseye as builder
WORKDIR /workdir
COPY package.json .
RUN npm i
COPY tsconfig.json .
COPY src ./src
RUN npm run compile

FROM node:18.12.1-bullseye-slim
WORKDIR /workdir
COPY package.json .
COPY --from=builder /workdir/dist /workdir/dist
CMD ["npm", "start"]
