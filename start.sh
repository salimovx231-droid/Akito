#!/bin/bash
# Apply database migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Server va Kategoriyalarni bazaga avtomatik qo'shish (faqat yo'q bo'lsa qo'shadi)
python add_anarxiya1.py
python add_extra_cats.py

# Start the Telegram bot in the background
python bot.py &

# Start the Django web app
gunicorn novamc.wsgi:application --bind 0.0.0.0:$PORT
