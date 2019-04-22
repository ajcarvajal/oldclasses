// huffcode_test.cpp
// Glenn G. Chappell
// 29 Nov 2015
//
// For CS 411/611 Fall 2015
// Test program for class HuffCode
// Used in Assignment 6, Exercise A
//
// Modified 11/22/17
// Chris Hartman
// For CS 411 Fall 2017
//
// Modified 11/28/18
// Chris Hartman
// For CS 411 Fall 2018

// Includes for code to be tested
#include "huffcode.hpp"   // For class HuffCode
#include "huffcode.hpp"   // Double inclusion test

// Includes for testing package & code common to all test programs
#include <iostream>     // for std::cout, std::endl, std::cin
#include <string>       // for std::string
#include <stdexcept>    // for std::runtime_error

// Additional includes for this test program
#include <string>       // for std::string
#include <unordered_map>
// for std::unordered_map
#include <vector>       // for std::vector
#include <sstream>      // for std::ostringstream


// ************************************************************************
// Testing Package:
//     Class Tester - For Tracking Tests
// ************************************************************************


// class Tester
// For extremely simple unit testing.
// Keeps track of number of tests and number of passes.
// Use test (with success/failure parameter) to do a test.
// Get results with numTests, numPassed, numFailed, allPassed.
// Restart testing with reset.
// Invariants:
//     countTests_ == number of tests (calls to test) since last reset.
//     countPasses_ == number of times function test called with true param
//      since last reset.
//     0 <= countPasses_ <= countTests_.
//     tolerance_ >= 0.
class Tester {
   
   // ***** Tester: ctors, dctor, op= *****
public:
   
   // Default ctor
   // Sets countTests_, countPasses_ to zero, tolerance_ to given value
   // Pre: None.
   // Post:
   //     numTests == 0, countPasses == 0, tolerance_ == abs(theTolerance)
   // Does not throw (No-Throw Guarantee)
   Tester(double theTolerance = 0.0000001)
   :countTests_(0),
   countPasses_(0),
   tolerance_(theTolerance >= 0 ? theTolerance : -theTolerance)
   {}
   
   // Compiler-generated copy ctor, copy op=, dctor are used
   
   // ***** Tester: general public functions *****
public:
   
   // test
   // Handles single test, param indicates pass/fail
   // Pre: None.
   // Post:
   //     countTests_ incremented
   //     countPasses_ incremented if (success)
   //     Message indicating test name (if given)
   //      and pass/fail printed to cout
   // Does not throw (No-Throw Guarantee)
   //  - Assuming exceptions have not been turned on for cout.
   void test(bool success,
             const std::string & testName = "")
   {
      ++countTests_;
      if (success) ++countPasses_;
      
      std::cout << "    ";
      if (testName != "")
      {
         std::cout << "Test: "
         << testName
         << " - ";
      }
      std::cout << (success ? "passed" : "********** FAILED **********")
      << std::endl;
   }
   
   // ftest
   // Does single floating-point test.
   // Tests passes iff difference of first two values is <= tolerance.
   // Pre: None.
   // Post:
   //     countTests_ incremented
   //     countPasses_ incremented if (abs(val1-val2) <= tolerance_)
   //     Message indicating test name (if given)
   //      and pass/fail printed to cout
   // Does not throw (No-Throw Guarantee)
   void ftest(double val1,
              double val2,
              const std::string & testName = "")
   { test(val1-val2 <= tolerance_ && val2-val1 <= tolerance_, testName); }
   
   // reset
   // Resets *this to default constructed state
   // Pre: None.
   // Post:
   //     countTests_ == 0, countPasses_ == 0
   // Does not throw (No-Throw Guarantee)
   void reset()
   {
      countTests_ = 0;
      countPasses_ = 0;
   }
   
   // numTests
   // Returns the number of tests that have been done since last reset
   // Pre: None.
   // Post:
   //     return == countTests_
   // Does not throw (No-Throw Guarantee)
   int numTests() const
   { return countTests_; }
   
   // numPassed
   // Returns the number of tests that have passed since last reset
   // Pre: None.
   // Post:
   //     return == countPasses_
   // Does not throw (No-Throw Guarantee)
   int numPassed() const
   { return countPasses_; }
   
