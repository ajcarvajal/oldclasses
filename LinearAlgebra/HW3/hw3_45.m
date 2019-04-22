disp("----Question 45----\n")
clear

A = [-6 -3 6 1; -1 2 1 -6; 3 6 3 -2; 6 -3 6 -1; 2 -1 2 3; -3 6 3 2; -2 -1 2 -3; 1 2 1 6];

U = A/norm(A);

disp("U' * U = \n")
U' * U

disp("U * U' = \n")
U * U'

disp("U' * U is the 5x5 identity matrix. U * U' is a mess")

y = rand(8,1);

p = U * U' * y
z = y - p

disp("Part D: ")
y = [1;1;1;1;1;1;1;1];
span = U;
  m = columns(span);
  proj = zeros(size(span),1);
  
  for i=1:m
      u = span(:,i);
      proj = proj + ((y' * u) / (u' * u)) * u;
  end

proj



