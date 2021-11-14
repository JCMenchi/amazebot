FROM golang:1.16.5 AS build

# Build Delve
RUN go install github.com/go-delve/delve/cmd/dlv@latest

WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -gcflags "all=-N -l" -o playermgr .

CMD ["/go/bin/dlv", "--listen=:40000", "--headless=true", "--api-version=2", "--accept-multiclient", "exec", "--continue", "/src/playermgr", "--", "serve"]