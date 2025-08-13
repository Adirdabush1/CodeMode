# ===============================
# Dockerfile מותאם Render (ללא Ruby/Bundler)
# ===============================
FROM judge0/compilers:1.4.0-slim AS production

ENV JUDGE0_HOMEPAGE="https://judge0.com"
LABEL homepage=$JUDGE0_HOMEPAGE

ENV JUDGE0_SOURCE_CODE="https://github.com/judge0/judge0"
LABEL source_code=$JUDGE0_SOURCE_CODE

ENV JUDGE0_MAINTAINER="Herman Zvonimir Došilović <hermanz.d.z@gmail.com>"
LABEL maintainer=$JUDGE0_MAINTAINER

# עוקף בעיות הרשאות בזמן התקנות npm
ENV NPM_CONFIG_USER=root

# התקנת Node.js וכלים בסיסיים
USER root
RUN apt-get update && \
  apt-get install -y --no-install-recommends curl nodejs npm libpq-dev build-essential && \
  rm -rf /var/lib/apt/lists/* && \
  npm install -g --unsafe-perm aglio@2.3.0

# תיקיית עבודה
WORKDIR /api

# העתקת כל הקוד
COPY . .

# entrypoint ו־CMD
ENTRYPOINT ["/api/docker-entrypoint.sh"]
CMD ["/api/scripts/server"]

# משתמש סטנדרטי
USER 1000:1000

EXPOSE 2358
