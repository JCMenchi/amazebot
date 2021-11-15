#
# playermgr
#
# Create with: docker build -t gamemgr:$(node -p "require('./package.json').version") .
#
# run with command line:
#   docker run --rm -it -p 8080:8080 gamemgr:$(node -p "require('./package.json').version")
# 

# Start from simple alpine container
FROM node:14-alpine

#=================================================================================================================
# Install packages
#
#
RUN apk add --no-cache bash=5.1.4-r0 curl=7.79.1-r0 && rm -rf /var/cache/apk/*
#

#=================================================================================================================
# Deploy app
# node image has a user named node in group node
#
COPY --chown=node:node . /home/node/app/
#
#=================================================================================================================

#=================================================================================================================
# Setup Docker resources
#
EXPOSE 8080
USER node
WORKDIR /home/node/app

# Set the default command to run when starting the container
CMD ["node", "main.js", "-p", "8083", "-P", "http://127.0.0.1:8081/api", "-M", "http://127.0.0.1:8082/api"]
#=================================================================================================================
