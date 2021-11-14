# Player Manager in go

## Build, Test

To create executable

```bash
go build
```

To run unitest with details

```bash
go test -v ./...
```

To run unitest and show coverage info

```bash
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
```