   // numFailed
   // Returns the number of tests that have not passed since last reset
   // Pre: None.
   // Post:
   //     return + countPasses_ == numTests_
   // Does not throw (No-Throw Guarantee)
   int numFailed() const
   { return countTests_ - countPasses_; }
   
   // allPassed
   // Returns true if all tests since last reset have passed
   // Pre: None.
   // Post:
   //     return == (countPasses_ == countTests_)
   // Does not throw (No-Throw Guarantee)
   bool allPassed() const
   { return countPasses_ == countTests_; }
   
   // setTolerance
   // Sets tolerance_ to given value
   // Pre: None.
   // Post:
   //     tolerance_ = abs(theTolerance)
   // Does not throw (No-Throw Guarantee)
   void setTolerance(double theTolerance)
   { tolerance_ = (theTolerance >= 0 ? theTolerance : -theTolerance); }
   
   // ***** Tester: data members *****
private:
   
   int countTests_;    // Number of tests done since last reset
   int countPasses_;   // Number of tests passed since last reset
   double tolerance_;  // Tolerance for floating-point near-equality tests
   
};  // end class Tester


// ************************************************************************
// Testing Package:
//     Class TypeCheck - Helper Class for Type Checking
// ************************************************************************


// class TypeCheck
// This class exists in order to have static member function check, which
// takes a parameter of a given type, by reference. Objects of type
// TypeCheck<T> cannot be created.
// Usage:
//     TypeCheck<MyType>::check(x)
//     returns true if the type of x is (MyType) or (const MyType),
//     otherwise false.
// Invariants: None.
// Requirements on Types: None.
template<typename T>
class TypeCheck {
   
private:
   
   // Uncopyable class. Do not define copy ctor, copy assn.
   TypeCheck(const TypeCheck &);
   TypeCheck<T> & operator=(const TypeCheck &);
   
   // Compiler-generated dctor is used (but irrelevant).
   
public:
   
   // check
   // The function and function template below simulate a single function
   // that takes a single parameter, and returns true iff the parameter has
   // type T or (const T).
   
   // check (reference-to-const T)
   // Pre: None.
   // Post:
   //     Return is true.
   // Does not throw (No-Throw Guarantee)
   static bool check(const T & param)
   { return true; }
   
   // check (reference-to-const non-T)
   // Pre: None.
   // Post:
   //     Return is false.
   // Requirements on types: None.
   // Does not throw (No-Throw Guarantee)
   template <typename OtherType>
   static bool check(const OtherType & param)
   { return false; }
   
};  // End class TypeCheck


// ************************************************************************
// Testing Package:
//     Class Counter - Helper Class for Counting Calls & Objects, Throwing
// ************************************************************************


// class Counter
// Item type for counting ctor, dctor, op= calls, counting existing
//  objects, and possibly throwing on copy. Has operator< (which always
//  returns false), allowing it to be the value type of a sorted container.
// If static member copyThrow_ is set, then copy ctor and copy assn throw
//  std::runtime_error. Exception object's "what" member is set to "C" by
//  the copy ctor and "A" by copy assn.
// Increments static data member ctorCount_ on default construction and
//  successful copy construction. Increments static data member assnCount_
//  on successful copy assignment. Increments static data member
//  dctorCount_ on destruction.
// Increments static data member existing_ on construction, and decrements
//  it on destruction.
// Static data member maxExisting_ is highest value of existing_ since last
//  reset, or start of program if reset has never been called.
// Invariants:
//     Counter::existing_ is number of existing objects of this class.
//     Counter::ctorCount_ is number of successful ctor calls since
//      most recent call to reset, or start of program if reset has never
//      been called.
//     Counter::dctorCount_ is (similarly) number of dctor calls.
//     Counter::assnCount_ is (similarly) number of copy assn calls.
//     Counter::maxExisting_ is (similarly) highest value existing_ has
//      assumed.
class Counter {
   
   // ***** Counter: Ctors, dctor, op= *****
public:
   
   // Default ctor
   // Pre: None.
   // Post:
   //     (ctorCount_ has been incremented.)
   //     (existing_ has been incremented.)
   // Does not throw (No-Throw Guarantee)
   Counter()
   {
      ++existing_;
      if (existing_ > maxExisting_)
         maxExisting_ = existing_;
      ++ctorCount_;
   }
   
