#ifndef FILE_HUFFCODE_H_INCLUDED
#define FILE_HUFFCODE_H_INCLUDED

#include <string>
using std::string;
#include <sstream>
using std::ostringstream;
#include <unordered_map>
using std::unordered_map;
#include <memory>
using std::shared_ptr;
using std::make_shared;
#include <queue>
using std::priority_queue;
#include <vector>
using std::vector;

struct Node {
	Node() {}
	Node(char key, int weight) : _key(key), _weight(weight) {}
	Node(const shared_ptr<Node> & lhs, const shared_ptr<Node> & rhs, int weight) : 
		_leftNode(lhs),
		_rightNode(rhs),
		_key(0),
		_weight(weight)
	{}

	shared_ptr<Node> _leftNode = nullptr, _rightNode = nullptr;
	char _key = 0;
	int _weight = 0;
};

// Class HuffCode
// Encoding & decoding using a Huffman code
class HuffCode {

// ***** HuffCode: ctors, dctor, op= *****
public:
    // Compiler-generated default ctor, copy ctor, copy =, dctor used

// ***** HuffCode: general public functions *****
public:
    void setWeights(const unordered_map<char, int> & theWeights);
    string encode(const string & text) const;
    string decode(const string & codestr) const;
    void map(Node & node, string code);

// ***** HuffCode: data members *****
private:
	Node _root;
	unordered_map<char, string> _encodemap;
};  // End class HuffCode

#endif //#ifndef FILE_HUFFCODE_H_INCLUDED
