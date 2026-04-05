TARGET = aarch64-unknown-linux-gnu
BINARY = target/$(TARGET)/release/nota-fugax
HOST = angel@penaflor.dev
DEPLOY = /opt/nota-fugax

.PHONY: build deploy

build:
	 cross build --release --target $(TARGET)

deploy: build
	ssh $(HOST) "sudo mkdir -p $(DEPLOY)/data && sudo chown -R angel:angel $(DEPLOY) && touch $(DEPLOY)/data/threads.db"
	scp $(BINARY) $(HOST):$(DEPLOY)/nota-fugax
	scp -r static $(HOST):$(DEPLOY)/static
	ssh $(HOST) "sudo systemctl restart nota-fugax"

test:
	ssh $(HOST) "systemctl is-active nota-fugax"
	curl -s https://penaflor.dev/static/index.html | grep -q "note-fugax" && echo "OK" || echo "FAIL"
