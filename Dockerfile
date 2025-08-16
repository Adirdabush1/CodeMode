# ===============================
# Dockerfile ל-Judge0 API על Render
# ===============================
FROM ruby:2.7-slim AS production

# --- משתני סביבה ---
ENV RAILS_ENV=production
ENV BUNDLE_DEPLOYMENT=true
ENV BUNDLE_WITHOUT="development test"
WORKDIR /api

# --- התקנות בסיס ---
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

# --- התקנת Bundler ---
RUN gem install bundler:2.1.4

# --- העתקת Gemfile של Judge0 בלבד ---
COPY Gemfile Gemfile.lock* ./
RUN bundle install

# --- העתקת כל הקוד של Judge0 ---
COPY . .

# --- סקריפט להרצת השרת ---
RUN printf '#!/bin/sh\nexec "$@"\n' > /api/docker-entrypoint.sh && \
  printf '#!/bin/sh\nbundle exec rails server -b 0.0.0.0 -p 2358\n' > /api/server && \
  dos2unix /api/docker-entrypoint.sh /api/server && \
  chmod +x /api/docker-entrypoint.sh /api/server

ENTRYPOINT ["/api/docker-entrypoint.sh"]
CMD ["/api/server"]

EXPOSE 2358
