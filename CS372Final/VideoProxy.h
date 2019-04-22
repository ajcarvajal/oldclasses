#pragma once

#include "VideoBase.h"
#include "Video.h"
#include <iostream>
#include <memory>
#include <string>

class VideoProxy : public VideoBase {
public:
	VideoProxy() = default;
	VideoProxy(std::string videoID) {
		_realVideo = std::make_unique<Video>(videoID);
	}
	void play() override;
	void setSubtitles(std::string);
private:
	std::unique_ptr<Video> _realVideo;
	std::string _subtitleFile;
};
