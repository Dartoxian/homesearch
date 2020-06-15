FROM node:lts-alpine

WORKDIR /ui

RUN apk update
COPY . .
RUN npm install

EXPOSE 1234

CMD ["npm", "run", "start"]