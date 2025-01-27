FROM node:23-slim 

WORKDIR /app
# install chromium deps to run in linux
RUN npx playwright install-deps chromium 
COPY package.json yarn.lock /app/
RUN yarn
COPY . .
RUN yarn build

CMD ["yarn", "start"]
