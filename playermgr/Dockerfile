#
# playermgr
#
# Create with: docker build -t playermgr:$(node -p "require('./package.json').version") .
#
# run with command line:
#   docker run --rm -it -p 8080:8080 playermgr:$(node -p "require('./package.json').version")
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
EXPOSE 8081
USER node
WORKDIR /home/node/app

# Set the default command to run when starting the container
CMD ["node", "main.js", "-p", "8081"]
#=================================================================================================================
