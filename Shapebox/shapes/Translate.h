#pragma once

#include "Shape.h"
#include <memory>

class Translate : public Shape
{
public:
  Translate(double, double, std::unique_ptr<Shape>);
  virtual std::string toPostScript() const override;
  virtual double width() const override;
  virtual double height() const override;
private:
  const double _dx, _dy;
  std::unique_ptr<Shape> _shape;
};
