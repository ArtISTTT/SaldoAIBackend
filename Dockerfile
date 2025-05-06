# 1. Используем официальный образ Node.js
FROM node:23

# 2. Устанавливаем рабочую директорию
WORKDIR /app

# 3. Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# 4. Устанавливаем зависимости
RUN npm install

# 5. Копируем остальной код
COPY . .

# 6. Компилируем TypeScript
RUN npm run build

# 7. Указываем порт
EXPOSE 4000

# 8. Запускаем приложение
CMD ["npm", "start"]