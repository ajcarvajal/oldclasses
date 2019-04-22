#include <vector>
using std::vector;
#include <iostream>
using std::cout;
using std::endl;
#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#include <cstring>
using std::memset;

#define INDEX  y * _width + x

class CAgrid {
	
private: //member variables
    int _height;
    int _width;
	int _padding;
	int _cellsize;
	int *m_output;
	int *m_state;
    vector<sf::RectangleShape> squares;

public: //constructors
	CAgrid(int width,int height, int cellsize, int padding):_width(width),_height(height),_cellsize(cellsize),_padding(padding) {setup();}
	CAgrid(int width,int height):CAgrid(width, height, 4, 1) {}
	CAgrid():CAgrid(200, 150, 4, 1){}


public: //operators, sets, gets
	void setup() {
		m_output = new int[_width * _height];
		m_state = new int[_width * _height];

		memset(m_output, 0, _width * _height * sizeof(int));
		memset(m_state, 0, _width * _height * sizeof(int));

        squares.resize(_width * _height);

        for(int x = 0; x < _width; ++x) {
        for(int y = 0; y < _height; ++y) {
            sf::RectangleShape pixel;
			pixel.setSize(sf::Vector2f(_cellsize,_cellsize));
            pixel.setFillColor(sf::Color::Black);
            pixel.setPosition(x*(_cellsize + _padding), y*(_cellsize+_padding));
            squares[INDEX] = pixel;
        }
    }


		//for (int i = 0; i < _width*_height; i++)
		//	m_state[i] = rand() % 2;

		auto set = [&](int x, int y, std::wstring s)
		{
			int p = 0;
			for (auto c : s)
			{
				m_state[INDEX + p] = c == L'#' ? 1 : 0;
				p++;
			}
		};

		
		// R-Pentomino
		//set(80, 50, L"  ## ");
		//set(80, 51, L" ##  ");
		//set(80, 52, L"  #  ");
		// Gosper Glider Gun
		//  set(60, 45, L"........................#............");
		//  set(60, 46, L"......................#.#............");
		//  set(60, 47, L"............##......##............##.");
		//  set(60, 48, L"...........#...#....##............##.");
		//  set(60, 49, L"##........#.....#...##...............");
		//  set(60, 50, L"##........#...#.##....#.#............");
		//  set(60, 51, L"..........#.....#.......#............");
		//  set(60, 52, L"...........#...#.....................");
		// set(60, 53, L"............##.......................");
		// Infinite Growth
		set(20, 50, L"########.#####...###......#######.#####");
		//set(30, 40, L"#####.#######......###...#####.########");
		
    }

	void set_height(int height) {_height = height;}
	void set_width(int width) {_width = width;}

	int get_height() {return _height;}
	int get_width() {return _width;}

	void draw(sf::RenderTexture & window) {
		for(auto i: squares) {
			window.draw(i);
		}
	}

	std::pair<u_int16_t,u_int16_t> get_gridsize() {
		return std::make_pair((u_int16_t)_width*(_cellsize+_padding),(u_int16_t)_height*(_cellsize+_padding));
	}

	void loop() {
		auto cell = [&](int x, int y)
		{
			return m_output[INDEX];
		};

		// Store output state
		for (int i = 0; i < _width*_height; i++) {
			m_output[i] = m_state[i];
		}
		
		for (int x = 1; x < _width - 1; x++) {
			for (int y = 1; y < _height - 1; y++) {
				int nNeighbours =	cell(x - 1, y - 1) + cell(x - 0, y - 1) + cell(x + 1, y - 1) +
									cell(x - 1, y + 0) +          0         + cell(x + 1, y + 0) +
									cell(x - 1, y +	1) + cell(x + 0, y + 1) + cell(x + 1, y + 1);

				if (cell(x, y) == 1) {
					m_state[INDEX] = nNeighbours == 2 || nNeighbours == 3;
					if (m_state[INDEX] == m_output[INDEX]) 
						squares[INDEX].setFillColor(sf::Color(111, 62, 209)); //purple
					else squares[INDEX].setFillColor(sf::Color(4, 206, 118)); //green
				} else {
					m_state[INDEX] = nNeighbours == 3;
					if (m_state[INDEX] == m_output[INDEX])
						squares[INDEX].setFillColor(sf::Color::Black);
					else squares[INDEX].setFillColor(sf::Color::Blue);
				}
            }
		}
	}
};

class CAgrid_holder {
private: //member variables
	CAgrid& _grid;
	vector<sf::ConvexShape> _sprites;
	sf::RenderTexture _rtexture;
	int _count;

public: //constructors
	CAgrid_holder(CAgrid& grid, int count):_grid(grid),_count(count){setup();}
	
	void setup() 
	{
		_sprites.resize(_count);
		auto grid_size = _grid.get_gridsize();
		_rtexture.create(grid_size.first, grid_size.second);
		const sf::Texture &texture = _rtexture.getTexture();

		sf::ConvexShape temp(5);
		
		int window_x = 1000;
		int window_y= 1000;
		int shape_x = window_x / 2;
		int shape_y = window_y / 2;

		temp.setPoint(0, sf::Vector2f(		0,				0));
		temp.setPoint(1, sf::Vector2f(		0,			shape_y));
		temp.setPoint(2, sf::Vector2f(	2* shape_x/3, 	shape_y));
		temp.setPoint(3, sf::Vector2f(	shape_x,		shape_y/2));
		temp.setPoint(4, sf::Vector2f(	2*shape_x/3,	 	0));
		texture.isRepeated();
		temp.setTexture(&texture,false);
		temp.setOrigin(shape_x/2,shape_y/2);
		temp.setPosition(window_x/2,window_y/2); //middle
		temp.move(-shape_x/2,0);
		_sprites[0] = temp;
		temp.rotate(180);
		temp.move(shape_x,0);
		_sprites[1] = temp;
		temp.move(-shape_x/2,2*shape_y/4);
		temp.rotate(90);
		_sprites[2] = temp;
		temp.move(0,-shape_y);
		temp.rotate(180);
		_sprites[3] = temp;
	}
public: //operator functions
	void loop(){_grid.loop();}
	
	void draw(sf::RenderWindow& window) {
		_rtexture.clear();
		_grid.draw(_rtexture);
		_rtexture.display();

		for(auto i: _sprites) {
			window.draw(i);
		}

	}
};

int main()
{
	CAgrid grid(160,100, 8,1);
	CAgrid_holder app(grid,4);
    sf::RenderWindow window(sf::VideoMode(1000, 1000, 8), "Cellular Automata Simulation");

    while (window.isOpen())
    {
		app.loop();
        sf::Event event;
        while (window.pollEvent(event))
        {
            if (event.type == sf::Event::Closed)
                window.close();
			if(event.type == sf::Event::KeyPressed)
				window.close();
        }
        window.clear();
		app.draw(window);
        window.display();
    }
    
    return 0;
} 