   // Copy ctor
   // Throws std::runtime_error if copyThrow_.
   // Pre: None.
   // Post:
   //     (ctorCount_ has been incremented.)
   //     (existing_ has been incremented.)
   // May throw std::runtime_error
   // Strong Guarantee
   Counter(const Counter & other)
   {
      if (copyThrow_)
         throw std::runtime_error("C");
      ++existing_;
      if (existing_ > maxExisting_)
         maxExisting_ = existing_;
      ++ctorCount_;
   }
   
   // Copy assignment
   // Throws std::runtime_error if copyThrow_.
   // Pre: None.
   // Post:
   //     Return value is *this.
   //     (assnCount_ has been incremented.)
   // May throw std::runtime_error
   // Strong Guarantee
   Counter & operator=(const Counter & rhs)
   {
      if (copyThrow_)
         throw std::runtime_error("A");
      ++assnCount_;
      return *this;
   }
   
   // Dctor
   // Pre: None.
   // Post:
   //     (dctorCount_ has been incremented.)
   //     (existing_ has been decremented.)
   // Does not throw (No-Throw Guarantee)
   ~Counter()
   {
      --existing_;
      ++dctorCount_;
   }
   
   // ***** Counter: Functions dealing with count *****
public:
   
   // reset
   // Pre: None.
   // Post:
   //     maxExisting_ == existing_.
   //     ctorCount_ == 0.
   //     dctorCount_ == 0.
   //     assnCount_ == 0.
   //     copyThrow_ == shouldThrow.
   // Does not throw (No-Throw Guarantee)
   static void reset(bool shouldThrow = false)
   {
      maxExisting_ = existing_;
      ctorCount_ = 0;
      dctorCount_ = 0;
      assnCount_ = 0;
      copyThrow_ = shouldThrow;
   }
   
   // getExisting
   // Pre: None.
   // Post:
   //     return == existing_.
   // Does not throw (No-Throw Guarantee)
   static int getExisting()
   { return existing_; }
   
   // getMaxExisting
   // Pre: None.
   // Post:
   //     return == maxExisting_.
   // Does not throw (No-Throw Guarantee)
   static int getMaxExisting()
   { return maxExisting_; }
   
   // getCtorCount
   // Pre: None.
   // Post:
   //     return == ctorCount_.
   // Does not throw (No-Throw Guarantee)
   static int getCtorCount()
   { return ctorCount_; }
   
   // getDctorCount
   // Pre: None.
   // Post:
   //     return == dctorCount_.
   // Does not throw (No-Throw Guarantee)
   static int getDctorCount()
   { return dctorCount_; }
   
   // getAssnCount
   // Pre: None.
   // Post:
   //     return == assnCount_.
   // Does not throw (No-Throw Guarantee)
   static int getAssnCount()
   { return assnCount_; }
   
   // setCopyThrow
   // Pre: None.
   // Post:
   //     copyThrow_ == shouldThrow
   // Does not throw (No-Throw Guarantee)
   static void setCopyThrow(bool shouldThrow)
   { copyThrow_ = shouldThrow; }
   
   // ***** Counter: Data Members *****
private:
   
   static int existing_;     // # of existing objects
   static int maxExisting_;  // Max # of existing objects
   static int ctorCount_;    // # of successful (non-throwing) ctor calls
   static int dctorCount_;   // # of dctor calls
   static int assnCount_;    // # of successful (non-throwing) copy = calls
   static bool copyThrow_;   // true if copy operations (ctor, =) throw
   
};  // End class Counter

// Definition of static data member of class Counter
int Counter::existing_ = 0;
int Counter::maxExisting_ = 0;
int Counter::ctorCount_ = 0;
int Counter::dctorCount_ = 0;
int Counter::assnCount_ = 0;
bool Counter::copyThrow_ = false;


// operator< (Counter)
// Dummy-ish operator<, forming a strict weak order for Counter class
// Returns false (which is legal for a strict weak order; all objects of
//  type Counter are equivalent).
// Pre: None.
// Post:
//     Return value == false.
// Does not throw (No-Throw Guarantee)
bool operator<(const Counter & a,
               const Counter & b)
{ return false; }


// ************************************************************************
// Helper Functions/Classes/Types for This Test Program
// ************************************************************************


