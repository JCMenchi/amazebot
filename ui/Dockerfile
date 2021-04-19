#
# amazui
#
# Create with: docker build -t amazui:$(node -p "require('./package.json').version") .
# docker build -t localhost:5000/ui:0.1.0 .
# run with command line:
#   docker run --rm -it -p 8080:8080 amazui:$(node -p "require('./package.json').version")
# 

# run nginx
FROM nginx:1.19

COPY amazeui /usr/share/nginx/html/amazeui
COPY nginx.conf /etc/nginx/conf.d/default.conf
