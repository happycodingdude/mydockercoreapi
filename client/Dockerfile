FROM node:20-alpine as builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:20-alpine as runner
WORKDIR /app
COPY . .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000
CMD ["npm", "start"]