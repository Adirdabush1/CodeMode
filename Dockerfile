# ===============================
# Dockerfile מותאם Render
# ===============================
FROM ruby:2.7-slim AS production

ENV JUDGE0_HOMEPAGE="https://judge0.com"
LABEL homepage=$JUDGE0_HOMEPAGE

ENV JUDGE0_SOURCE_CODE="https://github.com/judge0/judge0"
LABEL source_code=$JUDGE0_SOURCE_CODE

ENV JUDGE0_MAINTAINER="Herman Zvonimir Došilović <hermanz.d.z@gmail.com>"
LABEL maintainer=$JUDGE0_MAINTAINER

# עוקף בעיית chown בזמן חילוץ או התקנות npm/gem
ENV TAR_OPTIONS="--no-same-owner"
ENV NPM_CONFIG_USER=root

# משתמש root להתקנות
USER root

# התקנות בסיסיות + Node.js + npm + build tools
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

# התקנת bundler ו-aglio
RUN gem install bundler:2.1.4 && \
  npm install -g --unsafe-perm aglio@2.3.0

# תיקיית העבודה
WORKDIR /api

# העתקת קבצי Gemfile בלבד לפני שאר הקוד
COPY Gemfile Gemfile.lock* ./

# התקנת תלויות Ruby (Bundler)
RUN bundle config set deployment 'true' && \
  bundle config set without 'development test' && \
  bundle install

# העתקת יתר הקוד
COPY . .

# יצירת סקריפטים חסרים ומתן הרשאות ריצה
RUN mkdir -p /api/scripts && \
  tee /api/docker-entrypoint.sh > /dev/null << 'EOF'
#!/bin/sh
exec "$@"
EOF
&& tee /api/scripts/server > /dev/null << 'EOF'
#!/bin/sh
exec bundle exec rails server -b 0.0.0.0 -p 2358
EOF
&& chmod +x /api/docker-entrypoint.sh /api/scripts/server

# entrypoint ו-cmd
ENTRYPOINT ["/api/docker-entrypoint.sh"]
CMD ["/api/scripts/server"]

# שימוש במשתמש סטנדרטי
USER 1000:1000

EXPOSE 2358
