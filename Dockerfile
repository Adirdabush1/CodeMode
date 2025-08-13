FROM judge0/compilers:1.4.0 AS production

ENV JUDGE0_HOMEPAGE="https://judge0.com"
LABEL homepage=$JUDGE0_HOMEPAGE

ENV JUDGE0_SOURCE_CODE="https://github.com/judge0/judge0"
LABEL source_code=$JUDGE0_SOURCE_CODE

ENV JUDGE0_MAINTAINER="Herman Zvonimir Došilović <hermanz.d.z@gmail.com>"
LABEL maintainer=$JUDGE0_MAINTAINER

ENV PATH="/usr/local/ruby-2.7.0/bin:/opt/.gem/bin:$PATH"
ENV GEM_HOME="/opt/.gem/"

# עוקף בעיית chown בזמן חילוץ או התקנות npm/gem
ENV TAR_OPTIONS="--no-same-owner"
ENV NPM_CONFIG_USER=root

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  libpq-dev && \
  rm -rf /var/lib/apt/lists/* && \
  echo "gem: --no-document" > /root/.gemrc && \
  gem install bundler:2.1.4 && \
  npm install -g --unsafe-perm aglio@2.3.0

EXPOSE 2358

WORKDIR /api

COPY Gemfile* ./
RUN RAILS_ENV=production bundle

COPY . .

# אל תעתיק קובץ .env לתמונה, עדיף להגדיר משתני סביבה מחוץ לדוקר
ENTRYPOINT ["/api/docker-entrypoint.sh"]
CMD ["/api/scripts/server"]

RUN useradd -u 1000 -m -r judge0 && \
  echo "judge0 ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers && \
  chown judge0: /api/tmp/ || true  # אם chown נכשל - המשך

USER judge0

ENV JUDGE0_VERSION="1.13.1"
LABEL version=$JUDGE0_VERSION

FROM production AS development
CMD ["sleep", "infinity"]
