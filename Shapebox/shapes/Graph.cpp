#include "Graph.h"
#include <sstream>

Graph::Graph(unsigned short nodes) 
  : _nodes(nodes)
{}

std::string Graph::toPostScript() const
{
  std::ostringstream os;

  os
  << "gsave" << std::endl
  << "1 setlinewidth" << std::endl
  << "0 0 0 setrgbcolor" << std::endl
  << "/h 0 def" << std::endl
  << "1 1 " << _nodes << " {" << std::endl
  << "72 mul" << std::endl
  << "-100 1 index 5 0 360 arc stroke" << std::endl
  << "1 1 " << _nodes << " {" << std::endl
  << "72 mul" << std::endl
  << "-100 2 index moveto" << std::endl
  << "h 1 1 sethsbcolor" << std::endl
  << "/h h 0.04 add def" << std::endl
  << "100 1 index lineto stroke" << std::endl
  << "0 0 0 setrgbcolor " << std::endl
  << "100 exch 5 0 360 arc stroke" << std::endl
  << "} for" << std::endl
  << "pop" << std::endl
  << "} for" << std::endl
  << "grestore" << std::endl;

  return os.str();
}

double Graph::width() const
{
  return 200;
}

double Graph::height() const
{
  return 100 * _nodes;
}