// matchPattern
// Pattern matching for Huffman-coded strings
bool matchPattern(const std::string & pattern,
                  const std::string & coded)
{
   size_t len = pattern.size();
   if (len != coded.size())
      return false;
   
   std::unordered_map<char, char> m;
   for (size_t i = 0; i != len; ++i)
   {
      char tc = coded[i];
      if (tc != '0' && tc != '1')
         return false;
      
      char pc = pattern[i];
      bool islower =  (pc >= 'a');
      char pcupper = islower ? char(pc - 'a' + 'A') : pc;
      
      char tcbase = islower ? char('1'-(tc-'0')) : tc;
      
      if (m.find(pcupper) != m.end())
      {
         if (tcbase != m[pcupper])
            return false;
      }
      else
      {
         m[pcupper] = tcbase;
      }
   }
   return true;
}


// ************************************************************************
// Test Suite Functions
// ************************************************************************


// test_HuffCode_types
// Test suite for class HuffCode: types
// Pre: None.
// Post:
//     Pass/fail status of tests have been registered with t.
//     Appropriate messages have been printed to cout.
// Does not throw (No-Throw Guarantee)
void test_HuffCode_types(Tester & t)
{
   std::cout << "Test Suite: class HuffCode - type checking"
   << std::endl;
   
   HuffCode h;
   const std::unordered_map<char, int> cw;
   h.setWeights(cw);
   const HuffCode & ch(h);
   
   // Return type of encode
   const std::string s = "";
   t.test(TypeCheck<std::string>::check(ch.encode(s)),
          "Return type of encode is string");
   
   // Return type of decode
   t.test(TypeCheck<std::string>::check(ch.decode("")),
          "Return type of decode is string");
}


// test_HuffCode_single
// Test suite for class HuffCode: single letter
// Pre: None.
// Post:
//     Pass/fail status of tests have been registered with t.
//     Appropriate messages have been printed to cout.
// Does not throw (No-Throw Guarantee)
void test_HuffCode_simple(Tester & t)
{
   std::cout << "Test Suite: class HuffCode - simple code"
   << std::endl;
   
   HuffCode h;
   std::unordered_map<char, int> w;
   w['a'] = 3;
   w['b'] = 2;
   w['c'] = 1;
   const std::unordered_map<char, int> & cw(w);
   h.setWeights(cw);
   
   std::string text, retval, pat, correct;
   bool result;
   
   // Encode empty text
   text = "";
   retval = h.encode(text);
   correct = "";
   result = (retval == correct);
   t.test(result, "encode empty text");
   if (!result)
   {
      std::cout << "        "
      << "Expecting: \"" << correct << "\"" << std::endl;
      std::cout << "        "
      << "Received:  \"" << retval << "\"" << std::endl;
   }
   
   // Encode all characters
   text = "abc";
   retval = h.encode(text);
   pat = "aAbAB";
   result = matchPattern(pat, retval);
   t.test(result, "encode all characters");
   if (!result)
   {
      std::cout << "        "
      << "Expecting: \"01011\" or \"01110\" or \"10001\" or \"10100\""
      << std::endl;
      std::cout << "        "
      << "Received:  \"" << retval << "\"" << std::endl;
      std::cout << "    "
      << "EXITING TEST SUITE" << std::endl;
      return;
   }
   
   std::vector<std::string> cwd;
   cwd.push_back(retval.substr(0, 1));
   cwd.push_back(retval.substr(1, 2));
   cwd.push_back(retval.substr(3, 2));
   
   // Encode single characters
   for (size_t i = 0; i != cwd.size(); ++i)
   {
      text = std::string(1, 'a'+char(i));
      retval = h.encode(text);
      correct = cwd[i];
      result = (retval == correct);
      std::ostringstream os1;
      os1 << i+1;
      t.test(result, "encode single-character text #" + os1.str());
      if (!result)
      {
         std::cout << "        "
         << "Expecting: \"" << correct << "\"" << std::endl;
         std::cout << "        "
         << "Received:  \"" << retval << "\"" << std::endl;
      }
   }
   
   // Encode longer text
   text = "aaabacbabbbccacbcc";
   retval = h.encode(text);
   correct = cwd[0]+cwd[0]+cwd[0]+cwd[1]+cwd[0]+cwd[2]
   +cwd[1]+cwd[0]+cwd[1]+cwd[1]+cwd[1]+cwd[2]
   +cwd[2]+cwd[0]+cwd[2]+cwd[1]+cwd[2]+cwd[2];
   result = (retval == correct);
   t.test(result, "encode longer text");
   if (!result)
   {
      std::cout << "        "
      << "Expecting: \"" << correct << "\"" << std::endl;
      std::cout << "        "
      << "Received:  \"" << retval << "\"" << std::endl;
   }
   
   // Decode empty text
   text = "";
   retval = h.decode(text);
   correct = "";
   result = (retval == correct);
   t.test(result, "decode empty text");
   if (!result)
   {
      std::cout << "        "
      << "Expecting: \"" << correct << "\"" << std::endl;
      std::cout << "        "
      << "Received:  \"" << retval << "\"" << std::endl;
   }
   
   // Decode single characters
   for (size_t i = 0; i != cwd.size(); ++i)
   {
      text = cwd[i];
      retval = h.decode(text);
      correct = std::string(1, 'a'+char(i));
      result = (retval == correct);
      std::ostringstream os1;
      os1 << i+1;
      t.test(result, "decode single-character text #" + os1.str());
      if (!result)
      {
         std::cout << "        "
         << "Expecting: \"" << correct << "\"" << std::endl;
         std::cout << "        "
         << "Received:  \"" << retval << "\"" << std::endl;
      }
   }
   
   // Decode longer text
   text = cwd[0]+cwd[1]+cwd[2]+cwd[0]+cwd[2]+cwd[1]
   +cwd[1]+cwd[0]+cwd[2]+cwd[1]+cwd[2]+cwd[0]
   +cwd[2]+cwd[0]+cwd[1]+cwd[2]+cwd[1]+cwd[0]
   +cwd[0]+cwd[0]+cwd[0]+cwd[1]+cwd[1]+cwd[1]
   +cwd[2]+cwd[2]+cwd[2];
   retval = h.decode(text);
   correct = "abcacbbacbcacabcbaaaabbbccc";
   result = (retval == correct);
   t.test(result, "decode longer text");
   if (!result)
   {
      std::cout << "        "
      << "Expecting: \"" << correct << "\"" << std::endl;
      std::cout << "        "
      << "Received:  \"" << retval << "\"" << std::endl;
   }}

