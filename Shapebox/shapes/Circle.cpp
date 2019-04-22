#include "Circle.h"
#include <sstream>
#include <cmath>

Circle::Circle(double radius) 
  : _radius(std::abs(radius))
{}

std::string Circle::toPostScript() const
{
  std::ostringstream os;

  os << "gsave %<circle>\n" //compound shapes break if you dont have gsave and restore
    << "  0 0 " << _radius << " 0 360 arc stroke\n"
    << "grestore %</circle>\n";

  return os.str();
}

double Circle::width() const
{
  return 2 * _radius;
}

double Circle::height() const
{
  return 2 * _radius;
}