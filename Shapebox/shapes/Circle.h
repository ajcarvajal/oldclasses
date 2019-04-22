#pragma once

#include "Shape.h"

class Circle : public Shape
{
public:
  Circle(double radius);
  virtual std::string toPostScript() const override;
  virtual double width() const override;
  virtual double height() const override;
private:
  const double _radius;
};