// test_HuffCode_simple
// Test suite for class HuffCode: simple code
// Pre: None.
// Post:
//     Pass/fail status of tests have been registered with t.
//     Appropriate messages have been printed to cout.
// Does not throw (No-Throw Guarantee)
void test_HuffCode_single(Tester & t)
{
   std::cout << "Test Suite: class HuffCode - single letter"
   << std::endl;
   
   HuffCode h;
   std::unordered_map<char, int> w;
   w['a'] = 3;
   const std::unordered_map<char, int> & cw(w);
   h.setWeights(cw);
   
   std::string text, retval, pat, correct;
   bool result;
   
   // Encode empty text
   text = "";
   retval = h.encode(text);
   correct = "";
   result = (retval == correct);
   t.test(result, "encode empty text");
   if (!result)
   {
      std::cout << "        "
      << "Expecting: \"" << correct << "\"" << std::endl;
      std::cout << "        "
      << "Received:  \"" << retval << "\"" << std::endl;
   }
   
   // Encode the character
   text = "a";
   retval = h.encode(text);
   pat = "a";
   result = matchPattern(pat, retval);
   t.test(result, "encode the character");
   if (!result)
   {
      std::cout << "        "
      << "Expecting: \"0\" or \"1\""
      << std::endl;
      std::cout << "        "
      << "Received:  \"" << retval << "\"" << std::endl;
      std::cout << "    "
      << "EXITING TEST SUITE" << std::endl;
      return;
   }
   std::string cwd = retval;
   
   // Encode longer text
   text = "aaaa";
   retval = h.encode(text);
   correct=cwd+cwd+cwd+cwd;
   result = (retval == correct);
   t.test(result, "encode longer text");
   if (!result)
   {
      std::cout << "        "
      << "Expecting: \"" << correct << "\"" << std::endl;
      std::cout << "        "
      << "Received:  \"" << retval << "\"" << std::endl;
   }
   
   // Decode empty text
   text = "";
   retval = h.decode(text);
   correct = "";
   result = (retval == correct);
   t.test(result, "decode empty text");
   if (!result)
   {
      std::cout << "        "
      << "Expecting: \"" << correct << "\"" << std::endl;
      std::cout << "        "
      << "Received:  \"" << retval << "\"" << std::endl;
   }
   
}


