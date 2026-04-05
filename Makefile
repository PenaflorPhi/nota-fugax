TARGET = aarch64-unknown-linux-gnu
BINARY = target/$(TARGET)/release/nota-fugax
HOST = angel@192.168.100.8
DEPLOY = /opt/nota-fugax

.PHONY: build deploy

build:
	 cross build --release --target $(TARGET)

deploy: build
	ssh $(HOST) "sudo mkdir -p $(DEPLOY)/data && sudo chown -R angel:angel $(DEPLOY) && touch $(DEPLOY)/data/threads.db"
	ssh $(HOST) "sudo systemctl stop nota-fugax"
	scp $(BINARY) $(HOST):$(DEPLOY)/nota-fugax
	ssh $(HOST) "rm -rf $(DEPLOY)/static"
	scp -r static $(HOST):$(DEPLOY)/static
	ssh $(HOST) "sudo systemctl start nota-fugax"

test:
	ssh $(HOST) "systemctl is-active nota-fugax"
	curl -s https://penaflor.dev/static/index.html | grep -q "note-fugax" && echo "OK" || echo "FAIL"
