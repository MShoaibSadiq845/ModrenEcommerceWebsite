FROM node:20-alpine

WORKDIR /app

# Dependencies install karein
COPY package*.json ./
RUN npm install

# Saara source code copy karein
COPY . .

# TypeScript ko build karein taake dist folder ban jaye
RUN npm run build

# Application ko start karein
CMD ["node", "dist/main.js"]