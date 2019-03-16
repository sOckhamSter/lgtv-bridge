FROM node:7
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
ENV TV_MAC="xx:xx:xx:xx:xx:xx"
    TV_IP="xxx.xxx.xxx.xxx"
EXPOSE 80
CMD node index.js service
