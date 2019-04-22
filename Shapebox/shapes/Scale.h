#pragma once

#include "Shape.h"
#include <memory>

class Scale : public Shape
{
public:
  Scale(std::unique_ptr<Shape>, double scaleX, double scaleY);
  virtual std::string toPostScript() const override;
  virtual double width() const override;
  virtual double height() const override;
private:
  const std::unique_ptr<Shape> _shape;
  const double _scaleX, _scaleY;
};