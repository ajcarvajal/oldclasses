#include "Scale.h"
#include <sstream>

Scale::Scale(std::unique_ptr<Shape> shape, double scaleX, double scaleY) 
  : _shape(std::move(shape)), _scaleX(scaleX), _scaleY(scaleY)
{}

std::string Scale::toPostScript() const 
{ 
  std::ostringstream os;

   os << "gsave %<scale> \n"
    << _scaleX << " " << _scaleY << " scale \n"
    << _shape->toPostScript() << " \n"
    << "grestore %</scale> \n";

  return os.str();
}

double Scale::width() const
{
  return _shape->width() * _scaleX;
}

double Scale::height() const
{
  return _shape->height() * _scaleY;
}