#!/usr/bin/env bash

pip install -r requirements.txt
python manage.py collectstatic --no-input --clear --verbosity 2
python manage.py migrate
python manage.py loaddata fixtures/initial_data.json