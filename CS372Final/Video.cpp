#pragma once
#include "Video.h"

void Video::play() {
	std::cout << "Playing video: " << _videoList[_videoID] << std::endl;
}
