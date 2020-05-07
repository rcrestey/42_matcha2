FROM node:lts-alpine3.9 

WORKDIR /app

COPY . /app

RUN npm install --silent

RUN npm run build

EXPOSE 3000

ENTRYPOINT ["npx", "sirv-cli", "start", "build", "-c", "-H", "0.0.0.0", "-p", "3000", "-s"]
