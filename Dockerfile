# 1단계: 빌드 환경 설정
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2단계: 실행 환경 설정 (Nginx)
FROM nginx:alpine
# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 빌드된 파일을 /bank 폴더에 배치
COPY --from=build /app/dist /usr/share/nginx/html/bank
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
