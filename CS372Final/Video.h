#pragma once

#include "VideoBase.h"
#include <string>
#include <map>
#include <iostream>

class Video : public VideoBase {
public:
	Video() = default;
	Video(std::string videoID) :_videoID(videoID) {}
	void play() override;
private:
	std::string _videoID;
	std::map<std::string, std::string> _videoList{
		std::make_pair("Keyboard Cat", "https://www.youtube.com/watch?v=J---aiyznGQ"),
	};
};