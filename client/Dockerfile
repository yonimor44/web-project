# שלב 1: בניית הפרויקט
FROM node:22-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# שלב 2: שרת אינטרנט קליל להרצת הקבצים הסטטיים
FROM nginx:alpine
# הזרקת קובץ ההגדרות שיצרנו כדי למנוע 404
COPY nginx.conf /etc/nginx/conf.d/default.conf
# העתקת קובצי ה-HTML/JS/CSS המוכנים מהשלב הראשון לתוך שרת ה-Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# אבטחה: שינוי הרשאות כדי ש-Nginx יוכל לרוץ כמשתמש רגיל
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d
USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]