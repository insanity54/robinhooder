# magnet-forwarder

Click a magnet link in your browser. Magnet URL gets sent to this program which uses a headless browser to paste the magnet link into ruTorrent.

## Dependencies

  * espeak
  * node >= version 8

## Usage

Configure magnet-forwarder by creating an `.env` file in this directory with the following contents

```
RUTORRENT_PASSWORD=rosebud
RUTORRENT_USERNAME=insanity54
RUTORRENT_ADDRESS=https://myseedbox.example.com/rutorrent/
DEBUG=nightmare:actions*
NODE_BINARY_PATH=/home/insanity54/.nvm/versions/node/v8.12.0/bin/node
MF_SHOW=false
```

(set MF_SHOW to true if you are running into problems)

Configure Firefox to use mf.sh for magnet:// urls. Easiest way to do this is to fin and click a magnet link in firefox, then use the dialog to Browse to magnet-forwarder.sh. Alternatively, check the Applications section in Firefox settings.

Good to go! Try clicking a magnet link.
