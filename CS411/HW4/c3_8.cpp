#include <iostream>
using std::cout, std::endl;
#include <string>
using std::string;

int findSubstrings_brute(string input, char t1, char t2) {
    int ss_count = 0;

    for (int i = 0; i < input.size(); ++i) {
        if(input[i] == t1) {
            for(int j = i+1; j < input.size(); ++j) {
                if(input[j] == t2) ss_count++;
    }}}
    return ss_count;
}


int findSubstrings(string input, char t1, char t2) {
    int t1_count = 0;
    int ss_count = 0;

    for(auto i: input){
        if(i == t1) t1_count++;
        else if(i == t2) ss_count += t1_count;
    }
    return ss_count;
}


int main() {
    cout<<findSubstrings_brute("CABAAXBYA", 'A', 'B')<<endl;
    cout<<findSubstrings("CABAAXBYA", 'A', 'B')<<endl;
    return 0;
}

