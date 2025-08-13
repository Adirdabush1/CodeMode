# ===============================
# Dockerfile מותאם Render
# ===============================
FROM judge0/compilers:1.4.0-slim AS production

ENV JUDGE0_HOMEPAGE="https://judge0.com"
LABEL homepage=$JUDGE0_HOMEPAGE

ENV JUDGE0_SOURCE_CODE="https://github.com/judge0/judge0"
LABEL source_code=$JUDGE0_SOURCE_CODE

ENV JUDGE0_MAINTAINER="Herman Zvonimir Došilović <hermanz.d.z@gmail.com>"
LABEL maintainer=$JUDGE0_MAINTAINER

# עוקף בעיית chown בזמן חילוץ או התקנות npm/gem
ENV TAR_OPTIONS="--no-same-owner"
ENV NPM_CONFIG_USER=root

# התקנות בסיסיות
USER root
RUN apt-get update && \
  apt-get install -y --no-install-recommends libpq-dev && \
  rm -rf /var/lib/apt/lists/* && \
  echo "gem: --no-document" > /root/.gemrc && \
  gem install bundler:2.1.4 && \
  npm install -g --unsafe-perm aglio@2.3.0

# סביבה
WORKDIR /api

COPY Gemfile* ./
RUN bundle install --deployment --without development test

COPY . .

# אל תעתיק .env, משתני סביבה מחוץ לדוקר
ENTRYPOINT ["/api/docker-entrypoint.sh"]
CMD ["/api/scripts/server"]

# משתמש סטנדרטי ללא שינוי UID/GID
USER 1000:1000

EXPOSE 2358
