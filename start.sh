#!/bin/bash
# Apply database migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Start the Telegram bot in the background
python bot.py &

# Start the Django web app
gunicorn novamc.wsgi:application --bind 0.0.0.0:$PORT
