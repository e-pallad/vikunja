FROM nginx:1.31.8-alpine
# Required at runtime: base URL of the stock Vikunja server, e.g. http://192.0.2.10:3456
ENV VIKUNJA_BACKEND=""
COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY dist /usr/share/nginx/html
