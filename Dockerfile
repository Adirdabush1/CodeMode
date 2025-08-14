# ===============================
# Dockerfile מותאם Render - גרסה מתוקנת עם טיפול ב-CRLF
# ===============================
FROM ruby:2.7-slim AS production

# --- מידע על המתחזק והפרויקט ---
ENV JUDGE0_HOMEPAGE="https://judge0.com"
LABEL homepage=$JUDGE0_HOMEPAGE

ENV JUDGE0_SOURCE_CODE="https://github.com/judge0/judge0"
LABEL source_code=$JUDGE0_SOURCE_CODE

ENV JUDGE0_MAINTAINER="Herman Zvonimir Došilović <hermanz.d.z@gmail.com>"
LABEL maintainer=$JUDGE0_MAINTAINER

# --- הגדרות סביבת עבודה ---
ENV TAR_OPTIONS="--no-same-owner"
ENV NPM_CONFIG_USER=root

# --- משתמש root להתקנות ---
USER root

# --- התקנות בסיסיות ---
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  build-essential \
  curl \
  libpq-dev \
  nodejs \
  npm \
  git \
  ca-certificates \
  dos2unix && \
  rm -rf /var/lib/apt/lists/*

# --- התקנת bundler ו-aglio ---
RUN gem install bundler:2.1.4 && \
  npm install -g --unsafe-perm aglio@2.3.0

# --- תיקיית העבודה ---
WORKDIR /api

# --- העתקת קבצי Gemfile ---
COPY Gemfile Gemfile.lock* ./

# --- התקנת תלויות Ruby ---
RUN bundle config set deployment 'true' && \
  bundle config set without 'development test' && \
  bundle install

# --- העתקת יתר הקוד ---
COPY . .

# --- יצירת סקריפטים עם LF בלבד והרשאות ---
RUN mkdir -p /api/scripts && \
  printf '#!/bin/sh\nexec "$@"\n' > /api/docker-entrypoint.sh && \
  printf '#!/bin/sh\nbundle exec rails server -b 0.0.0.0 -p 2358\n' > /api/scripts/server && \
  dos2unix /api/docker-entrypoint.sh /api/scripts/server && \
  chmod +x /api/docker-entrypoint.sh /api/scripts/server

# --- הפעלת השרת ---
ENTRYPOINT ["/api/docker-entrypoint.sh"]
CMD ["/api/scripts/server"]

# --- חזרה למשתמש רגיל ---
USER 1000:1000

# --- פתיחת פורט ---
EXPOSE 2358
