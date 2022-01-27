FROM debian:bullseye-slim
LABEL MAINTAINER="Keyu Tao <taoky@mail.ustc.edu.cn>"

# First we need: Node.js 16 and Go 1.17
ENV NODE_VERSION 16.13.2
ENV GO_VERSION 1.17.6
ENV NVM_VERSION 0.39.1
ENV NVM_DIR /usr/local/nvm
ENV PATH /usr/local/go/bin:${NVM_DIR}/versions/node/v${NODE_VERSION}/bin:$PATH
RUN apt update && apt install -y curl make libvips-dev tar gzip && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM_VERSION}/install.sh | bash && \
    source ${NVM_DIR}/nvm.sh && nvm install ${NODE_VERSION} && \
    nvm alias default ${NODE_VERSION} && nvm use default \
    curl https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz > /tmp/go.tar.gz \
    tar -C /usr/local -xzf /tmp/go.tar.gz && \
    rm -f /tmp/go.tar.gz && \
    mkdir -p /app/

# Copy project to docker
WORKDIR /app
COPY . /app

# Build!
RUN npm install && make build_init && make build_frontend && make build_backend

# Pack image
RUN tar czf /filestash.tar.gz /app/dist
