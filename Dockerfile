# ===============================
# Dockerfile מותאם ל-Judge0 API על Render
# ===============================
FROM ruby:2.7-slim AS production

# --- משתני סביבה ---
ENV RAILS_ENV=production
ENV BUNDLE_DEPLOYMENT=true
ENV BUNDLE_WITHOUT="development test"
ENV PORT=2358
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

# --- העתקת Gemfile בלבד כדי לבצע bundle install ---
COPY Gemfile Gemfile.lock* ./
RUN bundle install --jobs 4 --retry 3

# --- העתקת כל הקוד של Judge0 ---
COPY . .

# --- הרצת precompile ל-assets (אם יש) ---
RUN if [ -f "config/application.rb" ]; then \
  bundle exec rails assets:precompile; \
  fi

# --- סקריפט להרצת השרת ---
RUN printf '#!/bin/sh\n\
  # בדיקה אם יש צורך ב-database migration\n\
  if [ -f "config/database.yml" ]; then\n\
  echo "Checking DB migrations..."\n\
  bundle exec rails db:migrate 2>/dev/null || true\n\
  fi\n\
  \n\
  # הרצת השרת על כל ה-interfaces\n\
  exec bundle exec rails server -b 0.0.0.0 -p ${PORT:-2358}\n' \
  > /api/start.sh && \
  dos2unix /api/start.sh && \
  chmod +x /api/start.sh

# --- פקודת הפעלה ---
ENTRYPOINT ["/api/start.sh"]

# --- פתיחת פורט ---
EXPOSE ${PORT:-2358}
