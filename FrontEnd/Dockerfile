# 1. Start with a lightweight, pre-built Nginx environment
FROM nginx:alpine

# 2. Delete the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# 3. Copy our custom reverse proxy rules into the container
COPY nginx.conf /etc/nginx/conf.d/

# 4. Copy all your HTML, CSS, and JS files into Nginx's public folder
COPY . /usr/share/nginx/html

# 5. Document that this container will communicate on port 80
EXPOSE 80