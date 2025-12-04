
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN rm -rf package-lock.json && npm install --legacy-peer-deps

COPY . .

RUN npm install react-dom@19.2.0 --save --force

EXPOSE 8081 19000 19001 19002

CMD ["npx", "expo", "start", "--tunnel"]