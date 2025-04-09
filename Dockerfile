FROM node:18

# Crear el directorio de la app
WORKDIR /app

# Copiar package.json y .yarnrc.yml antes que el resto
COPY package.json yarn.lock .yarnrc.yml ./

# Habilitar corepack y preparar Yarn 4.9.0
RUN corepack enable && \
    corepack prepare yarn@4.9.0 --activate

# Copiar el resto de los archivos
COPY . .

# Instalar dependencias
RUN yarn install

RUN mkdir -p /app/uploads

# Ejecutar la app
CMD ["yarn", "start"]  # o lo que uses: dev / worker / api, etc.
