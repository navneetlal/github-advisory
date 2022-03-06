FROM node:16.14.0-alpine3.15 as build-stage

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:16.14.0-alpine3.15 as runtime

WORKDIR /opt/app

COPY package.json .
COPY yarn.lock .

RUN apk add --no-cache git \
    && yarn install --production
    
COPY --from=build-stage /app/dist ./

EXPOSE 3000

ENTRYPOINT ["yarn", "start:prod"]