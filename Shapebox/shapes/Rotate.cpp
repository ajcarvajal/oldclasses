#include "Rotate.h"
#include <sstream>

Rotate::Rotate(std::unique_ptr<Shape> shape, double angle) 
  : _shape(std::move(shape)), _angle(angle)
{
  if (angle != 90 && angle != 180 && angle != 270 && _angle != 0)
    throw std::invalid_argument( "Angle must be 0, 90, 180, or 270." );
}

std::string Rotate::toPostScript() const
{
  std::ostringstream os;
  os << "gsave %<rotate> \n"
    << _angle << " rotate \n"
    //<< -width() / 2 << "  " << -height() / 2 << " rmoveto \n"  //move to origin
    << _shape->toPostScript()
    << "grestore %</rotate> \n";

  return os.str();
}

double Rotate::width() const 
{
  if (_angle == 90 || _angle == 270)
  {
    return _shape->height();
  }
  return _shape->height();
}

double Rotate::height() const 
{
    if (_angle == 90 || _angle == 270)
  {
    return _shape->width();
  }
  return _shape->height();
}