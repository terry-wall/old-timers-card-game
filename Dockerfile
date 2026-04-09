FROM mcr.microsoft.com/devcontainers/javascript-node:20

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]