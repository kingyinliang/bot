# 使用官方的Node.js 16映像作为基础映像
FROM node:16

# 将工作目录设置为 /app
WORKDIR /app

# 复制 package.json 和 package-lock.json 文件到容器内的 /app 目录
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 将当前目录下的所有文件（除了Dockerfile和.dockerignore之外）复制到容器的 /app 目录下
COPY . .

# 安装 Chromium 浏览器 必要的依赖库
RUN apt-get update && apt-get install -y \
  wget gnupg \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' > /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update && apt-get install -y \
  google-chrome-stable \
  fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*


# 在容器启动时运行 "npm start" 命令
CMD [ "npm", "run", "serve" ]
