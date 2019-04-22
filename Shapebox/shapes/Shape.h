#pragma once

#include <string>

class Shape
{
public:
  virtual ~Shape();
  virtual std::string toPostScript() const = 0;
  virtual double width() const = 0;
  virtual double height() const = 0;
};