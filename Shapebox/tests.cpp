
#define CATCH_CONFIG_MAIN

#include <iostream>
#include <vector>
#include <memory>
#include <fstream>

#include "catch.hpp"

#include "shapes/Shape.h"
#include "shapes/Rectangle.h"
#include "shapes/Spacer.h"
#include "shapes/Square.h"
#include "shapes/Circle.h"
#include "shapes/Polygon.h"
#include "shapes/Triangle.h"
#include "shapes/Vertical.h"
#include "shapes/Horizontal.h"
#include "shapes/Scale.h"
#include "shapes/Rotate.h"
#include "shapes/Layered.h"
#include "shapes/Translate.h"
#include "shapes/Page.h"
#include "shapes/Graph.h"

// Calls toPostScript on shape and writes it to "testPS/<fname>.ps" for viewing.
void write_ps_file(std::string fname, std::unique_ptr<Shape> shape)
{
  std::ofstream ofs;
  std::unique_ptr<Translate> tptr = 
    std::make_unique<Translate>(72*3, 72*3, std::move(shape));
  Page pg(std::move(tptr));

  ofs.open("testPS/"+fname+".ps", std::ofstream::out | std::ofstream::trunc);
  ofs << pg.toPostScript();
  ofs.close();
}

TEST_CASE( "Rectangle", "[Rectangle]" ) {
  REQUIRE (Rectangle(2,4).height() == 4);
  REQUIRE (Rectangle(2,4).width() == 2);
  REQUIRE (Rectangle(-2,-4).width() == 2);

  write_ps_file("rectangle", std::make_unique<Rectangle>(72,144));
}

TEST_CASE( "Spacer", "[Spacer]" ) {
  REQUIRE (Spacer(72,144).width() == 72);
  REQUIRE (Spacer(72,144).height() == 144);
  REQUIRE (Spacer(72,144).toPostScript() == "");
}

TEST_CASE( "Square", "[Square]" ) {
  REQUIRE (Square(72).width() == 72);
  REQUIRE (Square(72).height() == 72);
  REQUIRE (Square(-72).height() == 72);
  write_ps_file("square", std::make_unique<Square>(72));
}

TEST_CASE( "Circle", "[Circle]" ) {
  REQUIRE (Circle(72).width() == 144);
  REQUIRE (Circle(72).width() == Circle(72).height());
  write_ps_file("circle", std::make_unique<Circle>(72));
} 

TEST_CASE( "Polygon", "[Polygon]" ) {
  REQUIRE (int(Polygon(4, 72).width()) == 72);
  REQUIRE (int(Polygon(4, 72).height()) == 72);
  REQUIRE_THROWS (Polygon(2, 72));
  write_ps_file("polygon", std::make_unique<Polygon>(7,72));
}

TEST_CASE( "Triangle", "[Triangle]" ) {
  REQUIRE (int(Triangle(72).width()) == 72);
  REQUIRE (int(Triangle(72).height()) == 62);
  write_ps_file("triangle", std::make_unique<Triangle>(72));
} 

TEST_CASE( "Vertical", "[Vertical]" ) {
  std::vector<std::unique_ptr<Shape>> vec,vec2;
  for (int i = 0; i < 10; i++)
  {
    vec.push_back(std::move(std::make_unique<Circle>(72)));
  }

  Vertical vert(vec);
  REQUIRE (vert.width() == 72*2);
  REQUIRE (vert.height() == 72*2*10);

  for (int i = 0; i < 10; i++)
  {
    vec2.push_back(std::move(std::make_unique<Circle>(10)));
  }
  write_ps_file("vertical", std::make_unique<Vertical>(vec2));
} 

TEST_CASE( "Horizontal", "[Horizontal]" ) {
  std::vector<std::unique_ptr<Shape>> vec, vec2;
  for (int i = 0; i < 10; i++)
  {
    vec.push_back(std::move(std::make_unique<Polygon>(i+3,72/4)));
  }
  Horizontal horz(vec);
  
  REQUIRE (int(horz.width()) == 425);
  REQUIRE (int(horz.height()) == 67);

  for (int i = 0; i < 10; i++)
  {
    vec2.push_back(std::move(std::make_unique<Polygon>(i+3,72/4)));
  }
  write_ps_file("horizontal", std::make_unique<Horizontal>(vec2));
} 

TEST_CASE( "Scale", "[Scale]" ) {
  Scale sc(std::make_unique<Circle>(72), 2, 2);
  REQUIRE (sc.width() == 72*4);
  Scale sp(std::make_unique<Polygon>(5,72), 2, 4);
  REQUIRE (int(sp.width()) == 232);
  write_ps_file("scale", 
    std::make_unique<Scale>(std::make_unique<Circle>(72), 2, 2));
}

TEST_CASE( "Rotate", "[Rotate]" ) {
  Rotate rr(std::make_unique<Rectangle>(72,144), 90);
  REQUIRE (rr.width() == 144);
  REQUIRE (rr.height() == 72);
  REQUIRE_THROWS (Rotate(std::make_unique<Rectangle>(72,144), 27));
  write_ps_file("rotate", 
    std::make_unique<Rotate>(std::make_unique<Rectangle>(72,144), 90));
}

TEST_CASE( "Layered", "[Layered]" ) {
  std::vector<std::unique_ptr<Shape>> vec,vec2;
  for (int i = 0; i < 10; i++)
  {
    vec.push_back(std::move(std::make_unique<Circle>(36*i)));
  }
  Layered l(vec);
  REQUIRE (l.width() == 36*9*2);

  for (int i = 0; i < 10; i++)
  {
    vec2.push_back(std::move(std::make_unique<Polygon>(i+3, 72/4)));
  }
  write_ps_file("layered", std::make_unique<Layered>(vec2));
}

TEST_CASE( "Graph", "[Graph]" ) {
  REQUIRE(Graph(10).width() == 200);
  REQUIRE(Graph(10).height() == 1000);

  write_ps_file("graph", std::make_unique<Graph>(5));
}
