# Remote machine setup

```
sudo yum install -y yum-utils vim unzip git wget

sudo yum-config-manager \
  --add-repo \
  https://download.docker.com/linux/centos/docker-ce.repo

sudo yum install --nobest docker-ce docker-ce-cli containerd.io

sudo docker build -f homesearch.dockerfile -t homesearch-python .

sudo curl -L "https://github.com/docker/compose/releases/download/1.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /bin/docker-compose

# Load postcodes
sudo mkdir -p data/postcodes
cd data/postcodes
sudo wget https://www.doogal.co.uk/files/postcodes.zip
sudo unzip postcodes.zip
cd ../../
sudo docker-compose run -d -e PYTHONPATH=./ \
    -e DB_HOST=homesearch_db_1 homesearch-python \
    python metadata/postcodes/load_postcodes.py


# Fetch all the zoopla data
sudo docker-compose run -d -e PYTHONPATH=./ \
    -e DB_HOST=homesearch_db_1 homesearch-python python zoopla/fetch.py 


# Fetch all rightmove data
sudo docker-compose run -d -e PYTHONPATH=./ \
    -e DB_HOST=homesearch_db_1 homesearch-python python rightmove/fetch.py
```