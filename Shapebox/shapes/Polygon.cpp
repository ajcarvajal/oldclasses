#include "Polygon.h"
#include <math.h>
#include <cmath>
#include <sstream>

#define _USE_MATH_DEFINES

Polygon::Polygon(unsigned short sides, double sideLength)
  : _sides(std::abs(sides)), _sideLength(std::abs(sideLength))
{
  if (_sides<3)
  {
    throw std::invalid_argument( "Polygons must have 3 or more sides" );
  }
}

std::string Polygon::toPostScript() const
{
  const double o = _sideLength/2, theta = 360/_sides*M_PI/180;
  const double a = o/std::tan(theta/2);
  std::ostringstream os;

  os 
  << "gsave % <polygon>" << std::endl
  << "newpath" << std::endl
  << "90 rotate" << std::endl
  // << "0 " << -((height()/2)-a) << " translate" << std::endl
  << _sides << " 4 dict begin" << std::endl
  << "/N exch def" << std::endl
  << "/A 360 N div def" << std::endl
  << a << " 0 moveto" << std::endl
  << "N {" << std::endl
  << a << " A cos mul " << a << " A sin mul lineto" << std::endl
  << "/A A 360 N div add def" << std::endl
  << "} repeat" << std::endl
  << "closepath" << std::endl
  << "end" << std::endl
  << "stroke" << std::endl
  << "grestore" << std::endl;

  return os.str();
}

double Polygon::width() const
{
  double n = 0;
  if (_sides%2!=0) { //_sides is odd
    n = _sideLength * 
      (std::sin(M_PI*(_sides-1)/(2 * _sides))/std::sin(M_PI/_sides));
  } else if (_sides%4==0) { //4 divides _sides
    n = _sideLength * (std::cos(M_PI/_sides)/std::sin(M_PI/_sides));
  } else if (_sides%2==0) { //2 divides _sides but 4 does not
    n = _sideLength/(std::sin(M_PI/_sides));
  }
  return n;
}

double Polygon::height() const
{
  double n = 0;
  if (_sides%2!=0) { //_sides is odd
    n = _sideLength * (1+std::cos(M_PI/_sides))/(2*std::sin(M_PI/_sides));
  } else if (_sides%4==0) { //4 divides _sides
    n = _sideLength * (std::cos(M_PI/_sides))/(std::sin(M_PI/_sides));
  } else if (_sides%2==0) { //2 divides _sides but 4 does not
    n = _sideLength * (std::cos(M_PI/_sides))/(std::sin(M_PI/_sides)) ;
  }
  return n;
}