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

# משתמש root להתקנות
USER root

# התקנות בסיסיות
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  libpq-dev \
  build-essential \
  curl \
  nodejs \
  npm && \
  rm -rf /var/lib/apt/lists/* && \
  npm install -g --unsafe-perm aglio@2.3.0

# תיקיית העבודה
WORKDIR /api

# העתקת כל הקוד
COPY . .

# בדיקה שהקבצים הועתקו
RUN ls -l /api

# entrypoint ו-cmd
ENTRYPOINT ["/api/docker-entrypoint.sh"]
CMD ["/api/scripts/server"]

# שימוש במשתמש סטנדרטי
USER 1000:1000

EXPOSE 2358
