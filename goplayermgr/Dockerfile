FROM golang:1.16.5-alpine3.13 AS build

WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o playermgr .

FROM scratch AS bin
COPY --from=build /src/playermgr /playermgr

ENTRYPOINT ["/playermgr"]
