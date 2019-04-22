#pragma once
#include "VideoProxy.h"

void VideoProxy::play() {
	_realVideo->play();
	std::cout << _subtitleFile;
}
void VideoProxy::setSubtitles(std::string subtitleFile) {
	_subtitleFile = subtitleFile;
}
