#include "Translate.h"
#include <sstream>

Translate::Translate(double dx, double dy, std::unique_ptr<Shape> shape)
  : _dx(dx), _dy(dy), _shape(std::move(shape))
{}

std::string Translate::toPostScript() const 
{
  std::ostringstream os;

  os 
  << "gsave %<Translate>" << std::endl
  << _dx << " " << _dy << " translate" << std::endl
  << _shape->toPostScript() << std::endl
  << "grestore %</Translate>" << std::endl;

  return os.str();
}

double Translate::width() const
{
  return _shape->width();
}

double Translate::height() const
{
  return _shape->height();
}