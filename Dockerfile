FROM node:10-slim

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 4242
CMD [ "node", "yuiko.js" ]
