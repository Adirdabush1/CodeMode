# ===============================
# Dockerfile מותאם Render - גרסה מקוצרת
# ===============================
FROM ruby:2.7-slim AS production

ENV JUDGE0_HOMEPAGE="https://judge0.com"
LABEL homepage=$JUDGE0_HOMEPAGE

ENV JUDGE0_SOURCE_CODE="https://github.com/judge0/judge0"
LABEL source_code=$JUDGE0_SOURCE_CODE

ENV JUDGE0_MAINTAINER="Herman Zvonimir Došilović <hermanz.d.z@gmail.com>"
LABEL maintainer=$JUDGE0_MAINTAINER

ENV TAR_OPTIONS="--no-same-owner"
ENV NPM_CONFIG_USER=root

USER root

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  build-essential \
  curl \
  libpq-dev \
  nodejs \
  npm \
  git \
  ca-certificates && \
  rm -rf /var/lib/apt/lists/*

RUN gem install bundler:2.1.4 && \
  npm install -g --unsafe-perm aglio@2.3.0

WORKDIR /api

COPY Gemfile Gemfile.lock* ./

RUN bundle config set deployment 'true' && \
  bundle config set without 'development test' && \
  bundle install

COPY . .

# יצירת סקריפטים והרשאות ב-RUN אחד
RUN mkdir -p /api/scripts && \
  echo -e '#!/bin/sh\nexec "$@"' > /api/docker-entrypoint.sh && \
  echo -e '#!/bin/sh\nbundle exec rails server -b 0.0.0.0 -p 2358' > /api/scripts/server && \
  chmod +x /api/docker-entrypoint.sh /api/scripts/server

ENTRYPOINT ["/api/docker-entrypoint.sh"]
CMD ["/api/scripts/server"]

USER 1000:1000
EXPOSE 2358