// test_HuffCode_complex
// Test suite for class HuffCode: complex code
// Pre: None.
// Post:
//     Pass/fail status of tests have been registered with t.
//     Appropriate messages have been printed to cout.
// Does not throw (No-Throw Guarantee)
void test_HuffCode_complex(Tester & t)
{
   std::cout << "Test Suite: class HuffCode - complex code"
   << std::endl;
   
   HuffCode h;
   std::unordered_map<char, int> w;
   w['a'] = 2;
   w['b'] = 20;
   w['c'] = 3;
   w['d'] = 8;
   w['e'] = 12;
   w['f'] = 3;
   w['g'] = 8;
   w['h'] = 2;
   w['i'] = 7;
   w['j'] = 5;
   h.setWeights(w);
   
   std::string text, retval, pat, correct;
   bool result;
   
   // Encode empty text
   text = "";
   retval = h.encode(text);
   correct = "";
   result = (retval == correct);
   t.test(result, "encode empty text");
   
   // Encode all characters
   text = "abcdefghij";
   retval = h.encode(text);
   pat = "ihFcAiHIGDbIgEihfIGDBIgeihFcaIGdihFC";
   result = matchPattern(pat, retval);
   t.test(result, "encode all characters");
   if (!result)
   {
      std::cout << "    "
      << "EXITING TEST SUITE" << std::endl;
      return;
   }
   
   std::vector<std::string> cwd;
   cwd.push_back(retval.substr(0, 5));
   cwd.push_back(retval.substr(5, 2));
   cwd.push_back(retval.substr(7, 4));
   cwd.push_back(retval.substr(11, 3));
   cwd.push_back(retval.substr(14, 3));
   cwd.push_back(retval.substr(17, 4));
   cwd.push_back(retval.substr(21, 3));
   cwd.push_back(retval.substr(24, 5));
   cwd.push_back(retval.substr(29, 3));
   cwd.push_back(retval.substr(32, 4));
   
   // Encode single characters
   for (size_t i = 0; i != cwd.size(); ++i)
   {
      text = std::string(1, 'a'+char(i));
      retval = h.encode(text);
      correct = cwd[i];
      result = (retval == correct);
      std::ostringstream os1;
      os1 << i+1;
      t.test(result, "encode single-character text #" + os1.str());
   }
   
   // Encode longer text
   text = "ajabcffhcdihgjihgfedcba";
   retval = h.encode(text);
   correct = cwd[0]+cwd[9]+cwd[0]+cwd[1]+cwd[2]+cwd[5]+cwd[5]+cwd[7]
   +cwd[2]+cwd[3]+cwd[8]+cwd[7]+cwd[6]+cwd[9]+cwd[8]+cwd[7]
   +cwd[6]+cwd[5]+cwd[4]+cwd[3]+cwd[2]+cwd[1]+cwd[0];
   result = (retval == correct);
   t.test(result, "encode longer text");
   
   // Decode empty text
   text = "";
   retval = h.decode(text);
   correct = "";
   result = (retval == correct);
   t.test(result, "decode empty text");
   
   // Decode single characters
   for (size_t i = 0; i != cwd.size(); ++i)
   {
      text = cwd[i];
      retval = h.decode(text);
      correct = std::string(1, 'a'+char(i));
      result = (retval == correct);
      std::ostringstream os1;
      os1 << i+1;
      t.test(result, "decode single-character text #" + os1.str());
      if (!result)
      {
         std::cout << "        "
         << "Expecting: \"" << correct << "\"" << std::endl;
         std::cout << "        "
         << "Received:  \"" << retval << "\"" << std::endl;
      }
   }
   
   // Decode longer text
   text = cwd[6]+cwd[9]+cwd[0]+cwd[8]+cwd[9]+cwd[9]+cwd[3]+cwd[3]+cwd[3]
   +cwd[4]+cwd[8]+cwd[9]+cwd[2]+cwd[6]+cwd[1]+cwd[7]+cwd[4]+cwd[0]
   +cwd[5]+cwd[1]+cwd[5]+cwd[0]+cwd[2]+cwd[8]+cwd[8]+cwd[8];
   retval = h.decode(text);
   correct = "gjaijjdddeijcgbheafbfaciii";
   result = (retval == correct);
   t.test(result, "decode longer text");
}


