FROM node:22.19.0

WORKDIR /home/node/app

RUN chown -R node:node /home/node/app

USER node

COPY --chown=node:node package.json package-lock.json* ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 19000

EXPOSE 19001

EXPOSE 19002

EXPOSE 8081