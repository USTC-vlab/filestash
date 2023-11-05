# Filestash

A modified [filestash](https://github.com/mickael-kerjean/filestash) for Vlab platform.

## Changes

-   Removed unused plugins and deps
-   Added a working, reproducible `package-lock.json` under Node.js 18
-   Vlab backends now are based on sshpiper interface, with password-free login support
-   A Docker build script
-   Libvips is now supported with `govips` packages, with no more external nonreproducible C static library binary
-   And many more small fixes

## Docker

See [docker/build.sh](docker/build.sh)

## Manually build / development

_Prerequisites_: Git, Make, Node, Go, Glib 2.0

_Optional deps_: Libvips (If you use `plg_image_light` plugin for image thumbnail processing)

```
# Download the source
git clone https://github.com/ustc-vlab/filestash
cd filestash

# Install dependencies
npm install # frontend dependencies
make build_init # install the required static libraries
mkdir -p ./dist/data/state/
cp -R config ./dist/data/state/

# Create the build
make build_frontend
make build_backend

# Run the program
./dist/filestash
```

## Reporting bugs

You can post your bug report in <https://github.com/USTC-vlab/discussions/issues>.

**For security issues, please directly send email to vlab AT ustc.edu.cn instead of posting it publicly.**