// test_HuffCode_copy
// Test suite for class HuffCode: copying
// Pre: None.
// Post:
//     Pass/fail status of tests have been registered with t.
//     Appropriate messages have been printed to cout.
// Does not throw (No-Throw Guarantee)
void test_HuffCode_copy(Tester & t)
{
   std::cout << "Test Suite: class HuffCode - copying HuffCode object"
   << std::endl;
   
   HuffCode h;
   std::unordered_map<char, int> w;
   w['a'] = 3;
   w['b'] = 2;
   w['c'] = 1;
   h.setWeights(w);
   const HuffCode ch(h);
   
   std::string text, retval, pat, correct;
   bool result;
   
   // Encode all characters
   text = "abc";
   retval = ch.encode(text);
   pat = "aAbAB";
   result = matchPattern(pat, retval);
   t.test(result, "copy, encode all characters");
   if (!result)
   {
      std::cout << "        "
      << "Expecting: \"01011\" or \"01110\" or \"10001\" or \"10100\""
      << std::endl;
      std::cout << "        "
      << "Received:  \"" << retval << "\"" << std::endl;
      std::cout << "    "
      << "EXITING TEST SUITE" << std::endl;
      return;
   }
   
   std::vector<std::string> cwd;
   cwd.push_back(retval.substr(0, 1));
   cwd.push_back(retval.substr(1, 2));
   cwd.push_back(retval.substr(3, 2));
   
   // Encode text
   text = "aaabacbabbbccacbcc";
   retval = ch.encode(text);
   correct = cwd[0]+cwd[0]+cwd[0]+cwd[1]+cwd[0]+cwd[2]
   +cwd[1]+cwd[0]+cwd[1]+cwd[1]+cwd[1]+cwd[2]
   +cwd[2]+cwd[0]+cwd[2]+cwd[1]+cwd[2]+cwd[2];
   result = (retval == correct);
   t.test(result, "copy, encode text");
   if (!result)
   {
      std::cout << "        "
      << "Expecting: \"" << correct << "\"" << std::endl;
      std::cout << "        "
      << "Received:  \"" << retval << "\"" << std::endl;
   }
   
   // Decode text
   text = cwd[0]+cwd[1]+cwd[2]+cwd[0]+cwd[2]+cwd[1]
   +cwd[1]+cwd[0]+cwd[2]+cwd[1]+cwd[2]+cwd[0]
   +cwd[2]+cwd[0]+cwd[1]+cwd[2]+cwd[1]+cwd[0]
   +cwd[0]+cwd[0]+cwd[0]+cwd[1]+cwd[1]+cwd[1]
   +cwd[2]+cwd[2]+cwd[2];
   retval = ch.decode(text);
   correct = "abcacbbacbcacabcbaaaabbbccc";
   result = (retval == correct);
   t.test(result, "copy, decode text");
   if (!result)
   {
      std::cout << "        "
      << "Expecting: \"" << correct << "\"" << std::endl;
      std::cout << "        "
      << "Received:  \"" << retval << "\"" << std::endl;
   }
}


// test_class_HuffCode
// Test suite for class HuffCode
// Uses other test-suite functions
// Pre: None.
// Post:
//     Pass/fail status of tests have been registered with t.
//     Appropriate messages have been printed to cout.
// Does not throw (No-Throw Guarantee)
void test_class_HuffCode(Tester & t)
{
   // Do all the test suites
   std::cout << "TEST SUITES FOR CLASS HuffCode" << std::endl;
   test_HuffCode_types(t);
   test_HuffCode_single(t);
   test_HuffCode_simple(t);
   test_HuffCode_complex(t);
   test_HuffCode_copy(t);
}


// ************************************************************************
// Main program
// ************************************************************************


// main
// Runs class HuffCode test suite, prints results to cout.
int main()
{
   Tester t;
   test_class_HuffCode(t);
   
   std::cout << std::endl;
   if (t.allPassed())
   {
      std::cout << "All tests successful"
      << std::endl;
   }
   else
   {
      std::cout << "Tests ********** UNSUCCESSFUL **********"
      << std::endl;
   }
   std::cout << std::endl;
   
   // Wait for user
   std::cout << "Press ENTER to quit ";
   while (std::cin.get() != '\n') ;
   
   return 0;
}

