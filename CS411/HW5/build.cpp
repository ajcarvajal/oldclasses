#include "build.hpp"

int countTolls(int w, int e, vector<Bridge> &bridges, vector<vector<int>> &tolls) {
    if(tolls[w][e] != -1) {
		return tolls[w][e];
	}

	int maxToll = 0;
	for(auto & i : bridges) {
		if(i[0] < w && i[1] < e) {
			maxToll = max(countTolls(i[0],i[1], bridges, tolls) + i[2], 
                            maxToll);
		}
	}

	tolls[w][e] = maxToll;
	return maxToll;
}


int build(int w, int e, const vector<Bridge> &bridges){
    
    auto bridgeSet = bridges;

    sort(bridgeSet.begin(),bridgeSet.end(), [&](auto lhs, auto rhs){
		    return lhs[0] < rhs[0] || lhs[0] == rhs[0] && lhs[1] < rhs[1];
	    });

	auto tolls = vector<vector<int>>(w+1, vector<int>(e+1, -1)); //-1 is default value for unchecked sets

    return countTolls(w, e, bridgeSet, tolls);

}