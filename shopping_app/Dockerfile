# שלב 1: שלב הבנייה והקימפול
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 
# ^ הפקודה הזו יוצרת את תיקיית dist עם הקוד המקומפל

# שלב 2: תמונת הפרודקשן הנקייה
FROM node:22-alpine
WORKDIR /app
# הגדרת משתנה סביבה לייצור
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist 
# ^ מעתיקים רק את התוצר המקומפל

# אבטחה: יצירת משתמש ללא הרשאות Root - דרישת התרגיל
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup
USER nodeuser
EXPOSE 3000

# הפקודה שתריץ את השרת כשקוברנטיס יעלה אותו
CMD ["node", "dist/main"]