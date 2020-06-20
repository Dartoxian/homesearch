FROM python:3.7.7-alpine3.11

WORKDIR /homesearch

COPY requirements.txt .

RUN apk update
RUN \
 apk add --no-cache postgresql-libs curl && \
 apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev && \
 python3 -m pip install -r requirements.txt --no-cache-dir && \
 apk --purge del .build-deps

RUN pip install -r requirements.txt

COPY . .

CMD ["python", "server/main.py"]