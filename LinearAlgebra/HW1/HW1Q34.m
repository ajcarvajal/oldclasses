disp("\nQuestion 34a)")
%create matrix of sample velocities(ft/sec) 0,2,4,6,8
%using the given equation p(t) = a + bt + ct^2 + ... + ft^5
A = [1 0 0 0 0 0; 2^0 2^1 2^2 2^3 2^4 2^5; 
      4^0 4^1 4^2 4^3 4^4 4^5; 6^0 6^1 6^2 6^3 6^4 6^5;
      8^0 8^1 8^2 8^3 8^4 8^5; 10^0 10^1 10^2 10^3 10^4 10^5]

%create vector of known Force values for 0,2,4,6,8
b = [0;2.9;14.8;39.6;74.3;119]

%fit the known values to our equation to find the constants
%solves Ax = b by taking the inverse and multiplying it by b
x = A \ b

%use these weights to estimate Force given a velocity of 750
C = [750^0 750^1 750^2 750^3 750^4 750^5]
D = C * x

disp("\nQuestion 34b)")
%if we try to use a different equation of a lower degree, we will have to use 
%less training examples, or else we get free variables and no solution

%to use a 3rd degree polynomial, we have to limit our data like so
y = A(1:4, 1:4) \ b(1:4)

%This gives us a presumably less accurate answer
Z = C(:, 1:4) * y