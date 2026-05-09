#!/usr/bin/env bash

pip install -r requirements.txt
mkdir -p staticfiles
cp -r static/* staticfiles/
python manage.py migrate
