FROM python:3.7.7-buster

WORKDIR /homesearch

COPY requirements.txt .

RUN apt update
RUN python3 -m pip install --upgrade pip
RUN apt-get install -y curl gcc libpq-dev python-dev
RUN python3 -m pip install -r requirements.txt --no-cache-dir

COPY . .

CMD ["python", "server/main.py"]