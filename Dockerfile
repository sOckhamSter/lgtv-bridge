FROM node:7
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
ENV NAME TV_MAC
ENV NAME TV_IP
EXPOSE 80
CMD node index.js service
