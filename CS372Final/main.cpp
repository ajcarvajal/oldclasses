#include "VideoBase.h"
#include "VideoProxy.h"
#include "Video.h"

int main() {
	VideoProxy proxy("Keyboard Cat");
	proxy.setSubtitles("du du du du dudududu\n");
	proxy.play();
}
