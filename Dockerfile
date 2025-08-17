# ===============================
# Dockerfile מותאם ל-Judge0 API על Render
# ===============================

# משתמשים בתמונה הרשמית של Judge0
FROM judge0/judge0:latest

# --- משתני סביבה ---
ENV PORT=2358
ENV JUDGE0_DB_PATH=/data/db
ENV JUDGE0_SANDBOX_PATH=/data/sandbox

# --- יצירת תיקיות DB ו-Sandbox אם לא קיימות ---
RUN mkdir -p $JUDGE0_DB_PATH $JUDGE0_SANDBOX_PATH \
  && chown -R judge0:judge0 $JUDGE0_DB_PATH $JUDGE0_SANDBOX_PATH

# --- חשיפת פורט ---
EXPOSE ${PORT}

# --- העתקת סקריפט start.sh מותאם ---
COPY start.sh /start.sh
RUN chmod +x /start.sh

# --- volume עבור DB וסנדבוקס ---
VOLUME ["$JUDGE0_DB_PATH", "$JUDGE0_SANDBOX_PATH"]

# --- הרצת השירות באמצעות הסקריפט ---
ENTRYPOINT ["/start.sh"]
