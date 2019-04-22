#include "huffcode.hpp" 

void HuffCode::setWeights(const unordered_map<char, int> & weights)
{
    auto compare = [&](auto lhs, auto rhs) {return lhs._weight > rhs._weight;};
	priority_queue<Node, vector<Node>, decltype(compare)> weight_queue(compare);

	for(auto & i : weights) {
		weight_queue.push( Node(i.first, i.second) );
    }

    //special case that could probably be solved by rewriting the while loop below
    //root node is usually "", but if theres only 1 char to encode, root is that char
    if(weight_queue.size() == 1) {
        auto left = weight_queue.top();
        _root = weight_queue.top();
        weight_queue.pop();
        Node right(0,0);
        Node newNode(make_shared<Node>(left), make_shared<Node>(right), left._weight); 
        weight_queue.push(newNode);
    }
    
	while(weight_queue.size() > 1){
        auto left = weight_queue.top();
		weight_queue.pop();

        auto right = weight_queue.top();
        weight_queue.pop();

        Node newNode(make_shared<Node>(left), make_shared<Node>(right), left._weight + right._weight);
		weight_queue.push(newNode);
	}

	if(weight_queue.size() > 0) {
		_root = weight_queue.top();
        weight_queue.pop();
	}

	map(_root, "");
}

string HuffCode::encode(const string & text) const
{
	ostringstream result;

	for(auto i: text){
		result << _encodemap.find(i)->second;
	}

	return result.str();
}

string HuffCode::decode(const string & codestr) const
{
	auto node = _root;
	auto it = codestr.begin();
    ostringstream plaintext;

	do {
		if((*it) == '0'){
			node = *node._leftNode;
			it++;
		} else if ((*it) == '1') {
			node = *node._rightNode;
			it++;
		}

		if( node._key != 0 ) {
			plaintext << node._key;
			node = _root;
			continue;
		}

	} while(it != codestr.end());

	return plaintext.str();
}

void HuffCode::map(Node & node, string code) {
	if (node._weight > 0) {
        if(node._key == 0 ) {
            map( *(node._leftNode), code + "0");
            map( *(node._rightNode), code + "1");
        } else {
            _encodemap.insert({ node._key, code });
        }
    }
}