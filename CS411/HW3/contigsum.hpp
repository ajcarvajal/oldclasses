#ifndef CONTIGSUM_HPP
#define CONTIGSUM_HPP

#include <algorithm>
#include <numeric>
using std::accumulate;


//create container for recursive function to return
//A:GCS
//B:GCS using first element
//C:GCS using last element
//D:sum of set
struct partition{
	int GCS;
	int gcsFirst;
	int gcsLast;
	int sum;

	partition(int a, int b, int c, int d) : GCS(a), gcsFirst(b), gcsLast(c), sum(d) {}

	int maxOfSet() {
		return std::max<int>({GCS, gcsFirst, gcsLast, sum, 0}); //include a zero in case all are negative
	}
};

template<typename RAIter>
int contigSum(RAIter first, RAIter last){	
	if (last-first) {
		return contigSumRecurse(first,last).maxOfSet();
	}
	return 0;
}

template<typename RAIter>
partition contigSumRecurse(RAIter first, RAIter last) {
	if(last - first < 2) {
		return partition(*first, *first, *(last-1), accumulate(first,last,0));
	} else {
		RAIter mid = first + (last-first)/2;
		partition lhs = contigSumRecurse(first,mid);
		partition rhs = contigSumRecurse(mid,last);
		return partition(
			std::max<int>({lhs.gcsLast+rhs.gcsFirst,lhs.GCS,rhs.GCS}),
			std::max<int>({lhs.gcsFirst,lhs.sum + rhs.gcsFirst}),
			std::max<int>({lhs.gcsLast + rhs.sum,rhs.gcsLast}), lhs.sum + rhs.sum );
	}
}

#endif //CONTIGSUM_HPP