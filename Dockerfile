FROM node:16
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
RUN yarn install
COPY . .
EXPOSE 3004
RUN yarn build
CMD ["yarn", "start"]
