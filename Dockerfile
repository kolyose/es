FROM node:9
ENV NODE_ENV 'production'
WORKDIR /usr/src/app
COPY package.json package-lock.json server-key.pem server-cert.pem ./
RUN npm install
EXPOSE 3000 3333
VOLUME ["/usr/src/app"]
CMD ["npm", "start"]